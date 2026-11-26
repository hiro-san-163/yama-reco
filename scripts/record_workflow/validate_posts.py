from __future__ import annotations

import argparse
from pathlib import Path

from scripts.record_workflow.common import WorkflowError, load_json
from scripts.record_workflow.generate_posts import POST_NAME_RE, collect_post_ids
from scripts.record_workflow.publish_json import validate_json_records


def validate_post_coverage(
    records_path: Path, posts_dir: Path, candidate_dir: Path
) -> tuple[int, int]:
    records = validate_json_records(load_json(records_path), records_path)
    expected = {record["record_id"]: record["date_s"] for record in records}
    existing = collect_post_ids(posts_dir)
    candidates = collect_post_ids(candidate_dir) if candidate_dir.is_dir() else {}
    overlap = set(existing) & set(candidates)
    if overlap:
        raise WorkflowError(
            "IDs occur in both existing and candidate posts: " + ", ".join(sorted(overlap))
        )

    actual = existing | candidates
    missing = sorted(set(expected) - set(actual))
    extra = sorted(set(actual) - set(expected))
    mismatched_dates: list[str] = []
    for record_id, path in actual.items():
        if record_id not in expected:
            continue
        actual_date = path.name[:10]
        if actual_date != expected[record_id]:
            mismatched_dates.append(
                f"{record_id}: JSON date {expected[record_id]}, filename date {actual_date}"
            )

    problems = []
    if missing:
        problems.append("missing post IDs: " + ", ".join(missing))
    if extra:
        problems.append("post IDs absent from JSON: " + ", ".join(extra))
    if mismatched_dates:
        problems.append("filename date mismatches: " + "; ".join(mismatched_dates))
    if problems:
        raise WorkflowError("\n".join(problems))
    return len(records), len(candidates)


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Verify JSON-to-post ID coverage and filename dates."
    )
    parser.add_argument(
        "--records",
        type=Path,
        default=Path("data/records_master.json"),
        help="Full records JSON.",
    )
    parser.add_argument(
        "--posts-dir",
        type=Path,
        default=Path("_posts"),
        help="Published Jekyll posts directory.",
    )
    parser.add_argument(
        "--candidate-dir",
        type=Path,
        default=Path("work/generated_posts"),
        help="Unpublished generated posts.",
    )
    args = parser.parse_args()
    try:
        total, candidate_count = validate_post_coverage(
            args.records, args.posts_dir, args.candidate_dir
        )
    except (OSError, WorkflowError) as error:
        parser.error(str(error))
    print(
        f"Post coverage valid: {total} JSON records, "
        f"{candidate_count} unpublished candidate post(s)."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
