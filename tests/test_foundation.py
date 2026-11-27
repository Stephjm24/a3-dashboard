import subprocess
import sys
import unittest
from pathlib import Path
from tempfile import TemporaryDirectory

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
from check import ROOT, check


class FoundationTests(unittest.TestCase):
    def setUp(self):
        temp = TemporaryDirectory()
        self.addCleanup(temp.cleanup)
        self.root = Path(temp.name)
        subprocess.run(["git", "init", "-q"], cwd=self.root, check=True)
        self.schema = "data/schemas/example-labels.v1.schema.json"
        self.fixture = "tests/fixtures/example-labels.v1/basic.json"
        self.write(self.schema, (ROOT / self.schema).read_text(encoding="utf-8"))
        self.write(self.fixture, '["Synthetic"]')

    def write(self, path, contents):
        target = self.root / path
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(contents, encoding="utf-8")

    def test_reference_and_fixture_share_the_contract(self):
        path = "data/reference/example-labels.v1/list.json"
        self.write(path, '["A"]')
        self.assertEqual(check(self.root), [])
        self.write(path, '["A", "A"]')
        self.assertIn("uniqueItems", " ".join(check(self.root)))

    def test_unknown_contract(self):
        self.write("data/reference/unknown.v1/list.json", "[]")
        self.assertIn("matching schema", " ".join(check(self.root)))

    def test_unclassified_data_is_rejected(self):
        self.write("data/export.csv", "column\n")
        self.assertIn("unclassified data path", " ".join(check(self.root)))

    def test_token_in_ordinary_file(self):
        self.write("notes.md", "ghp_" + "x" * 36)
        self.assertIn("possible GitHub token", " ".join(check(self.root)))

    def test_invalid_json_and_duplicate_fields(self):
        for contents in ("[", '{"a":1,"a":2}', "[NaN]"):
            with self.subTest(contents=contents):
                self.write(self.fixture, contents)
                self.assertIn("invalid JSON", " ".join(check(self.root)))

    def test_missing_fixture(self):
        (self.root / self.fixture).unlink()
        self.assertIn("synthetic fixture", " ".join(check(self.root)))

    def test_forced_private_file_is_detected(self):
        self.write(".gitignore", ".env\n")
        self.write(".env", "LOCAL_SETTING=example")
        self.assertEqual(check(self.root), [])
        subprocess.run(["git", "add", "-f", ".env"], cwd=self.root, check=True)
        self.assertIn("private or generated path", " ".join(check(self.root)))

    def test_key_marker_in_ordinary_file(self):
        self.write("notes.md", "-----BEGIN " + "PRIVATE KEY-----")
        self.assertIn("possible private key", " ".join(check(self.root)))
