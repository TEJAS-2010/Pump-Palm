import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { probeWetness, withProbeCalibration } from '../calibration/probe-model.mjs';
import { train } from '../calibration/train-vwc.mjs';

test('probe calibration gives bounded values and flags an ADC rail',()=>{
  assert.deepEqual([3577,3602,3612].map(raw=>probeWetness(raw).wetness_index),[17.7,16.8,16.5]);
  assert.deepEqual(probeWetness(4095),{wetness_index:0,adc_at_rail:true});
  assert.equal(probeWetness(1142).wetness_index,100);
  assert.throws(()=>probeWetness(4096),RangeError);
  assert.deepEqual(withProbeCalibration({raw_adc:3577}),{raw_adc:3577});
});

test('trainer rejects supplied self-reported labels and evaluates by soil sample',async()=>{
  const calibration=await readFile(new URL('../calibration/probe-readings.csv',import.meta.url),'utf8');
  assert.throws(()=>train(calibration),/Expected header/);
  assert.throws(()=>train('sample_id,raw_adc,vwc_pct\na,1000,20\na,1001,20'),/six independent/);
  const lines=Array.from({length:6},(_,i)=>[i+1,4000-i*500,5+i*4].join(','));
  const result=train(['sample_id,raw_adc,vwc_pct',...lines,'1,4000,5'].join('\n'));
  assert.equal(result.evaluation.independent_samples,6);
  assert.ok(result.evaluation.mae_percentage_points<1e-10);
});
