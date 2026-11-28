from __future__ import annotations

import argparse
import os
import shutil
import tempfile
from pathlib import Path
from typing import Any

from scripts.record_workflow.clean_map import backup_path_for
from scripts.record_workflow.common import (
    WorkflowError,
    read_normalized_workbook,
)
from scripts.record_workflow.merge_master import merge_records


def validate_candidate(
    input_path: Path, master_path: Path, candidate_path: Path
) -> list[dict[str, Any]]:
    input_path = input_path.resolve()
    master_path = master_path.resolve()
    candidate_path = candidate_path.resolve()
    if len({input_path, master_path, candidate_path}) != 3:
        raise WorkflowError("Input, master, and candidate must be different files.")

    new_records = read_normalized_workbook(input_path)
    master_records = read_normalized_workbook(master_path)
    expected_records = merge_records(new_records, master_records)
    candidate_records = read_normalized_workbook(candidate_path)
    if candidate_records != expected_records:
        raise WorkflowError(
            "Candidate does not match the current input and master. "
            "Regenerate it with merge_master.py and review the new candidate."
        )
    return expected_records


def promote_candidate(
    input_path: Path, master_path: Path, candidate_path: Path
) -> Path:
    master_path = master_path.resolve()
    candidate_path = candidate_path.resolve()
    validate_candidate(input_path, master_path, candidate_path)

    backup_path = backup_path_for(master_path)
    if backup_path.exists():
        raise WorkflowError(f"Backup already exists: {backup_path}")

    temporary_path: str | None = None
    try:
        with tempfile.NamedTemporaryFile(
            dir=master_path.parent,
            prefix=f".{master_path.stem}.",
            suffix=master_path.suffix,
            delete=False,
        ) as temporary_file:
            temporary_path = temporary_file.name
        shutil.copy2(candidate_path, temporary_path)
        shutil.copy2(master_path, backup_path)
        os.replace(temporary_path, master_path)
    except OSError as error:
        raise WorkflowError(f"Could not promote master candidate: {error}") from error
    finally:
        if temporary_path and os.path.exists(temporary_path):
            os.unlink(temporary_path)

    return backup_path


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Verify and promote a reviewed master workbook candidate."
    )
    parser.add_argument("--input", type=Path, required=True, help="New records workbook.")
    parser.add_argument("--master", type=Path, required=True, help="Current master workbook.")
    parser.add_argument(
        "--candidate", type=Path, required=True, help="Reviewed candidate workbook."
    )
    parser.add_argument(
        "--apply",
        action="store_true",
        help="Create a timestamped backup and replace the master workbook.",
    )
    args = parser.parse_args()

    try:
        if args.apply:
            expected_records = read_normalized_workbook(args.candidate)
            backup = promote_candidate(args.input, args.master, args.candidate)
        else:
            expected_records = validate_candidate(
                args.input, args.master, args.candidate
            )
            backup = None
    except (OSError, WorkflowError) as error:
        parser.error(str(error))

    if backup:
        print(
            f"Master updated with {len(expected_records)} records: "
            f"{args.master.resolve()}"
        )
        print(f"Backup: {backup}")
    else:
        print(
            f"Candidate verified: {len(expected_records)} records match "
            "the current input and master."
        )
        print("Review the candidate, then rerun with --apply to update the master.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
