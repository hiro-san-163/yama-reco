from __future__ import annotations

import json
import tempfile
import unittest
from datetime import date
from pathlib import Path

from openpyxl import Workbook
from openpyxl.utils.datetime import CALENDAR_WINDOWS_1900, to_excel

from scripts.record_workflow.clean_map import clean_map_value, clean_workbook
from scripts.record_workflow.common import (
    FIELDS,
    SOURCE_COLUMNS,
    WorkflowError,
    parse_schedule,
    save_json_atomic,
    write_normalized_workbook,
)
from scripts.record_workflow.generate_posts import generate_posts
from scripts.record_workflow.import_sm2 import apply_summaries
from scripts.record_workflow.merge_master import merge_records, merge_workbooks
from scripts.record_workflow.prepare import prepare_records
from scripts.record_workflow.publish_json import publish_candidate
from scripts.record_workflow.validate_posts import validate_post_coverage


def make_record(record_id: str, date_s: str, sm2: str | None = None) -> dict[str, object]:
    record: dict[str, object] = {field: "" for field in FIELDS}
    record.update(
        {
            "date_s": date_s,
            "duration": 1,
            "record_id": record_id,
            "title": f"山行 {record_id}",
            "summary": "原文",
            "sm2": sm2 or "",
            "yamareco_url": (
                f"https://www.yamareco.com/modules/yamareco/detail-{record_id}.html"
            ),
        }
    )
    return record


