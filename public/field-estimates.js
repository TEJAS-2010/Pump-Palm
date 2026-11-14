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

  return { areaM2, weatherReference };
})();
