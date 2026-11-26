from __future__ import annotations

import argparse
from pathlib import Path

from scripts.record_workflow.common import (
    FIELDS,
    WorkflowError,
    clean_summary,
    extract_record_id,
    parse_schedule,
    read_source_rows,
    save_json_atomic,
    text_value,
    validate_record,
    write_normalized_workbook,
)


COPILOT_PROMPT = (
    "次の各山行記録を、原文の雰囲気を保った自然な日本語で180〜230文字に要約してください。"
    "登山開始から下山までを時系列でまとめ、景色・天候・登山道の状況・印象的な出来事を含め、"
    "最後に山行全体の印象をまとめてください。箇条書きや説明は使わず、要約文のみを作成してください。"
    "入力のrecord_idを変更せず、出力は {\"summaries\": [{\"record_id\": \"...\", "
    "\"sm2\": \"...\"}]} のJSON形式にしてください。"
)


def prepare_records(input_path: Path) -> list[dict[str, object]]:
    workbook_epoch, source_rows = read_source_rows(input_path)
    prepared: list[dict[str, object]] = []
    seen_ids: set[str] = set()

    for source in source_rows:
        row_number = source["_row_number"]
        try:
            start, end = parse_schedule(source["schedule"], workbook_epoch)
            yamareco_url = text_value(source["yamareco_url"]).strip()
            record_id = extract_record_id(yamareco_url)
            if record_id in seen_ids:
                raise WorkflowError(f"Duplicate record_id {record_id!r}.")
            seen_ids.add(record_id)

            record: dict[str, object] = {field: "" for field in FIELDS}
            record.update(
                {
                    "date_s": start.isoformat(),
                    "date_e": end.isoformat() if end else "",
                    "duration": (end - start).days + 1 if end else 1,
                    "record_id": record_id,
                    "title": text_value(source["title"]),
                    "area": text_value(source["area"]),
                    "genre": text_value(source["genre"]),
                    "members": text_value(source["members"]),
                    "weather": text_value(source["weather"]),
                    "course_time": text_value(source["course_time"]),
                    "course_note": text_value(source["course_note"]),
                    "summary": clean_summary(source["summary"]),
                    "yamareco_url": yamareco_url,
                }
            )
            validate_record(record)
            prepared.append(record)
        except WorkflowError as error:
            raise WorkflowError(f"Source row {row_number}: {error}") from error

    return prepared


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Normalize a Yamareco workbook and prepare Copilot summary input."
    )
    parser.add_argument("--input", type=Path, required=True, help="Source .xlsx file.")
    parser.add_argument(
        "--output", type=Path, required=True, help="Prepared 23-column .xlsx file."
    )
    parser.add_argument(
        "--copilot-output",
        type=Path,
        help="JSON file to attach to Copilot (default: <output>.sm2-input.json).",
    )
    args = parser.parse_args()

    copilot_output = args.copilot_output or args.output.with_name(
        f"{args.output.stem}.sm2-input.json"
    )
    resolved_paths = {
        args.input.resolve(),
        args.output.resolve(),
        copilot_output.resolve(),
    }
    if len(resolved_paths) != 3:
        parser.error("Input workbook and output files must be different paths.")

    try:
        records = prepare_records(args.input)
        write_normalized_workbook(records, args.output)
        summary_input = {
            "prompt": COPILOT_PROMPT,
            "summaries": [
                {
                    "record_id": record["record_id"],
                    "title": record["title"],
                    "date_s": record["date_s"],
                    "summary": record["summary"],
                }
                for record in records
            ],
        }
        save_json_atomic(summary_input, copilot_output)
    except (OSError, WorkflowError) as error:
        parser.error(str(error))

    print(f"Prepared {len(records)} records: {args.output.resolve()}")
    print(f"Copilot input: {copilot_output.resolve()}")
    print("Checkpoint: review dates, IDs, summaries, and Copilot input before continuing.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
