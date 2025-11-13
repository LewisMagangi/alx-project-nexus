import subprocess
import sys
from pathlib import Path


def run(cmd, cwd=None, capture=False):
    """Run a shell command."""
    if capture:
        result = subprocess.run(
            cmd, shell=True, cwd=cwd, capture_output=True, text=True
        )
        return result.returncode, result.stdout, result.stderr
    print(f"Running: {cmd}")
    result = subprocess.run(cmd, shell=True, cwd=cwd)
    return result.returncode, "", ""


def run_flake8(files_str, label=""):
    """Run flake8 and return formatted output."""
    print(f"\n{'=' * 70}")
    print(f"🔍 FLAKE8 CHECK {label}")
    print(f"{'=' * 70}\n")

    returncode, stdout, stderr = run(
        f"flake8 --max-line-length=79 --statistics {files_str}", capture=True
    )

    if returncode == 0:
        print("✅ No issues found!")
        return 0, ""

    print(stdout)
    if stderr:
        print(f"Errors: {stderr}")

    # Count issues
    lines = stdout.strip().split("\n")
    issue_lines = [
        line
        for line in lines
        if line and ":" in line and not line.startswith(" ")
    ]
    print(f"\n📊 Total issues: {len(issue_lines)}")
    return len(issue_lines), stdout


# Find the repo root
current_dir = Path(__file__).parent.absolute()
repo_root = current_dir.parent

print("=" * 70)
print("🔧 AUTO-FIX WITH BEFORE/AFTER COMPARISON")
print("=" * 70)
print(f"\n📍 Repo root: {repo_root}")

# Get Python files
result = subprocess.run(
    ["git", "ls-files", "*.py"],
    capture_output=True,
    text=True,
    cwd=str(repo_root),
)

if result.returncode != 0:
    print("❌ Git command failed!")
    sys.exit(1)

py_files = [f for f in result.stdout.strip().split("\n") if f]

if not py_files:
    print("❌ No Python files found in git.")
    sys.exit(0)

abs_py_files = [repo_root / f for f in py_files]
files_str = " ".join(f'"{f}"' for f in abs_py_files)

print(f"✅ Found {len(py_files)} Python file(s)\n")

# BEFORE: Run flake8
before_count, before_output = run_flake8(files_str, "- BEFORE FIXES")

if before_count == 0:
    print("\n✨ Code is already clean! No fixes needed.")
    sys.exit(0)

# Ask user to proceed
print(f"\n{'=' * 70}")
response = input("🤔 Proceed with auto-fixes? (y/n): ").strip().lower()
if response != "y":
    print("❌ Cancelled.")
    sys.exit(0)

print(f"\n{'=' * 70}")
print("🧹 APPLYING AUTO-FIXES")
print("=" * 70)

# Apply fixes
steps = [
    ("flynt", f"flynt --transform-concat --line-length 79 {files_str}"),
    (
        "autoflake",
        f"autoflake --in-place --remove-unused-variables "
        f"--remove-all-unused-imports --remove-duplicate-keys {files_str}",
    ),
    ("pyupgrade", f"pyupgrade --py312-plus {files_str}"),
    ("isort", f"isort --profile black --line-length 79 {files_str}"),
    (
        "autopep8",
        f"autopep8 --in-place --aggressive --aggressive "
        f"--max-line-length 79 {files_str}",
    ),
    ("black", f"black --line-length 79 {files_str}"),
]

for i, (name, cmd) in enumerate(steps, 1):
    print(f"\n[{i}/{len(steps)}] Running {name}...")
    run(cmd)

# AFTER: Run flake8
after_count, after_output = run_flake8(files_str, "- AFTER FIXES")

# Show comparison
print(f"\n{'=' * 70}")
print("📊 BEFORE vs AFTER COMPARISON")
print("=" * 70)
print(f"\n{'BEFORE':<30} {'AFTER':<30}")
print(f"{'-' * 30} {'-' * 30}")
before_text = f"Issues: {before_count}"
after_text = f"Issues: {after_count}"
print(f"{before_text:<30} {after_text:<30}")

fixed = before_count - after_count
if fixed > 0:
    print(f"\n✅ Fixed {fixed} issues ({fixed / before_count * 100:.1f}%)")
else:
    print("\n⚠️  No issues were auto-fixed")

# Summary
print(f"\n{'=' * 70}")
print("✨ SUMMARY")
print("=" * 70)
print(f"  Total files: {len(py_files)}")
print(f"  Issues before: {before_count}")
print(f"  Issues after: {after_count}")
print(f"  Issues fixed: {fixed}")

if after_count > 0:
    print(f"\n⚠️  {after_count} issues require manual fixes")
    print("💡 Review the AFTER output above for details")

print("\n✅ Done!\n")
