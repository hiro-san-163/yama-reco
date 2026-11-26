from __future__ import annotations

import json
import math
import os
import re
import tempfile
from datetime import date, datetime, timedelta
from pathlib import Path
from typing import Any

from openpyxl import Workbook, load_workbook
from openpyxl.styles import Alignment, Font, PatternFill
from openpyxl.utils.datetime import from_excel


FIELDS = (
    "date_s",
    "date_e",
    "duration",
    "record_id",
    "title",
    "area",
    "genre",
    "members",
    "weather",
    "course_time",
    "course_note",
    "summary",
    "sm2",
    "yamareco_url",
    "map",
    "tm",
    "tmfg",
    "gp1",
    "gpfg1",
    "gp2",
    "gpfg2",
    "gp3",
    "gpfg3",
)

SOURCE_COLUMNS = {
    "日程": "schedule",
    "場所": "title",
    "エリア": "area",
    "ジャンル": "genre",
    "メンバー": "members",
    "天気": "weather",
    "コースタイム": "course_time",
    "コース状況及びその他情報": "course_note",
    "感想": "summary",
    "記録ページのURL": "yamareco_url",
}

RECORD_ID_RE = re.compile(r"detail-([0-9]{5,10})\.html", re.IGNORECASE)
DATE_PART_RE = re.compile(
    r"^(?:(?P<year>[0-9]{4})\s*(?:年|[./-])\s*)?"
    r"(?:(?P<month>[0-9]{1,2})\s*(?:月|[./-])\s*)?"
    r"(?P<day>[0-9]{1,2})\s*日?$"
)
DATE_RANGE_RE = re.compile(r"\s*(?:～|〜|~|から)\s*")
SIGNATURE_RE = re.compile(r"\[[^\]\r\n]+\]\s*--")


class WorkflowError(ValueError):
    """Raised when an input does not match the record workflow schema."""


def is_blank(value: Any) -> bool:
    if value is None:
        return True
    if isinstance(value, str):
        return value.strip() == ""
    if isinstance(value, float) and math.isnan(value):
        return True
    return False


def text_value(value: Any) -> str:
    if is_blank(value):
        return ""
    if isinstance(value, datetime):
        return value.date().isoformat()
    if isinstance(value, date):
        return value.isoformat()
    return str(value)


def _parse_date_part(
    value: str, default_year: int | None = None, default_month: int | None = None
) -> date:
    match = DATE_PART_RE.fullmatch(value.strip())
    if match is None:
        raise WorkflowError(f"Unrecognized date value: {value!r}.")

    year_text = match.group("year")
    month_text = match.group("month")
    day = int(match.group("day"))
    year = int(year_text) if year_text else default_year
    month = int(month_text) if month_text else default_month
    if year is None or month is None:
        raise WorkflowError(f"Date is missing a year or month: {value!r}.")
    try:
        return date(year, month, day)
    except ValueError as error:
        raise WorkflowError(f"Invalid date {value!r}: {error}") from error


def parse_schedule(value: Any, workbook_epoch: Any) -> tuple[date, date | None]:
    """Parse a single date or a Japanese date range from a workbook cell."""
    if is_blank(value):
        raise WorkflowError("The schedule/date cell is empty.")

    if isinstance(value, datetime):
        return value.date(), None
    if isinstance(value, date):
        return value, None
    if isinstance(value, (int, float)) and not isinstance(value, bool):
        try:
            converted = from_excel(value, workbook_epoch)
        except (OverflowError, TypeError, ValueError) as error:
            raise WorkflowError(f"Invalid Excel date serial {value!r}.") from error
        if isinstance(converted, datetime):
            return converted.date(), None
        if isinstance(converted, date):
            return converted, None
        raise WorkflowError(f"Excel serial did not resolve to a date: {value!r}.")

    schedule = str(value).strip()
    parts = DATE_RANGE_RE.split(schedule, maxsplit=1)
    start = _parse_date_part(parts[0])
    if len(parts) == 1:
        return start, None

    end = _parse_date_part(parts[1], default_year=start.year, default_month=start.month)
    if end < start:
        raise WorkflowError(
            f"End date {end.isoformat()} is before start date {start.isoformat()}."
        )
    return start, end


def clean_summary(value: Any) -> str:
    return SIGNATURE_RE.sub("", text_value(value))


def extract_record_id(url: str) -> str:
    match = RECORD_ID_RE.search(url)
    if match is None:
        raise WorkflowError(f"Could not extract a record ID from {url!r}.")
    return match.group(1)


