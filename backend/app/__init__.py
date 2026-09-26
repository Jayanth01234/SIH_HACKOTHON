"""
POLARIS: Digital Twin & Remote Management Platform for India's Antarctic Stations.
Backend Data Ingestion and Processing Layer.
"""

import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

__version__ = "0.1.0"
