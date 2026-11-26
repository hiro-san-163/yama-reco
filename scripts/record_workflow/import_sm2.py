from __future__ import annotations

import argparse
from pathlib import Path
from typing import Any

from scripts.record_workflow.common import (
    WorkflowError,
    load_json,
    read_normalized_workbook,
    validate_record,
    write_normalized_workbook,
)


def read_summaries(path: Path) -> dict[str, str]:
    payload: Any = load_json(path)
    if isinstance(payload, dict) and "summaries" in payload:
        payload = payload["summaries"]

    if isinstance(payload, dict):
        summaries = payload
    elif isinstance(payload, list):
        summaries = {}
        for item in payload:
            if not isinstance(item, dict):
                raise WorkflowError("Each summary entry must be a JSON object.")
            record_id = item.get("record_id")
            sm2 = item.get("sm2")
            if not isinstance(record_id, str) or not isinstance(sm2, str):
                raise WorkflowError(
                    "Each summary entry must contain text record_id and sm2 fields."
                )
            if record_id in summaries:
                raise WorkflowError(f"Duplicate summary for record_id {record_id}.")
            summaries[record_id] = sm2
    else:
        raise WorkflowError("Summary JSON must be an object or an array of objects.")

    normalized: dict[str, str] = {}
    for record_id, sm2 in summaries.items():
        if not isinstance(record_id, str) or not isinstance(sm2, str):
            raise WorkflowError("Summary IDs and sm2 values must be strings.")
        normalized[record_id] = sm2.strip()
    return normalized


def apply_summaries(
    records: list[dict[str, Any]], summaries: dict[str, str]
) -> list[dict[str, Any]]:
    record_ids = {record["record_id"] for record in records}
    summary_ids = set(summaries)
    missing = sorted(record_ids - summary_ids)
    extra = sorted(summary_ids - record_ids)
    if missing or extra:
        details = []
        if missing:
            details.append("missing summaries for " + ", ".join(missing))
        if extra:
            details.append("unknown summary IDs " + ", ".join(extra))
        raise WorkflowError("; ".join(details))

    for record in records:
        record_id = record["record_id"]
        record["sm2"] = summaries[record_id]
        validate_record(record, require_sm2=True)
    return records


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Import Copilot summaries and validate their length and IDs."
    )
    parser.add_argument("--input", type=Path, required=True, help="Prepared workbook.")
    parser.add_argument(
        "--summaries", type=Path, required=True, help="Copilot JSON response."
    )
    parser.add_argument(
        "--output", type=Path, required=True, help="Workbook with validated sm2 values."
    )
    args = parser.parse_args()
    if args.input.resolve() == args.output.resolve():
        parser.error("Input and output workbooks must be different files.")

    try:
        records = read_normalized_workbook(args.input)
        summaries = read_summaries(args.summaries)
        apply_summaries(records, summaries)
        write_normalized_workbook(records, args.output)
    except (OSError, WorkflowError) as error:
        parser.error(str(error))

    print(f"Validated and imported {len(records)} summaries: {args.output.resolve()}")
    print("Checkpoint: inspect summary quality before media registration and map cleanup.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
