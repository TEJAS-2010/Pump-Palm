import { readFile, writeFile } from 'node:fs/promises';
import { validAdc } from './probe-model.mjs';

const mean = values => values.reduce((sum, value) => sum + value, 0) / values.length;

function readSamples(csv) {
  const [header, ...lines] = csv.replace(/^\uFEFF/, '').trim().split(/\r?\n/);
  if (header.trim() !== 'sample_id,raw_adc,vwc_pct') {
    throw new Error('Expected header sample_id,raw_adc,vwc_pct');
  }

  const samples = new Map();
  for (const [index, line] of lines.entries()) {
    if (!line.trim()) continue;
    const [id, raw, target, extra] = line.split(',').map(value => value.trim());
    if (!id || !raw || !target || extra !== undefined || !validAdc(Number(raw)) ||
        !Number.isFinite(Number(target)) || Number(target) < 0 || Number(target) > 100) {
      throw new Error('Invalid soil measurement on line ' + (index + 2));
    }
    const sample = samples.get(id) ?? { id, vwc: Number(target), raw: [] };
    if (sample.vwc !== Number(target)) throw new Error('Use one reference VWC per sample ID: ' + id);
    sample.raw.push(Number(raw));
    samples.set(id, sample);
  }
  return [...samples.values()].map(({ id, vwc, raw }) => ({ id, vwc, raw: mean(raw) }));
}

function fit(samples) {
  const x = mean(samples.map(sample => sample.raw));
  const y = mean(samples.map(sample => sample.vwc));
  const variance = samples.reduce((sum, sample) => sum + (sample.raw - x) ** 2, 0);
  if (!variance) throw new Error('Soil measurements have no variation in ADC counts');
  const covariance = samples.reduce((sum, sample) => sum + (sample.raw - x) * (sample.vwc - y), 0);
  const slope = covariance / variance;
  if (slope >= 0) throw new Error('The soil data does not confirm decreasing ADC with increasing VWC. Check probe placement and labels.');
  return { slope, intercept: y - slope * x };
}

function predict(model, raw) {
  return Math.max(0, Math.min(100, model.intercept + model.slope * raw));
}

export function train(csv) {
  const samples = readSamples(csv);
  if (samples.length < 6 || new Set(samples.map(sample => sample.vwc)).size < 4) {
    throw new Error('Collect at least six independent soil samples across at least four measured VWC levels');
  }

  const errors = samples.map((sample, index) => {
    const others = samples.filter((_, other) => other !== index);
    return predict(fit(others), sample.raw) - sample.vwc;
  });
  return {
    target: 'volumetric_water_content_pct',
    model: 'linear_regression',
    ...fit(samples),
    training_adc_range: [Math.min(...samples.map(s => s.raw)), Math.max(...samples.map(s => s.raw))],
    evaluation: {
      method: 'leave_one_soil_sample_out',
      independent_samples: samples.length,
      mae_percentage_points: mean(errors.map(Math.abs)),
      rmse_percentage_points: Math.sqrt(mean(errors.map(error => error ** 2)))
    }
  };
}

if (process.argv[1] && import.meta.url === new URL(process.argv[1], 'file:').href) {
  const [input, output] = process.argv.slice(2);
  try {
    if (!input || !output) throw new Error('Usage: node calibration/train-vwc.mjs labelled-soil.csv vwc-model.json');
    const result = train(await readFile(input, 'utf8'));
    await writeFile(output, JSON.stringify(result, null, 2) + '\n', { flag: 'wx' });
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