def validate_record(record: dict[str, Any], require_sm2: bool = False) -> None:
    missing = [field for field in FIELDS if field not in record]
    if missing:
        raise WorkflowError("Missing record fields: " + ", ".join(missing))

    record_id = text_value(record["record_id"])
    if not re.fullmatch(r"[0-9]{5,10}", record_id):
        raise WorkflowError(f"Invalid record_id: {record_id!r}.")

    for field in ("date_s", "date_e"):
        value = text_value(record[field])
        if value:
            if not re.fullmatch(r"[0-9]{4}-[0-9]{2}-[0-9]{2}", value):
                raise WorkflowError(
                    f"{field} must use YYYY-MM-DD format; got {value!r}."
                )
            try:
                date.fromisoformat(value)
            except ValueError as error:
                raise WorkflowError(
                    f"{field} must use YYYY-MM-DD format; got {value!r}."
                ) from error

    if not text_value(record["date_s"]):
        raise WorkflowError(f"record_id {record_id} has no date_s.")

    duration = record["duration"]
    if isinstance(duration, bool) or not isinstance(duration, int) or duration < 1:
        raise WorkflowError(f"duration must be a positive integer for {record_id}.")

    start = date.fromisoformat(text_value(record["date_s"]))
    end_text = text_value(record["date_e"])
    expected_duration = (
        (date.fromisoformat(end_text) - start).days + 1 if end_text else 1
    )
    if duration != expected_duration:
        raise WorkflowError(
            f"duration for {record_id} is {duration}; expected {expected_duration}."
        )

    url = text_value(record["yamareco_url"])
    if url:
        try:
            url_record_id = extract_record_id(url)
        except WorkflowError:
            raise
        if url_record_id != record_id:
            raise WorkflowError(
                f"record_id {record_id} does not match yamareco_url ID {url_record_id}."
            )

    for field in FIELDS:
        if field == "duration":
            continue
        value = record[field]
        if value is None:
            record[field] = ""
        elif not isinstance(value, str):
            raise WorkflowError(f"{field} must be text for record {record_id}.")

    if require_sm2:
        sm2 = record["sm2"].strip()
        if not 180 <= len(sm2) <= 230:
            raise WorkflowError(
                f"sm2 for {record_id} must be 180-230 characters; got {len(sm2)}."
            )


def _open_workbook(path: Path):
    try:
        workbook = load_workbook(path, read_only=True, data_only=False)
    except (OSError, ValueError) as error:
        raise WorkflowError(f"Could not open workbook {path}: {error}") from error
    if len(workbook.worksheets) != 1:
        workbook.close()
        raise WorkflowError(
            f"Expected exactly one worksheet in {path}, found {len(workbook.worksheets)}."
        )
    return workbook


def _header_columns(header_cells: tuple[Any, ...], source: bool) -> dict[str, int]:
    columns: dict[str, int] = {}
    seen: set[str] = set()
    source_to_field = SOURCE_COLUMNS if source else None
    for index, cell in enumerate(header_cells):
        value = cell.value
        if is_blank(value):
            continue
        if not isinstance(value, str):
            raise WorkflowError(f"Header in column {index + 1} must be text.")
        if value in seen:
            raise WorkflowError(f"Duplicate header: {value!r}.")
        seen.add(value)
        if source:
            if value not in source_to_field:
                continue
            columns[source_to_field[value]] = index
        elif value in FIELDS:
            columns[value] = index

    required = set(SOURCE_COLUMNS.values()) if source else set(FIELDS)
    missing = required - set(columns)
    if missing:
        raise WorkflowError(
            "Missing required columns: " + ", ".join(sorted(missing))
        )
    return columns


def read_source_rows(path: Path) -> tuple[Any, list[dict[str, Any]]]:
    workbook = _open_workbook(path)
    worksheet = workbook.worksheets[0]
    rows = worksheet.iter_rows(values_only=False)
    header = next(rows, None)
    if header is None:
        workbook.close()
        raise WorkflowError(f"The worksheet is empty: {path}")
    columns = _header_columns(header, source=True)

    records: list[dict[str, Any]] = []
    try:
        for row_number, cells in enumerate(rows, start=2):
            values = {
                field: (cells[index].value if index < len(cells) else None)
                for field, index in columns.items()
            }
            if all(is_blank(value) for value in values.values()):
                continue
            for field, index in columns.items():
                cell = cells[index] if index < len(cells) else None
                if cell is not None and cell.data_type == "f":
                    raise WorkflowError(
                        f"Formula cells are not supported ({cell.coordinate})."
                    )
            values["_row_number"] = row_number
            records.append(values)
    finally:
        workbook.close()
    if not records:
        raise WorkflowError(f"The worksheet contains no records: {path}")
    return workbook.epoch, records


