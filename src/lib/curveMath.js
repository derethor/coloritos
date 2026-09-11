// Ramer–Douglas–Peucker fitting keeps only pivots that materially affect the ramp.
export function fitPivots(values, normalize, tolerance = 0.018) {
  const points = values.map((v, i) => ({ x: i / (values.length - 1), y: normalize(v) }));
  const keep = new Set([0, points.length - 1]);
  function simplify(first, last) {
    const a = points[first],
      b = points[last];
    let best = -1,
      index = -1;
    for (let i = first + 1; i < last; i++) {
      const expected = a.y + ((b.y - a.y) * (points[i].x - a.x)) / (b.x - a.x);
      const error = Math.abs(points[i].y - expected);
      if (error > best) {
        best = error;
        index = i;
      }
    }
    if (best > tolerance) {
      keep.add(index);
      simplify(first, index);
      simplify(index, last);
    }
  }
  simplify(0, points.length - 1);
  return [...keep].sort((a, b) => a - b).map((i) => points[i]);
}

export function tangent(pivots, i) {
  if (i === 0) return (pivots[1].y - pivots[0].y) / (pivots[1].x - pivots[0].x);
  if (i === pivots.length - 1) {
    const a = pivots[i - 1],
      b = pivots[i];
    return (b.y - a.y) / (b.x - a.x);
  }
  return (pivots[i + 1].y - pivots[i - 1].y) / (pivots[i + 1].x - pivots[i - 1].x);
}

export function controls(pivots, i) {
  const a = pivots[i],
    b = pivots[i + 1],
    dx = (b.x - a.x) / 3;
  return [
    { x: a.x + dx, y: a.y + tangent(pivots, i) * dx },
    { x: b.x - dx, y: b.y - tangent(pivots, i + 1) * dx },
  ];
}

export function sampleAt(pivots, x) {
  let i = Math.min(
    pivots.length - 2,
    Math.max(
      0,
      pivots.findIndex((p, j) => j < pivots.length - 1 && x >= p.x && x <= pivots[j + 1].x),
    ),
  );
  const a = pivots[i],
    b = pivots[i + 1],
    [c1, c2] = controls(pivots, i),
    t = (x - a.x) / (b.x - a.x),
    u = 1 - t;
  return Math.min(1, Math.max(0, u * u * u * a.y + 3 * u * u * t * c1.y + 3 * u * t * t * c2.y + t * t * t * b.y));
}

export function sampledValues(pivots, n, denormalize) {
  return Array.from({ length: n }, (_, i) => denormalize(sampleAt(pivots, i / (n - 1))));
}
