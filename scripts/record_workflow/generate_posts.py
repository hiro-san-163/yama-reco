from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
from typing import Any

from scripts.record_workflow.common import (
    FIELDS,
    WorkflowError,
    load_json,
    validate_record,
)
from scripts.record_workflow.clean_map import require_clean_map
from scripts.record_workflow.publish_json import validate_json_records


POST_NAME_RE = re.compile(r"^[0-9]{4}-[0-9]{2}-[0-9]{2}-([0-9]{5,10})\.md$")
REPOSITORY_ROOT = Path(__file__).resolve().parents[2]


def collect_post_ids(posts_dir: Path) -> dict[str, Path]:
    if not posts_dir.is_dir():
        raise WorkflowError(f"Posts directory does not exist: {posts_dir}")
    found: dict[str, Path] = {}
    for path in posts_dir.rglob("*.md"):
        match = POST_NAME_RE.fullmatch(path.name)
        if match is None:
            continue
        record_id = match.group(1)
        if record_id in found:
            raise WorkflowError(
                f"Multiple post files use record_id {record_id}: {found[record_id]} and {path}"
            )
        found[record_id] = path
    return found


def render_post(record: dict[str, Any]) -> str:
    validate_record(record)
    lines = [
        "---",
        'layout: "record"',
        'tags: "山行記録"',
    ]
    for field in FIELDS:
        value = str(record[field]) if field == "duration" else record[field]
        lines.append(f"{field}: {json.dumps(value, ensure_ascii=False)}")
    lines.extend(["---", ""])
    return "\n".join(lines)


def generate_posts(
    records: list[dict[str, Any]], posts_dir: Path, output_dir: Path
) -> list[Path]:
    existing = collect_post_ids(posts_dir)
    output_dir = output_dir.resolve()
    if output_dir == posts_dir.resolve():
        raise WorkflowError(
            "Generated posts must first be written to a review directory, not _posts."
        )

    generated: list[Path] = []
    pending: list[tuple[Path, str]] = []
    seen_ids: set[str] = set()
    for record in records:
        record_id = record["record_id"]
        if record_id in seen_ids:
            raise WorkflowError(f"Duplicate record_id in JSON input: {record_id}.")
        seen_ids.add(record_id)
        validate_record(record, require_sm2=record_id not in existing)
        if record_id in existing:
            continue
        require_clean_map(record["map"], record_id)
        filename = f"{record['date_s']}-{record_id}.md"
        output_path = output_dir / filename
        if output_path.exists():
            raise WorkflowError(
                f"Output post already exists; refusing to overwrite: {output_path}"
            )
        pending.append((output_path, render_post(record)))

    output_dir.mkdir(parents=True, exist_ok=True)
    for output_path, content in pending:
        output_path.write_text(content, encoding="utf-8", newline="\n")
        generated.append(output_path)
    return generated


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Generate review-only Markdown posts for record IDs not already in _posts."
    )
    parser.add_argument(
        "--records",
        type=Path,
        default=Path("data/records_master.json"),
        help="Full records JSON (default: data/records_master.json).",
    )
    parser.add_argument(
        "--posts-dir",
        type=Path,
        default=REPOSITORY_ROOT / "_posts",
        help="Existing Jekyll posts directory.",
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=REPOSITORY_ROOT / "work" / "generated_posts",
        help="Review-only output directory (default: work/generated_posts).",
    )
    args = parser.parse_args()

    try:
        records = validate_json_records(load_json(args.records), args.records)
        generated = generate_posts(records, args.posts_dir, args.output_dir)
    except (OSError, WorkflowError) as error:
        parser.error(str(error))

    print(f"Generated {len(generated)} new post(s) in {args.output_dir.resolve()}.")
    for path in generated:
        print(f"  {path.name}")
    print("Existing posts were not changed. Review generated files before adding them to _posts.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
