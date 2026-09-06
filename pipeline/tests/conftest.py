"""Put the pipeline/ directory on sys.path so tests can import the modules."""
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent))
