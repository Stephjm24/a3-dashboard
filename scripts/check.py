"""Validate repository hygiene and versioned dashboard datasets from the working tree."""
import json
import os
import re
import subprocess
import sys
from pathlib import Path

from jsonschema import Draft202012Validator
from referencing import Registry

ROOT = Path(__file__).resolve().parents[1]
DIALECT = "https://json-schema.org/draft/2020-12/schema"
CONTRACT = re.compile(r"[a-z][a-z0-9]*(?:-[a-z0-9]+)*\.v[1-9][0-9]*")
PRIVATE_KEY = re.compile(rb"-----BEGIN (?:[A-Z0-9 ]+ )?PRIVATE KEY-----")
# GitHub tokens, Anthropic API keys and AWS access key IDs.
TOKEN = re.compile(rb"\b(?:gh[pousr]_[A-Za-z0-9]{36,}|github_pat_[A-Za-z0-9_]{60,}"
                   rb"|sk-ant-[A-Za-z0-9_-]{20,}|AKIA[0-9A-Z]{16})\b")
BLOCKED_SUFFIXES = {".key", ".pem", ".p12", ".pfx", ".db", ".sqlite", ".sqlite3", ".dump", ".bak"}
BLOCKED_DIRS = {"node_modules", ".venv", "__pycache__", ".next", ".vercel", ".netlify", ".wrangler"}
DATA_ROOTS = ("data/reference", "tests/fixtures")
MAX_BYTES = 5 * 1024 * 1024


def read_json(path):
    def unique_keys(pairs):
        obj = {}
        for key, value in pairs:
            if key in obj:
                raise ValueError("duplicate JSON field")
            obj[key] = value
        return obj

    def invalid_number(_):
        raise ValueError("non-standard JSON number")

    return json.loads(path.read_text(encoding="utf-8"), object_pairs_hook=unique_keys,
                      parse_constant=invalid_number)


def git_files(root):
    output = subprocess.check_output(
        ["git", "ls-files", "-z", "--cached", "--others", "--exclude-standard"], cwd=root
    )
    return sorted({Path(os.fsdecode(name)) for name in output.split(b"\0") if name})


def check_file(root, path):
    name = path.name.lower()
    parts = tuple(p.lower() for p in path.parts)
    if parts[0] == "data" and parts[:2] not in {("data", "reference"), ("data", "schemas")}:
        raise ValueError("unclassified data path")
    if ((name.startswith(".env.") or name == ".env") and name != ".env.example"
            or name == "credentials.json" or name.startswith("service-account") and name.endswith(".json")
            or path.suffix.lower() in BLOCKED_SUFFIXES or set(parts) & BLOCKED_DIRS
            or parts[:2] in {("data", "raw"), ("data", "private")}
            or parts[0] in {"dist", "build", "coverage"}):
        raise ValueError("private or generated path")
    file = root / path
    if file.is_symlink() or not file.is_file():
        raise ValueError("expected a regular file")
    if file.stat().st_size > MAX_BYTES:
        raise ValueError("file exceeds the 5 MiB review limit")
    content = file.read_bytes()
    if PRIVATE_KEY.search(content):
        raise ValueError("possible private key")
    if TOKEN.search(content):
        raise ValueError("possible access token")


def check(root=ROOT):
    errors, paths = [], []
    for path in git_files(root):
        try:
            check_file(root, path)
            paths.append(path)
        except (OSError, ValueError) as exc:
            errors.append(f"{path}: {exc}")

    validators = {}
    for path in paths:
        if not path.is_relative_to("data/schemas"):
            continue
        name = path.name.removesuffix(".schema.json")
        try:
            if (len(path.parts) != 3 or not path.name.endswith(".schema.json")
                    or not CONTRACT.fullmatch(name)):
                raise ValueError("expected <dataset>.vN.schema.json")
            schema = read_json(root / path)
            if not isinstance(schema, dict) or schema.get("$schema") != DIALECT:
                raise ValueError("expected a JSON Schema Draft 2020-12 object")
            Draft202012Validator.check_schema(schema)
            validators[name] = Draft202012Validator(schema, registry=Registry())
        except Exception as exc:
            errors.append(f"{path}: invalid contract ({type(exc).__name__})")

    exercised = set()
    for path in paths:
        if not any(path.is_relative_to(directory) for directory in DATA_ROOTS):
            continue
        if len(path.parts) != 4 or path.suffix != ".json" or path.parent.name not in validators:
            errors.append(f"{path}: expected <contract>/<name>.json with a matching schema")
            continue
        contract = path.parent.name
        try:
            error = next(validators[contract].iter_errors(read_json(root / path)), None)
            if error is not None:
                errors.append(f"{path}: failed {error.validator} constraint")
            elif path.is_relative_to("tests/fixtures"):
                exercised.add(contract)
        except Exception as exc:
            errors.append(f"{path}: invalid JSON or unresolved contract ({type(exc).__name__})")
    if not validators:
        errors.append("at least one valid contract is required")
    for name in sorted(validators.keys() - exercised):
        errors.append(f"{name}: add a passing synthetic fixture")
    return errors


if __name__ == "__main__":
    problems = check()
    if problems:
        print("\n".join(problems), file=sys.stderr)
        sys.exit(1)
    print("Foundation checks passed.")
