from __future__ import annotations

import argparse
from copy import copy
from pathlib import Path
from typing import Any

from openpyxl import load_workbook

from scripts.record_workflow.clean_map import require_clean_map
from scripts.record_workflow.common import (
    FIELDS,
    WorkflowError,
    read_normalized_workbook,
    save_workbook_atomic,
    validate_record,
)


def merge_records(
    new_records: list[dict[str, Any]], master_records: list[dict[str, Any]]
) -> list[dict[str, Any]]:
    master_ids = {record["record_id"] for record in master_records}
    new_ids: set[str] = set()
    for record in master_records:
        require_clean_map(record["map"], record["record_id"])
    for record in new_records:
        validate_record(record, require_sm2=True)
        record_id = record["record_id"]
        if record_id in master_ids or record_id in new_ids:
            raise WorkflowError(f"Duplicate record_id during merge: {record_id}.")
        new_ids.add(record_id)
        require_clean_map(record["map"], record_id)
    return sorted(
        new_records,
        key=lambda record: (record["date_s"], int(record["record_id"])),
        reverse=True,
    ) + master_records


def merge_workbooks(input_path: Path, master_path: Path, output_path: Path) -> int:
    input_path = input_path.resolve()
    master_path = master_path.resolve()
    output_path = output_path.resolve()
    if output_path in (input_path, master_path):
        raise WorkflowError("Output must be a new candidate workbook, not an input file.")
    if output_path.exists():
        raise WorkflowError(f"Output already exists; refusing to overwrite: {output_path}")
    if not output_path.parent.is_dir():
        raise WorkflowError(f"Output directory does not exist: {output_path.parent}")

    new_records = read_normalized_workbook(input_path)
    master_records = read_normalized_workbook(master_path)
    merged_records = merge_records(new_records, master_records)

    workbook = load_workbook(master_path)
    if len(workbook.worksheets) != 1:
        workbook.close()
        raise WorkflowError("Master workbook must contain exactly one worksheet.")
    worksheet = workbook.worksheets[0]
    headers = {
        cell.value: index
        for index, cell in enumerate(worksheet[1], start=1)
        if cell.value in FIELDS
    }
    if set(headers) != set(FIELDS):
        workbook.close()
        raise WorkflowError("Master workbook does not contain the full 23-field schema.")

    amount = len(new_records)
    if amount:
        template_styles = [
            copy(worksheet.cell(row=2, column=column)._style)
            for column in range(1, worksheet.max_column + 1)
        ]
        template_height = worksheet.row_dimensions[2].height
        worksheet.insert_rows(2, amount)
        for offset, record in enumerate(merged_records[:amount], start=2):
            for column in range(1, worksheet.max_column + 1):
                cell = worksheet.cell(row=offset, column=column)
                style_index = column - 1
                if style_index < len(template_styles) and template_styles[style_index]:
                    cell._style = copy(template_styles[style_index])
            for field, column in headers.items():
                worksheet.cell(row=offset, column=column).value = record[field]
            if template_height is not None:
                worksheet.row_dimensions[offset].height = template_height
    try:
        save_workbook_atomic(workbook, output_path)
    finally:
        workbook.close()

    verified = read_normalized_workbook(output_path)
    expected_count = len(new_records) + len(master_records)
    if len(verified) != expected_count:
        raise WorkflowError(
            f"Candidate has {len(verified)} rows; expected {expected_count}."
        )
    expected_ids = {record["record_id"] for record in merged_records}
    if {record["record_id"] for record in verified} != expected_ids:
        raise WorkflowError("Candidate record IDs do not match the merge inputs.")
    return len(new_records)


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Create a sorted master workbook candidate without overwriting the master."
    )
    parser.add_argument("--input", type=Path, required=True, help="Validated new records.")
    parser.add_argument("--master", type=Path, required=True, help="Current master workbook.")
    parser.add_argument(
        "--output", type=Path, required=True, help="New candidate workbook path."
    )
    args = parser.parse_args()
    try:
        added = merge_workbooks(args.input, args.master, args.output)
    except (OSError, WorkflowError) as error:
        parser.error(str(error))

    print(
        f"Candidate created with {added} new records: {args.output.resolve()}"
    )
    print("Checkpoint: verify count, IDs, new-record order, and the workbook diff before promotion.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