class DateAndPreparationTests(unittest.TestCase):
    def test_schedule_accepts_japanese_range_and_slash_date(self) -> None:
        start, end = parse_schedule("2026年5月1日～5月3日", CALENDAR_WINDOWS_1900)
        self.assertEqual((start.isoformat(), end.isoformat()), ("2026-05-01", "2026-05-03"))
        start, end = parse_schedule("2026/5/1", CALENDAR_WINDOWS_1900)
        self.assertEqual((start.isoformat(), end), ("2026-05-01", None))

    def test_schedule_accepts_excel_serial(self) -> None:
        serial = to_excel(date(2026, 5, 1), CALENDAR_WINDOWS_1900)
        start, end = parse_schedule(serial, CALENDAR_WINDOWS_1900)
        self.assertEqual((start.isoformat(), end), ("2026-05-01", None))

    def test_prepare_preserves_text_and_cleans_signature(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            source_path = Path(temporary_directory) / "source.xlsx"
            workbook = Workbook()
            worksheet = workbook.active
            worksheet.append(list(SOURCE_COLUMNS))
            worksheet.append(
                [
                    "2026年5月1日～5月3日",
                    "山名",
                    "山域",
                    "ハイキング",
                    "hiro-san",
                    None,
                    None,
                    "注意事項\n二行目",
                    "本文\n[hiro-san]--\n続き",
                    "https://www.yamareco.com/modules/yamareco/detail-1234567.html",
                ]
            )
            workbook.save(source_path)

            records = prepare_records(source_path)

        self.assertEqual(len(records), 1)
        self.assertEqual(records[0]["date_s"], "2026-05-01")
        self.assertEqual(records[0]["date_e"], "2026-05-03")
        self.assertEqual(records[0]["duration"], 3)
        self.assertEqual(records[0]["course_note"], "注意事項\n二行目")
        self.assertEqual(records[0]["summary"], "本文\n\n続き")
        self.assertEqual(records[0]["sm2"], "")


class SummaryTests(unittest.TestCase):
    def test_import_requires_exact_ids_and_180_to_230_characters(self) -> None:
        record = make_record("1234567", "2026-05-01")
        result = apply_summaries([record], {"1234567": "山" * 180})
        self.assertEqual(len(result[0]["sm2"]), 180)

        with self.assertRaisesRegex(WorkflowError, "missing summaries"):
            apply_summaries([make_record("1234567", "2026-05-01")], {})
        with self.assertRaisesRegex(WorkflowError, "must be 180-230"):
            apply_summaries(
                [make_record("1234567", "2026-05-01")], {"1234567": "短い要約"}
            )


class MapTests(unittest.TestCase):
    def test_map_cleanup_handles_iframe_raw_url_and_idempotence(self) -> None:
        url = "https://www.yamareco.com/modules/yamareco/include/ymap_iframe.php?did=1234567&graph=1"
        iframe = f'<iframe src="{url}" width="482"></iframe>'
        self.assertEqual(clean_map_value(iframe), (url, "converted"))
        self.assertEqual(
            clean_map_value(url + '" width="482" height="502"'),
            (url, "converted"),
        )
        self.assertEqual(clean_map_value(url), (url, "unchanged"))
        with self.assertRaises(WorkflowError):
            clean_map_value("<iframe>missing src</iframe>")

    def test_workbook_cleanup_is_idempotent_and_invalid_values_do_not_save(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            root = Path(temporary_directory)
            source = root / "source.xlsx"
            output = root / "cleaned.xlsx"
            workbook = Workbook()
            worksheet = workbook.active
            worksheet.append(["record_id", "map"])
            worksheet.append(["1234567", '<iframe src="https://example.com/map"></iframe>'])
            workbook.save(source)

            changed, unchanged, errors = clean_workbook(source, output_path=output)
            self.assertEqual((changed, unchanged, errors), (1, 0, 0))
            second_output = root / "cleaned-again.xlsx"
            changed, unchanged, errors = clean_workbook(output, output_path=second_output)
            self.assertEqual((changed, unchanged, errors), (0, 1, 0))

            invalid_source = root / "invalid.xlsx"
            workbook = Workbook()
            worksheet = workbook.active
            worksheet.append(["map"])
            worksheet.append(["<iframe>invalid</iframe>"])
            workbook.save(invalid_source)
            invalid_output = root / "invalid-cleaned.xlsx"
            with self.assertRaisesRegex(WorkflowError, "was not saved"):
                clean_workbook(invalid_source, output_path=invalid_output)
            self.assertFalse(invalid_output.exists())


class MergeTests(unittest.TestCase):
    def test_merge_sorts_new_rows_and_leaves_inputs_unchanged(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            root = Path(temporary_directory)
            master = root / "master.xlsx"
            additions = root / "new.xlsx"
            candidate = root / "candidate.xlsx"
            write_normalized_workbook(
                [make_record("11111", "2025-01-01")], master
            )
            write_normalized_workbook(
                [
                    make_record("22222", "2026-01-01", "山" * 180),
                    make_record("33333", "2026-02-01", "山" * 180),
                ],
                additions,
            )

            count = merge_workbooks(additions, master, candidate)
            self.assertEqual(count, 2)

            from scripts.record_workflow.common import read_normalized_workbook

            merged = read_normalized_workbook(candidate)
            self.assertEqual(
                [record["record_id"] for record in merged],
                ["33333", "22222", "11111"],
            )
            self.assertEqual(
                [record["record_id"] for record in read_normalized_workbook(master)],
                ["11111"],
            )

    def test_merge_rejects_duplicate_ids(self) -> None:
        with self.assertRaisesRegex(WorkflowError, "Duplicate record_id"):
            merge_records(
                [make_record("11111", "2026-01-01", "山" * 180)],
                [make_record("11111", "2025-01-01")],
            )

    def test_merge_rejects_unclean_existing_map_values(self) -> None:
        master_record = make_record("11111", "2025-01-01")
        master_record["map"] = 'https://example.com/map" width="482"'
        with self.assertRaisesRegex(WorkflowError, "not a pure URL"):
            merge_records(
                [make_record("22222", "2026-01-01", "山" * 180)],
                [master_record],
            )


class PublishingTests(unittest.TestCase):
    def test_json_promotion_requires_explicit_apply_and_creates_backup(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            root = Path(temporary_directory)
            current_path = root / "records.json"
            candidate_path = root / "candidate.json"
            current = [make_record("11111", "2025-01-01")]
            candidate = current + [
                make_record("22222", "2026-01-01", "山" * 180)
            ]
            save_json_atomic(current, current_path)
            save_json_atomic(candidate, candidate_path)

            added, removed, changed, backup = publish_candidate(
                candidate_path, current_path
            )
            self.assertEqual(added, ["22222"])
            self.assertEqual((removed, changed, backup), ([], {}, None))
            self.assertEqual(json.loads(current_path.read_text(encoding="utf-8")), current)

            _, _, _, backup = publish_candidate(
                candidate_path, current_path, apply=True
            )
            self.assertIsNotNone(backup)
            self.assertTrue(backup.is_file())
            self.assertEqual(json.loads(current_path.read_text(encoding="utf-8")), candidate)

    def test_existing_record_changes_need_explicit_approval(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            root = Path(temporary_directory)
            current_path = root / "records.json"
            candidate_path = root / "candidate.json"
            current = [make_record("11111", "2025-01-01")]
            candidate = [make_record("11111", "2025-01-01")]
            candidate[0]["title"] = "Corrected title"
            save_json_atomic(current, current_path)
            save_json_atomic(candidate, candidate_path)

            added, removed, changed, backup = publish_candidate(
                candidate_path, current_path
            )
            self.assertEqual((added, removed, changed, backup), (
                [],
                [],
                {"11111": ["title"]},
                None,
            ))
            with self.assertRaisesRegex(WorkflowError, "without explicit approval"):
                publish_candidate(candidate_path, current_path, apply=True)
            self.assertEqual(json.loads(current_path.read_text(encoding="utf-8")), current)

    def test_json_candidate_rejects_unclean_map(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            root = Path(temporary_directory)
            current_path = root / "records.json"
            candidate_path = root / "candidate.json"
            save_json_atomic([make_record("11111", "2025-01-01")], current_path)
            new_record = make_record("22222", "2026-01-01", "山" * 180)
            new_record["map"] = '<iframe src="https://example.com/map"></iframe>'
            save_json_atomic(
                [make_record("11111", "2025-01-01"), new_record], candidate_path
            )
            with self.assertRaisesRegex(WorkflowError, "not a pure URL"):
                publish_candidate(candidate_path, current_path)

    def test_post_generation_only_creates_missing_ids_and_checks_coverage(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            root = Path(temporary_directory)
            posts = root / "_posts"
            candidates = root / "generated"
            posts.mkdir()
            old_record = make_record("11111", "2025-01-01")
            old_path = posts / "2025-01-01-11111.md"
            old_path.write_text("---\nlayout: record\n---\n", encoding="utf-8")
            new_record = make_record("22222", "2026-01-01", "山" * 180)

            generated = generate_posts([old_record, new_record], posts, candidates)
            self.assertEqual([path.name for path in generated], ["2026-01-01-22222.md"])
            content = generated[0].read_text(encoding="utf-8")
            self.assertIn('duration: "1"', content)
            self.assertIn('record_id: "22222"', content)

            records_path = root / "records.json"
            save_json_atomic([old_record, new_record], records_path)
            total, generated_count = validate_post_coverage(
                records_path, posts, candidates
            )
            self.assertEqual((total, generated_count), (2, 1))


if __name__ == "__main__":
    unittest.main()