def read_normalized_workbook(path: Path) -> list[dict[str, Any]]:
    workbook = _open_workbook(path)
    worksheet = workbook.worksheets[0]
    rows = worksheet.iter_rows(values_only=False)
    header = next(rows, None)
    if header is None:
        workbook.close()
        raise WorkflowError(f"The worksheet is empty: {path}")
    columns = _header_columns(header, source=False)
    records: list[dict[str, Any]] = []
    seen_ids: set[str] = set()
    try:
        for row_number, cells in enumerate(rows, start=2):
            raw: dict[str, Any] = {}
            for field, index in columns.items():
                cell = cells[index] if index < len(cells) else None
                if cell is not None and cell.data_type == "f":
                    raise WorkflowError(
                        f"Formula cells are not supported ({cell.coordinate})."
                    )
                raw[field] = None if cell is None else cell.value
            if all(is_blank(value) for value in raw.values()):
                continue

            record: dict[str, Any] = {}
            for field in FIELDS:
                value = raw.get(field)
                if field == "duration":
                    if isinstance(value, bool) or not isinstance(value, (int, float)):
                        raise WorkflowError(
                            f"duration must be numeric in row {row_number}."
                        )
                    if int(value) != value:
                        raise WorkflowError(
                            f"duration must be an integer in row {row_number}."
                        )
                    record[field] = int(value)
                else:
                    record[field] = text_value(value)
            try:
                validate_record(record)
            except WorkflowError as error:
                raise WorkflowError(f"Invalid row {row_number}: {error}") from error
            record_id = record["record_id"]
            if record_id in seen_ids:
                raise WorkflowError(
                    f"Duplicate record_id {record_id!r} in row {row_number}."
                )
            seen_ids.add(record_id)
            records.append(record)
    finally:
        workbook.close()

    if not records:
        raise WorkflowError(f"The worksheet contains no records: {path}")
    return records


def write_normalized_workbook(
    records: list[dict[str, Any]], output_path: Path, sheet_title: str = "records"
) -> None:
    workbook = Workbook()
    worksheet = workbook.active
    worksheet.title = sheet_title[:31]
    worksheet.append(FIELDS)
    for cell in worksheet[1]:
        cell.font = Font(bold=True, color="FFFFFF")
        cell.fill = PatternFill("solid", fgColor="375A7F")
        cell.alignment = Alignment(vertical="top", wrap_text=True)

    for record in records:
        validate_record(record)
        worksheet.append([record[field] for field in FIELDS])
        for cell in worksheet[worksheet.max_row]:
            cell.alignment = Alignment(vertical="top", wrap_text=True)

    worksheet.freeze_panes = "A2"
    worksheet.auto_filter.ref = worksheet.dimensions
    for column_cells in worksheet.columns:
        column_letter = column_cells[0].column_letter
        values = [str(cell.value or "") for cell in column_cells]
        width = min(max([len(value) for value in values] + [len(column_letter), 12]), 60)
        worksheet.column_dimensions[column_letter].width = width
    save_workbook_atomic(workbook, output_path)


def save_workbook_atomic(workbook: Workbook, output_path: Path) -> None:
    output_path = output_path.resolve()
    if not output_path.parent.is_dir():
        raise WorkflowError(f"Output directory does not exist: {output_path.parent}")
    temporary_path: str | None = None
    try:
        with tempfile.NamedTemporaryFile(
            suffix=output_path.suffix or ".xlsx",
            prefix=f".{output_path.stem}.",
            dir=output_path.parent,
            delete=False,
        ) as temporary_file:
            temporary_path = temporary_file.name
        workbook.save(temporary_path)
        os.replace(temporary_path, output_path)
    finally:
        if temporary_path and os.path.exists(temporary_path):
            os.unlink(temporary_path)


def save_json_atomic(value: Any, output_path: Path) -> None:
    output_path = output_path.resolve()
    if not output_path.parent.is_dir():
        raise WorkflowError(f"Output directory does not exist: {output_path.parent}")
    content = json.dumps(value, ensure_ascii=False, indent=2) + "\n"
    temporary_path: str | None = None
    try:
        with tempfile.NamedTemporaryFile(
            mode="w",
            encoding="utf-8",
            newline="\n",
            dir=output_path.parent,
            prefix=f".{output_path.name}.",
            suffix=".tmp",
            delete=False,
        ) as temporary_file:
            temporary_path = temporary_file.name
            temporary_file.write(content)
        os.replace(temporary_path, output_path)
    finally:
        if temporary_path and os.path.exists(temporary_path):
            os.unlink(temporary_path)


def load_json(path: Path) -> Any:
    try:
        with path.open(encoding="utf-8") as input_file:
            return json.load(input_file)
    except (OSError, json.JSONDecodeError) as error:
        raise WorkflowError(f"Could not read JSON {path}: {error}") from error
