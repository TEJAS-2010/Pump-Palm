import { writeFile } from 'node:fs/promises';
import { train } from './train-vwc.mjs';

const header = 'sample_id,raw_adc,vwc_pct';
const clampAdc = count => Math.min(4095, Math.max(0, Math.round(count)));
const seed = 41726;
let state = seed;

function random() {
  state = (Math.imul(1664525, state) + 1013904223) >>> 0;
  return state / 4294967296;
}

function noise(scale) {
  return (random() + random() + random() - 1.5) * scale;
}

function samples(prefix, levels, perLevel) {
  return levels.flatMap((vwc, level) => Array.from({ length: perLevel }, (_, index) => {
    // Assumed response for a single hypothetical soil, with a modest curvature.
    // Sample-to-sample packing variation is shared across repeat readings.
    const baseline = 4030 - 92 * vwc + .55 * vwc ** 2 + noise(115);
    const raw = Array.from({ length: 3 }, () => clampAdc(baseline + noise(40)));
    return { id: prefix + '-' + (level + 1) + '-' + (index + 1), vwc, raw };
  }));
}

function csv(samples) {
  return [header, ...samples.flatMap(({ id, vwc, raw }) =>
    raw.map(value => [id, value, vwc].join(',')))].join('\n') + '\n';
}

const training = samples('synthetic-train', [4, 9, 14, 19, 24, 29], 5);
const holdout = samples('synthetic-holdout', [6, 11, 16, 21, 26, 28], 2);
const model = train(csv(training));
const predict = raw => Math.max(0, Math.min(100, model.intercept + model.slope * raw));
const mean = values => values.reduce((sum, value) => sum + value, 0) / values.length;
const plotPoints = holdout.map(sample => {
  const raw = mean(sample.raw);
  return { adc: Math.round(raw * 10) / 10, vwc: sample.vwc, error: predict(raw) - sample.vwc };
});
const result = {
  provenance: 'synthetic_only',
  seed,
  ...model,
  held_out: {
    samples: holdout.length,
    mae_percentage_points: mean(plotPoints.map(point => Math.abs(point.error))),
    rmse_percentage_points: Math.sqrt(mean(plotPoints.map(point => point.error ** 2)))
  },
  plot_points: plotPoints.map(({ adc, vwc }) => ({ adc, vwc }))
};

const write = (path, value) => writeFile(new URL(path, import.meta.url), value);
await Promise.all([
  write('synthetic-training.csv', csv(training)),
  write('synthetic-holdout.csv', csv(holdout)),
  write('../public/synthetic-vwc.json', JSON.stringify(result, null, 2) + '\n')
]);
console.log(JSON.stringify({ training: model.evaluation.independent_samples, holdout: result.held_out }, null, 2));
