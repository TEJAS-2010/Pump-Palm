'use strict';

const translations = {
  guides: 'Field guides|أدلة الحقل',
  disclosure: 'SYNTHETIC TRAINING DATA|بيانات تدريب اصطناعية',
  title: 'Soil model lab|مختبر نموذج التربة',
  description: 'Test how a simulated calibration converts raw sensor counts into estimated volumetric water content.|جرّب كيف تحوّل المعايرة المحاكاة قراءات المستشعر الخام إلى تقديرات لمحتوى الماء الحجمي.',
  warning: 'Simulation only. The predictions and errors below are based on generated soil samples. They cannot validate a real probe or inform irrigation.|محاكاة فقط. التنبؤات والأخطاء أدناه مبنية على عينات تربة مولّدة ولا تصلح للتحقق من المستشعر الفعلي أو لاتخاذ قرارات الري.',
  chart: 'Calibration curve|منحنى المعايرة',
  fit: 'Regression|الانحدار',
  holdout: 'Held-out synthetic samples|عينات اصطناعية للاختبار',
  test: 'Try a reading|جرّب قراءة',
  adc: 'Raw ADC count|قراءة المستشعر الخام',
  adcSlider: 'Raw ADC slider|شريط ضبط القراءة الخام',
  exampleNote: 'These buttons use your actual Arduino raw counts. The resulting predictions are synthetic.|تستخدم هذه الأزرار قراءات أردوينو الخام الفعلية. التقديرات الناتجة اصطناعية.',
  prediction: 'Simulated VWC|محتوى الماء الحجمي المحاكى',
  training: 'Training samples|عينات التدريب',
  trainingNote: 'Three repeat readings per synthetic soil sample.|ثلاث قراءات مكررة لكل عينة تربة اصطناعية.',
  held: 'Holdout samples|عينات اختبار منفصلة',
  heldNote: 'Separate simulated samples from the same assumed sensor response.|عينات محاكاة منفصلة من الاستجابة المفترضة نفسها للمستشعر.',
  error: 'Holdout mean absolute error|متوسط الخطأ المطلق للاختبار',
  errorNote: 'Percentage points, on synthetic data only.|بالنقاط المئوية للبيانات الاصطناعية فقط.',
  footer: 'Field Shift · Umm Al Quwain|فيلد شفت · أم القيوين',
  out: 'Outside the simulated training range. Try an ADC count from {min} to {max}.|خارج نطاق التدريب المحاكى. جرّب قراءة بين {min} و{max}.',
  invalid: 'Enter an integer from 0 to 4095.|أدخل عدداً صحيحاً من ٠ إلى ٤٠٩٥.',
  loading: 'Loading simulation…|جارٍ تحميل المحاكاة…',
  failed: 'The synthetic model could not be loaded.|تعذّر تحميل النموذج الاصطناعي.'
};
const get = id => document.getElementById(id);
const adc = get('adc'), slider = get('slider');
let ar = localStorage.getItem('pump-lang') === 'ar';
let model;
const t = key => translations[key].split('|')[ar ? 1 : 0];
const estimate = raw => Math.min(100, Math.max(0, model.intercept + model.slope * raw));

function graph(raw) {
  const w = 560, left = 53, right = 534, top = 20, bottom = 260, minAdc = 1600, maxAdc = 4100;
  const x = value => left + (value - minAdc) / (maxAdc - minAdc) * (right - left);
  const y = value => bottom - value / 35 * (bottom - top);
  const [lo, hi] = model.training_adc_range;
  const grid = [0, 10, 20, 30].map(value => '<path d="M'+left+' '+y(value)+'H'+right+'" stroke="#e0e6d6"/><text x="45" y="'+(y(value)+4)+'" text-anchor="end">'+value+'</text>').join('');
  const ticks = [2000, 2500, 3000, 3500, 4000].map(value => '<text x="'+x(value)+'" y="282" text-anchor="middle">'+value+'</text>').join('');
  const circles = model.plot_points.map(point => '<circle cx="'+x(point.adc)+'" cy="'+y(point.vwc)+'" r="4" fill="#ad613a" opacity=".78"/>').join('');
  const pointer = raw == null ? '' : '<path d="M'+x(raw)+' '+bottom+'V'+y(estimate(raw))+'" stroke="#7c9365" stroke-dasharray="5 4"/><circle cx="'+x(raw)+'" cy="'+y(estimate(raw))+'" r="6" stroke="#fffefa" stroke-width="2" fill="#426748"/>';
  return '<svg viewBox="0 0 '+w+' 315" role="img" aria-label="'+t('chart')+'" style="direction:ltr" font-family="system-ui" font-size="12" fill="#5a6753">'+grid+ticks+'<text x="4" y="14">VWC %</text><text x="300" y="310" text-anchor="middle">ADC</text><path d="M'+left+' '+top+'V'+bottom+'H'+right+'" stroke="#a4b19a" fill="none"/><path d="M'+x(lo)+' '+y(estimate(lo))+'L'+x(hi)+' '+y(estimate(hi))+'" stroke="#426748" stroke-width="3"/>'+circles+pointer+'</svg>';
}

function render() {
  if (!model) return;
  const raw = adc.valueAsNumber;
  const valid = Number.isInteger(raw) && raw >= 0 && raw <= 4095;
  const [lo, hi] = model.training_adc_range;
  const inRange = valid && raw >= lo && raw <= hi;
  get('prediction').textContent = inRange ? estimate(raw).toFixed(1) + '%' : '—';
  get('inputStatus').textContent = !valid ? t('invalid') : inRange ? '' :
    t('out').replace('{min}', Math.ceil(lo)).replace('{max}', Math.floor(hi));
  get('graph').innerHTML = graph(inRange ? raw : null);
}

function language() {
  document.documentElement.lang = ar ? 'ar' : 'en';
  document.documentElement.dir = ar ? 'rtl' : 'ltr';
  document.querySelectorAll('[data-text]').forEach(node => node.textContent = t(node.dataset.text));
  get('language').textContent = ar ? 'English' : 'العربية';
  if (get('loadStatus').dataset.message) get('loadStatus').textContent = t(get('loadStatus').dataset.message);
  render();
}

get('language').addEventListener('click', () => {
  ar = !ar;
  localStorage.setItem('pump-lang', ar ? 'ar' : 'en');
  language();
});
adc.addEventListener('input', () => {
  if (adc.validity.valid && adc.value !== '') slider.value = adc.value;
  render();
});
slider.addEventListener('input', () => {
  adc.value = slider.value;
  render();
});
get('examples').addEventListener('click', event => {
  const button = event.target.closest('[data-adc]');
  if (!button) return;
  adc.value = slider.value = button.dataset.adc;
  render();
});

get('loadStatus').dataset.message = 'loading';
language();
fetch('/synthetic-vwc.json').then(response => {
  if (!response.ok) throw Error('model request failed');
  return response.json();
}).then(result => {
  if (result.provenance !== 'synthetic_only') throw Error('wrong model');
  model = result;
  get('trainingCount').textContent = model.evaluation.independent_samples;
  get('heldCount').textContent = model.held_out.samples;
  get('holdoutError').textContent = model.held_out.mae_percentage_points.toFixed(2);
  delete get('loadStatus').dataset.message;
  get('loadStatus').textContent = '';
  render();
}).catch(() => {
  get('loadStatus').dataset.message = 'failed';
  language();
});
