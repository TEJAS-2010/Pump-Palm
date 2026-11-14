# Moisture probe calibration

The current app can infer a **relative wetness index** from the supplied ESP32 probe. It uses the single air measurement (4095 ADC) and the median of five water measurements (1165 ADC). Lower ADC values map to higher relative wetness. The result is clipped to 0–100. It is unitless. 4095 is the 12-bit ADC ceiling, so the air reading only establishes an endpoint.

| Soil reading (ADC) | Relative wetness index |
| ---: | ---: |
| 3577 | 17.7 |
| 3602 | 16.8 |
| 3612 | 16.5 |

The Arduino's printed 18–19% values were produced by its own mapping, so using them as training targets would reproduce its formula. Air and immersion endpoints are also unsuitable as labels for true soil volumetric water content (VWC). The relative index stays separate from any field thresholds configured for measured moisture percentages.

## See it in Pump Pulse

Keep the team's working Arduino sketch running at 115200 baud. The supplied NASA.ino begins partway through readSoil() and omits the wiring constants, so use the team's complete sketch. If using USB, close Arduino Serial Monitor, install pyserial, pair the device in Pump Pulse, and run this from the project root:

```sh
python -m pip install pyserial
python firmware/serial_bridge.py COM3 http://localhost:3000
```

Replace COM3 with the Arduino's serial port and the URL with your site. The bridge prompts for the private device token and forwards a raw count at most once per five seconds. Use this calibration ID only with the supplied probe and ADC setup. For a direct device integration, send the same raw count and calibration ID to the telemetry endpoint. Other probes can upload uncalibrated raw counts without the ID.

## Train a soil-specific regression

1. Prepare several independent samples of the same field soil in known packed volumes, at different moisture levels. Keep packing, probe placement, depth and sensor settings consistent.
2. Independently measure water content using wet and oven-dry mass. Divide the mass difference by water density to obtain the water volume, then divide by packed soil volume and multiply by 100. Record replicate raw readings under the same sample ID. Do this for at least six independent samples spanning at least four VWC levels.
3. Use the included CSV header and run:

```sh
node calibration/train-vwc.mjs labelled-soil.csv vwc-model.json
```

The trainer averages repeat ADC readings within each soil sample, fits a linear regression and evaluates it by leaving entire soil samples out. It reports MAE and RMSE in percentage points. Review the errors and valid ADC range before using it with this probe and soil. An independent field test is still needed before using the regression for irrigation decisions.

[ESP32 ADC documentation](https://docs.espressif.com/projects/arduino-esp32/en/latest/api/adc.html) · [USDA soil water measurement](https://www.nrcs.usda.gov/sites/default/files/2022-11/WA-Irrigation-Guide_4.pdf)

## Synthetic soil lab

Open `/soil-lab.html` in Pump Pulse. Its built-in examples are your supplied raw ADC counts. Predicted volumetric water content is synthetic. It comes from a regression fitted to 30 generated soil samples and evaluated on 12 held-out synthetic samples. Each generated sample has three repeated ADC readings. The simulation assumes a single hypothetical soil response with nonlinear curvature and packing and measurement variation. It uses a fixed random seed. The reported error measures performance against that synthetic generator.

Run `node calibration/simulate-vwc.mjs` to regenerate both CSV files and the model. The app keeps the simulated model separate from farm readings, alert thresholds and stored telemetry. To fit the field probe, collect real reference samples and use the training command above.
