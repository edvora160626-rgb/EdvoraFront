function Sparkline({
  points = [4, 8, 6, 10, 7, 12, 9],
  color = "#A77A95",
  height = 28,
  width = 80,
}) {
  const max = Math.max(...points, 1);
  const min = Math.min(...points, 0);
  const range = max - min || 1;
  const step = width / Math.max(points.length - 1, 1);
  const coords = points
    .map((p, i) => {
      const x = i * step;
      const y = height - ((p - min) / range) * (height - 4) - 2;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} className="overflow-visible" aria-hidden>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={coords}
        opacity="0.85"
      />
    </svg>
  );
}

export default Sparkline;
