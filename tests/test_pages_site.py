import base64
import hashlib
import sys
import unittest
from pathlib import Path
from tempfile import TemporaryDirectory

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
from pages_site import FILES, build, with_security_meta


class PagesSiteTests(unittest.TestCase):
    def test_publishes_only_the_page_and_its_data(self):
        with TemporaryDirectory() as out:
            self.assertEqual(build(out), sorted(FILES))

    def test_policy_allows_the_page_script_by_hash_only(self):
        with TemporaryDirectory() as out:
            build(out)
            html = (Path(out) / "index.html").read_text(encoding="utf-8")
        head = html[:html.index("</head>")]
        self.assertIn('http-equiv="Content-Security-Policy"', head)
        self.assertIn('<meta name="referrer" content="no-referrer">', head)
        script = html[html.index("<script>") + len("<script>"):html.index("</script>")]
        digest = base64.b64encode(hashlib.sha256(script.encode("utf-8")).digest()).decode()
        self.assertIn(f"'sha256-{digest}'", head)
        self.assertNotIn("unsafe-inline' https", head)
        self.assertNotIn("script-src 'unsafe-inline'", head)
        self.assertNotIn("unsafe-eval", head)

    def test_refuses_pages_it_cannot_protect(self):
        with self.assertRaises(ValueError):
            with_security_meta("<html><head></head><body><script src=x.js></script><script>1</script></body></html>")
        with self.assertRaises(ValueError):
            with_security_meta("<html><body><script>1</script></body></html>")


if __name__ == "__main__":
    unittest.main()
