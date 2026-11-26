from __future__ import annotations

import argparse
import shutil
from datetime import datetime
from pathlib import Path
from typing import Any

from scripts.record_workflow.clean_map import require_clean_map
from scripts.record_workflow.common import (
    FIELDS,
    WorkflowError,
    load_json,
    save_json_atomic,
    validate_record,
)


def validate_json_records(
    value: Any, source: Path, require_clean_maps: bool = False
) -> list[dict[str, Any]]:
    if not isinstance(value, list):
        raise WorkflowError(f"{source} must contain a JSON array.")
    records: list[dict[str, Any]] = []
    seen: set[str] = set()
    for index, record in enumerate(value, start=1):
        if not isinstance(record, dict) or set(record) != set(FIELDS):
            raise WorkflowError(
                f"JSON record {index} must contain exactly the 23 schema fields."
            )
        validate_record(record)
        record_id = record["record_id"]
        if require_clean_maps:
            require_clean_map(record["map"], record_id)
        if record_id in seen:
            raise WorkflowError(f"Duplicate record_id in {source}: {record_id}.")
        seen.add(record_id)
        records.append(record)
    return records


def compare_records(
    current: list[dict[str, Any]], candidate: list[dict[str, Any]]
) -> tuple[list[str], list[str], dict[str, list[str]]]:
    current_by_id = {record["record_id"]: record for record in current}
    candidate_by_id = {record["record_id"]: record for record in candidate}
    added = sorted(candidate_by_id.keys() - current_by_id.keys())
    removed = sorted(current_by_id.keys() - candidate_by_id.keys())
    changed: dict[str, list[str]] = {}
    for record_id in sorted(current_by_id.keys() & candidate_by_id.keys()):
        changed_fields = [
            field
            for field in FIELDS
            if current_by_id[record_id][field] != candidate_by_id[record_id][field]
        ]
        if changed_fields:
            changed[record_id] = changed_fields
    return added, removed, changed


def publish_candidate(
    candidate_path: Path,
    production_path: Path,
    apply: bool = False,
    allow_existing_changes: bool = False,
) -> tuple[list[str], list[str], dict[str, list[str]], Path | None]:
    candidate_path = candidate_path.resolve()
    production_path = production_path.resolve()
    if candidate_path == production_path:
        raise WorkflowError("Candidate and production JSON paths must be different.")
    candidate = validate_json_records(
        load_json(candidate_path), candidate_path, require_clean_maps=True
    )
    current = validate_json_records(load_json(production_path), production_path)
    added, removed, changed = compare_records(current, candidate)

    if apply and removed:
        raise WorkflowError("Candidate removes existing record IDs: " + ", ".join(removed))
    if apply and changed and not allow_existing_changes:
        details = "; ".join(
            f"{record_id}: {', '.join(fields)}"
            for record_id, fields in changed.items()
        )
        raise WorkflowError(
            "Existing records changed without explicit approval: "
            + details
            + ". Use --allow-existing-changes only after reviewing those changes."
        )
    candidate_by_id = {record["record_id"]: record for record in candidate}
    for record_id in added:
        validate_record(candidate_by_id[record_id], require_sm2=True)
    if not apply:
        return added, removed, changed, None

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_path = production_path.with_name(
        f"{production_path.stem}.backup_{timestamp}{production_path.suffix}"
    )
    if backup_path.exists():
        raise WorkflowError(f"Backup already exists: {backup_path}")
    try:
        shutil.copy2(production_path, backup_path)
        save_json_atomic(candidate, production_path)
    except OSError as error:
        raise WorkflowError(f"Could not promote JSON candidate: {error}") from error
    return added, removed, changed, backup_path


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Review a full JSON candidate and optionally promote it with a backup."
    )
    parser.add_argument("--candidate", type=Path, required=True, help="Generated JSON.")
    parser.add_argument(
        "--production",
        type=Path,
        default=Path("data/records_master.json"),
        help="Production JSON (default: data/records_master.json).",
    )
    parser.add_argument(
        "--apply",
        action="store_true",
        help="Promote after checks and create a timestamped backup.",
    )
    parser.add_argument(
        "--allow-existing-changes",
        action="store_true",
        help="Permit updates to existing IDs after their diff was explicitly reviewed.",
    )
    args = parser.parse_args()

    try:
        added, removed, changed, backup = publish_candidate(
            args.candidate,
            args.production,
            apply=args.apply,
            allow_existing_changes=args.allow_existing_changes,
        )
    except (OSError, WorkflowError) as error:
        parser.error(str(error))

    print(f"Added IDs ({len(added)}): {', '.join(added) if added else 'none'}")
    print(f"Removed IDs ({len(removed)}): {', '.join(removed) if removed else 'none'}")
    if changed:
        current_by_id = {
            record["record_id"]: record
            for record in validate_json_records(
                load_json(args.production), args.production
            )
        }
        candidate_by_id = {
            record["record_id"]: record
            for record in validate_json_records(
                load_json(args.candidate), args.candidate
            )
        }
        for record_id, fields in changed.items():
            print(f"Changed {record_id}: {', '.join(fields)}")
            for field in fields:
                print(
                    f"  {field}: {current_by_id[record_id][field]!r}"
                    f" -> {candidate_by_id[record_id][field]!r}"
                )
    else:
        print("Changed existing records: none")
    if backup:
        print(f"Production JSON updated; backup: {backup}")
    else:
        print("Review only: production JSON was not changed.")
        print("Checkpoint: use --apply only after approving this diff.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
