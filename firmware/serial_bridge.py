"""Forward ADC counts from the team's existing ESP32 serial output."""
import argparse
from datetime import datetime, timezone
from getpass import getpass
import json
import os
import re
import sys
import time
from urllib.error import HTTPError, URLError
from urllib.parse import urlsplit
from urllib.request import Request, urlopen

CALIBRATION = "esp32-probe-2026-11-14-v1"
RAW_LINE = re.compile(rb"^Raw:\s*(\d{1,4})\s+Moisture:")


def read_raw(line):
    match = RAW_LINE.match(line)
    return int(match[1]) if match and int(match[1]) <= 4095 else None


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("port", help="Arduino serial port, such as COM3")
    parser.add_argument("site", help="Pump Pulse base URL")
    args = parser.parse_args()
    site = urlsplit(args.site)
    loopback = site.hostname in {"localhost", "127.0.0.1", "::1"}
    if not site.hostname or site.username or site.password or site.query or site.fragment or site.path not in {"", "/"}:
        parser.error("Enter the base URL of your Pump Pulse site")
    if site.scheme != "https" and not (site.scheme == "http" and loopback):
        parser.error("Use HTTPS, or HTTP for a local loopback test")
    try:
        import serial
    except ImportError:
        parser.exit(2, "Install pyserial with python -m pip install pyserial\n")
    token = os.environ.get("PUMP_DEVICE_TOKEN") or getpass("Pump Pulse device token: ")
    if not re.fullmatch(r"[0-9a-f]{64}", token):
        parser.error("Enter the token from Pump Pulse → Pair Arduino")
    endpoint = args.site.rstrip("/") + "/api/telemetry"
    last = float("-inf")
    with serial.Serial(args.port, 115200, timeout=2) as port:
        print("Listening for Raw readings. Press Ctrl+C to stop.", flush=True)
        while True:
            raw = read_raw(port.readline())
            if raw is None or time.monotonic() - last < 5:
                continue
            last = time.monotonic()
            payload = json.dumps({
                "timestamp": datetime.now(timezone.utc).isoformat(timespec="milliseconds"),
                "raw_adc": raw,
                "probe_calibration": CALIBRATION
            }).encode()
            request = Request(endpoint, data=payload, headers={
                "Authorization": "Bearer " + token, "Content-Type": "application/json"
            }, method="POST")
            try:
                with urlopen(request, timeout=4) as response:
                    print(f"ADC {raw} · HTTP {response.status}", flush=True)
            except HTTPError as error:
                print(f"Upload rejected (HTTP {error.code})", file=sys.stderr, flush=True)
                if error.code in {401, 403, 404}:
                    return 1
            except (URLError, TimeoutError) as error:
                print(f"Upload failed: {error}", file=sys.stderr, flush=True)
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        sys.exit(0)
