'use strict';

const fieldEstimates = (() => {
  function areaM2(points) {
    if (!Array.isArray(points) || points.length < 3) return null;
    const earthRadius = 6371008.8;
    const radians = degrees => degrees * Math.PI / 180;
    const [lat, lon] = points[0];
    const projected = points.map(([y, x]) => [
      earthRadius * radians(((x - lon + 540) % 360) - 180) * Math.cos(radians(lat)),
      earthRadius * radians(y - lat)
    ]);
    const area = Math.abs(projected.reduce((sum, [x, y], i) => {
      const [nextX, nextY] = projected[(i + 1) % projected.length];
      return sum + x * nextY - nextX * y;
    }, 0)) / 2;
    return Number.isFinite(area) && area >= 1 ? area : null;
  }

  function weatherReference(rows, area) {
    if (rows.length !== 5 || rows.some(row => !Number.isFinite(row.values[2]) || row.values[2] < 0)) return null;
    const mm = rows.reduce((sum, row) => sum + row.values[2], 0);
    return { mm, litres: area == null ? null : mm * area };
  }

  function rotationFit(plan, localCalendar) {
    const rotations = ['base', 'legume', 'mixed'];
    const fit = rotations.filter(key => Number.isFinite(plan.budget) && Number.isFinite(plan[key]) && plan[key] <= plan.budget);
    const order = {
      water: [...fit].sort((a, b) => plan[a] - plan[b]),
      cover: ['legume', 'mixed', 'base'],
      harvest: ['base', 'mixed', 'legume']
    };
    const first = order[plan.priority].find(key => fit.includes(key) && (localCalendar || key === 'base'));
    return { fit, first };
  }

  function measurementStatus(rows, key, low, high, currentTime = Date.now()) {
    const reading = rows.find(row => Number.isFinite(row[key]));
    if (!reading) return { state: 'missing' };
    const elapsed = currentTime - Date.parse(reading.timestamp);
    const common = { value: reading[key], timestamp: reading.timestamp, origin: reading.origin };
    if (!Number.isFinite(elapsed) || elapsed > 3600000) return { ...common, state: 'old' };
    if (!Number.isFinite(low) && !Number.isFinite(high)) return { ...common, state: 'limits' };
    if (Number.isFinite(low) && reading[key] < low) return { ...common, state: 'low' };
    if (Number.isFinite(high) && reading[key] > high) return { ...common, state: 'high' };
    return { ...common, state: 'within' };
  }
  function thermalSignal(result, limit, currentTime = Date.now()) {
    if (!result?.points?.length) return null;
    const pixels = result.points.map(point => point.celsius).filter(Number.isFinite);
    if (!pixels.length) return null;
    const age = currentTime - Date.parse(result.observation);
    const recent = Number.isFinite(age) && age >= 0 && age <= 72 * 3600000;
    return {
      min: Math.min(...pixels), max: Math.max(...pixels), count: pixels.length,
      hot: Number.isFinite(limit) ? pixels.filter(value => value >= limit).length : null,
      fresh: recent && !result.stale
    };
  }
  return { areaM2, weatherReference, rotationFit, measurementStatus, thermalSignal };
})();
