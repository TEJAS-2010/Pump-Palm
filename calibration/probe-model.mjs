export const probeCalibration = Object.freeze({
  id: 'esp32-probe-2026-11-14-v1',
  airAdc: 4095,
  waterAdc: 1165,
  waterSamples: 5,
  airSamples: 1
});

export function validAdc(rawAdc) {
  return Number.isInteger(rawAdc) && rawAdc >= 0 && rawAdc <= 4095;
}

export function probeWetness(rawAdc) {
  if (!validAdc(rawAdc)) throw new RangeError('ADC count must be an integer from 0 to 4095');
  const { airAdc, waterAdc } = probeCalibration;
  const relative = (airAdc - rawAdc) * 100 / (airAdc - waterAdc);
  return {
    wetness_index: Math.round(Math.min(100, Math.max(0, relative)) * 10) / 10,
    adc_at_rail: rawAdc === 0 || rawAdc === 4095
  };
}

export function withProbeCalibration(reading) {
  if (reading.raw_adc == null || reading.probe_calibration !== probeCalibration.id) return reading;
  return { ...reading, ...probeWetness(reading.raw_adc) };
}
