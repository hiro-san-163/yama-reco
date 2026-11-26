from __future__ import annotations

import argparse
import re
import shutil
from datetime import datetime
from html import unescape
from pathlib import Path
from urllib.parse import urlsplit

from openpyxl import load_workbook

from scripts.record_workflow.common import WorkflowError, is_blank, save_workbook_atomic


SRC_RE = re.compile(r"""src\s*=\s*(["'])(https?://.*?)\1""", re.IGNORECASE | re.DOTALL)
RAW_URL_RE = re.compile(r"^(https?://[^\s\"'<>]+)", re.IGNORECASE)
TRAILING_ATTRIBUTES_RE = re.compile(
    r"""^(?:["']\s*)?(?:width|height|scrolling|frameborder|style|class)\s*=.+$""",
    re.IGNORECASE | re.DOTALL,
)


def is_http_url(value: str) -> bool:
    if not value or any(character.isspace() for character in value):
        return False
    if any(character in value for character in '<>"\''):
        return False
    try:
        parsed = urlsplit(value)
    except ValueError:
        return False
    return parsed.scheme.lower() in ("http", "https") and bool(parsed.netloc)


def clean_map_value(value: object) -> tuple[str, str]:
    if is_blank(value):
        return "", "blank"
    original = str(value)

    if is_http_url(original):
        return original, "unchanged"

    iframe_match = SRC_RE.search(original)
    if iframe_match:
        candidate = unescape(iframe_match.group(2))
        if is_http_url(candidate):
            return candidate, "converted"
        raise WorkflowError("iframe src is not a valid HTTP(S) URL.")

    trimmed = original.strip()
    url_match = RAW_URL_RE.match(trimmed)
    if url_match:
        candidate = url_match.group(1)
        suffix = trimmed[url_match.end() :]
        if not suffix:
            if candidate == original:
                return candidate, "unchanged"
            return candidate, "converted"
        if TRAILING_ATTRIBUTES_RE.match(suffix):
            if is_http_url(candidate):
                return candidate, "converted"

    raise WorkflowError("No valid map URL could be extracted.")


def require_clean_map(value: object, record_id: str) -> None:
    if is_blank(value):
        return
    cleaned, status = clean_map_value(value)
    if status != "unchanged" or cleaned != value:
        raise WorkflowError(
            f"map for {record_id} is not a pure URL; run clean_map.py first."
        )


def backup_path_for(path: Path) -> Path:
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    return path.with_name(f"{path.stem}.backup_{timestamp}{path.suffix}")


def clean_workbook(
    input_path: Path, output_path: Path | None = None, in_place: bool = False
) -> tuple[int, int, int]:
    input_path = input_path.resolve()
    if in_place:
        if output_path is not None:
            raise WorkflowError("Use either --output or --in-place, not both.")
        final_path = input_path
    else:
        final_path = (output_path or input_path.with_name(
            f"{input_path.stem}_map_cleaned{input_path.suffix}"
        )).resolve()
        if final_path == input_path:
            raise WorkflowError(
                "Output path matches input; use --in-place to request a backup and update."
            )
        if final_path.exists():
            raise WorkflowError(f"Output already exists; refusing to overwrite: {final_path}")

    try:
        workbook = load_workbook(input_path, data_only=False)
    except (OSError, ValueError) as error:
        raise WorkflowError(f"Could not open workbook {input_path}: {error}") from error
    if len(workbook.worksheets) != 1:
        workbook.close()
        raise WorkflowError(
            f"Expected exactly one worksheet, found {len(workbook.worksheets)}."
        )

    worksheet = workbook.worksheets[0]
    headers: dict[str, int] = {}
    for column, cell in enumerate(worksheet[1], start=1):
        if cell.value == "map":
            if "map" in headers:
                workbook.close()
                raise WorkflowError("The worksheet contains duplicate map headers.")
            headers["map"] = column
    if "map" not in headers:
        workbook.close()
        raise WorkflowError("The worksheet is missing the map column.")

    map_column = headers["map"]
    changes: list[tuple[int, str]] = []
    unchanged_count = 0
    error_count = 0
    errors: list[str] = []
    for row_number in range(2, worksheet.max_row + 1):
        cell = worksheet.cell(row=row_number, column=map_column)
        if is_blank(cell.value):
            continue
        if cell.data_type == "f":
            error_count += 1
            errors.append(f"{cell.coordinate}: formula cells are not supported")
            continue
        try:
            cleaned, status = clean_map_value(cell.value)
            if status == "unchanged":
                unchanged_count += 1
            elif status == "converted":
                changes.append((row_number, cleaned))
        except WorkflowError as error:
            error_count += 1
            errors.append(f"{cell.coordinate}: {error}")

    if error_count:
        workbook.close()
        detail = "\n".join(errors[:20])
        if len(errors) > 20:
            detail += f"\n... and {len(errors) - 20} more errors"
        raise WorkflowError(
            f"Found {error_count} invalid map value(s); workbook was not saved.\n{detail}"
        )

    if in_place:
        backup_path = backup_path_for(input_path)
        if backup_path.exists():
            workbook.close()
            raise WorkflowError(f"Backup already exists: {backup_path}")
        try:
            shutil.copy2(input_path, backup_path)
        except OSError as error:
            workbook.close()
            raise WorkflowError(f"Could not create backup {backup_path}: {error}") from error

    for row_number, cleaned in changes:
        worksheet.cell(row=row_number, column=map_column).value = cleaned
    try:
        save_workbook_atomic(workbook, final_path)
    finally:
        workbook.close()
    return len(changes), unchanged_count, error_count


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Extract map URLs from iframe code in an .xlsx workbook."
    )
    parser.add_argument("--input", type=Path, required=True, help="Target workbook.")
    target = parser.add_mutually_exclusive_group()
    target.add_argument("--output", type=Path, help="New output workbook.")
    target.add_argument(
        "--in-place",
        action="store_true",
        help="Update the input after creating a timestamped backup.",
    )
    args = parser.parse_args()

    try:
        changed, unchanged, errors = clean_workbook(
            args.input, output_path=args.output, in_place=args.in_place
        )
    except (OSError, WorkflowError) as error:
        parser.error(str(error))

    print(
        f"Map cleanup complete: converted={changed}, unchanged={unchanged}, errors={errors}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
