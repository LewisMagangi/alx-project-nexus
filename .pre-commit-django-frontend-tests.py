#!/usr/bin/env python3
import os
import subprocess
import sys


def run_command(cmd, cwd=None):
    print(f"Running: {' '.join(cmd)}")
    result = subprocess.run(cmd, cwd=cwd)
    if result.returncode != 0:
        sys.exit(result.returncode)


# Activate virtual environment
venv_paths = [
    "./backend/venv/Scripts/activate",  # Windows
    "./backend/venv/bin/activate",  # Unix
]

for path in venv_paths:
    if os.path.exists(path):
        if os.name == "nt":
            os.environ["VIRTUAL_ENV"] = os.path.abspath("./backend/venv")
            os.environ["PATH"] = (
                os.path.join(os.environ["VIRTUAL_ENV"], "Scripts")
                + os.pathsep
                + os.environ["PATH"]
            )
        else:
            os.environ["VIRTUAL_ENV"] = os.path.abspath("./backend/venv")
            os.environ["PATH"] = (
                os.path.join(os.environ["VIRTUAL_ENV"], "bin")
                + os.pathsep
                + os.environ["PATH"]
            )
        break

# Run Django tests
run_command(
    [sys.executable, "-m", "pytest", "--maxfail=1", "--disable-warnings"],
    cwd="backend",
)

# Run frontend tests
run_command(["npm", "install"], cwd="frontend")
run_command(["npm", "test", "--", "--watchAll=false"], cwd="frontend")

print("All tests passed!")
