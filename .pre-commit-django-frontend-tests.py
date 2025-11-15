#!/usr/bin/env python3
import os
import shutil
import subprocess
import sys

sys.stdout.reconfigure(encoding="utf-8")


def run_command(cmd, cwd=None):
    """Run a command and exit on failure."""
    print(f"Running: {' '.join(cmd)}")
    result = subprocess.run(cmd, cwd=cwd, env=os.environ)
    if result.returncode != 0:
        sys.exit(result.returncode)


# Activate virtual environment
venv_paths = [
    "./backend/venv/Scripts/activate",  # Windows
    "./backend/venv/bin/activate",  # Unix
]

for path in venv_paths:
    if os.path.exists(path):
        venv_dir = os.path.abspath("./backend/venv")
        if os.name == "nt":
            os.environ["VIRTUAL_ENV"] = venv_dir
            os.environ["PATH"] = (
                os.path.join(venv_dir, "Scripts")
                + os.pathsep
                + os.environ["PATH"]
            )
            python_cmd = os.path.join(venv_dir, "Scripts", "python.exe")
        else:
            os.environ["VIRTUAL_ENV"] = venv_dir
            os.environ["PATH"] = (
                os.path.join(venv_dir, "bin") + os.pathsep + os.environ["PATH"]
            )
            python_cmd = os.path.join(venv_dir, "bin", "python")
        break
else:
    python_cmd = sys.executable

# Run Django tests
print(f"\n{'=' * 70}")
print("🧪 Running Backend Tests (pytest)")
print("=" * 70)
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
run_command(
    [
        python_cmd,
        "-m",
        "pytest",
        "--maxfail=1",
        "--disable-warnings",
        "-v",
    ],
    cwd="backend",
)
print("✅ Backend tests passed!\n")

# Check if npm exists and frontend directory exists
if not os.path.exists("frontend"):
    print("⚠️  Frontend directory not found, skipping frontend tests")
    print("✅ All tests passed!")
    sys.exit(0)

npm_cmd = "npm.cmd" if os.name == "nt" else "npm"
if not shutil.which(npm_cmd):
    print("⚠️  npm not found in PATH, skipping frontend tests")
    print("💡 Install Node.js or ensure npm is in PATH")
    print("✅ Backend tests passed!")
    sys.exit(0)

# Run frontend tests
print("=" * 70)
print("🧪 Running Frontend Tests (npm test)")
print("=" * 70)
run_command([npm_cmd, "install"], cwd="frontend")
run_command([npm_cmd, "test", "--", "--watchAll=false"], cwd="frontend")
print("✅ Frontend tests passed!\n")

print("=" * 70)
print("✅ All tests passed!")
print("=" * 70)
