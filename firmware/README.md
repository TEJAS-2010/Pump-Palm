# Connect the team's Arduino

Keep the team's existing sensor drivers and calibration. Add the HTTPS POST below to the loop that publishes your measurements. This also works from a gateway computer if the board has no Wi-Fi or cannot validate TLS.

1. Sign in, open the farm, then choose **Arduino & salinity → Pair Arduino**.
2. Save that one-time device token privately. Each device has its own token. Replacing a token invalidates the previous one.
3. Synchronize the board clock to UTC. Set an ISO 8601 measurement timestamp and send only measurements from this probe or flow meter.
4. Use HTTPS and certificate validation on a public host. A local HTTP endpoint is suitable for a local verification run.

```text
POST /api/telemetry
Authorization: Bearer <device-token>
Content-Type: application/json
```

```json
{
  "timestamp": "<ISO-8601 UTC measurement timestamp>",
  "moisture_pct": 21.4,
  "ecw_dsm": 1.2,
  "litres": 114.3,
  "soil_temp_c": 31.5
}
```

The numbers above illustrate the API schema. Replace them with calibrated values. Send null or omit measurements the device does not provide. At least one numeric measurement is required. Send litres as a completed irrigation event volume, rather than a cumulative meter reading. ECw is measured on irrigation water. Enter lab ECe separately in the field profile. Timestamps are deduplicated per device.

The site polls for new readings every six seconds. The HTTP response 202 confirms receipt. If your team uses a separate model, provide its code, model file, required features and units before using its predictions in the decision panel.

For this team's raw-count probe, see [the calibration guide](../calibration/README.md). Its USB bridge forwards raw counts and the calibration ID. It deliberately omits the Arduino's air-to-water percentage so the relative index stays separate from true soil moisture.
