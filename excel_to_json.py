import argparse
import json
import os
import tempfile
from pathlib import Path

from openpyxl import load_workbook


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
DEFAULT_INPUT = Path(__file__).resolve().parent / "data" / "records_master.xlsx"
DEFAULT_OUTPUT = Path(__file__).resolve().parent / "data" / "records_master.generated.json"


def load_records(workbook_path: Path) -> list[dict[str, str | int]]:
    workbook = load_workbook(workbook_path, read_only=True, data_only=False)
    try:
        if len(workbook.worksheets) != 1:
            raise ValueError(
                f"Expected exactly one worksheet, found {len(workbook.worksheets)}."
            )

        worksheet = workbook.worksheets[0]
        rows = worksheet.iter_rows(values_only=False)
        header_cells = next(rows, None)
        if header_cells is None:
            raise ValueError("The worksheet is empty.")

        columns: dict[int, str] = {}
        seen_fields: set[str] = set()
        for column_index, cell in enumerate(header_cells):
            value = cell.value
            if value is None or value == "":
                continue
            if not isinstance(value, str):
                raise ValueError(
                    f"Header in column {column_index + 1} must be a string."
                )
            if value not in FIELDS:
                raise ValueError(f"Unknown header in column {column_index + 1}: {value!r}.")
            if value in seen_fields:
                raise ValueError(f"Duplicate header: {value!r}.")
            columns[column_index] = value
            seen_fields.add(value)

        missing_fields = set(FIELDS) - seen_fields
        if missing_fields:
            raise ValueError(
                "Missing required schema columns: " + ", ".join(sorted(missing_fields))
            )

        records: list[dict[str, str | int]] = []
        seen_ids: set[str] = set()

        for row_number, cells in enumerate(rows, start=2):
            if all(cell.value is None or cell.value == "" for cell in cells):
                continue

            record: dict[str, str | int] = {}
            for column_index, field in columns.items():
                cell = cells[column_index] if column_index < len(cells) else None
                value = None if cell is None else cell.value

                if cell is not None and cell.data_type == "f":
                    raise ValueError(
                        f"Formula cells are not supported ({cell.coordinate})."
                    )

                if field == "duration":
                    if isinstance(value, bool) or not isinstance(value, int) or value < 1:
                        raise ValueError(
                            f"{field} must be a positive integer in row {row_number}."
                        )
                    record[field] = value
                else:
                    if value is None:
                        record[field] = ""
                    elif not isinstance(value, str):
                        raise ValueError(
                            f"{field} must be text in row {row_number}."
                        )
                    else:
                        record[field] = value

            record_id = record["record_id"]
            if not record_id.strip():
                raise ValueError(
                    f"Row {row_number} contains data but has an empty record_id."
                )
            if record_id != record_id.strip():
                raise ValueError(
                    f"record_id has surrounding whitespace in row {row_number}."
                )
            if record_id in seen_ids:
                raise ValueError(f"Duplicate record_id {record_id!r} in row {row_number}.")

            seen_ids.add(record_id)
            records.append(record)

        if not records:
            raise ValueError("The worksheet contains no records.")

        return records
    finally:
        workbook.close()


def write_json(records: list[dict[str, str | int]], output_path: Path) -> None:
    output_path = output_path.resolve()
    if output_path.exists() and not output_path.is_file():
        raise ValueError(f"Output path is not a file: {output_path}")
    if not output_path.parent.is_dir():
        raise ValueError(f"Output directory does not exist: {output_path.parent}")

    content = json.dumps(records, ensure_ascii=False, indent=2) + "\n"
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
        if temporary_path is not None and os.path.exists(temporary_path):
            os.unlink(temporary_path)


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Convert the records_master.xlsx workbook to JSON."
    )
    parser.add_argument("--input", type=Path, default=DEFAULT_INPUT)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    args = parser.parse_args()

    if args.input.resolve() == args.output.resolve():
        parser.error("Input workbook and output JSON must be different files.")

    try:
        records = load_records(args.input)
        write_json(records, args.output)
    except (OSError, ValueError) as error:
        parser.error(str(error))

    print(f"Wrote {len(records)} records to {args.output.resolve()}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
