interface RiskGaugeProps {
  score: number;
  size?: number;
}

const getColor = (score: number) => {
  if (score >= 75) return '#dc2626';
  if (score >= 50) return '#ea580c';
  if (score >= 30) return '#d97706';
  return '#16a34a';
};

const getLevel = (score: number) => {
  if (score >= 75) return 'CRITICAL';
  if (score >= 50) return 'HIGH';
  if (score >= 30) return 'MODERATE';
  return 'LOW';
};

export default function RiskGauge({ score, size = 160 }: RiskGaugeProps) {
  const color = getColor(score);
  const level = getLevel(score);
  const radius = (size - 20) / 2;
  const circumference = Math.PI * radius; // half circle
  const offset = circumference - (score / 100) * circumference;
  const cx = size / 2;
  const cy = size / 2 + 10;

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size * 0.65} viewBox={`0 0 ${size} ${size * 0.65}`}>
        {/* Background arc */}
        <path
          d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
          fill="none"
          stroke="#1c2a47"
          strokeWidth="10"
          strokeLinecap="round"
        />
        {/* Score arc */}
        <path
          d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s ease-out, stroke 0.5s ease' }}
        />
        {/* Score text */}
        <text x={cx} y={cy - 15} textAnchor="middle" className="fill-white text-2xl font-bold" style={{ fontSize: size * 0.18 }}>
          {score}
        </text>
        <text x={cx} y={cy - 2} textAnchor="middle" className="fill-slate-400 text-xs" style={{ fontSize: size * 0.07 }}>
          / 100
        </text>
      </svg>
      <div className="mt-1 px-3 py-1 rounded text-xs font-bold uppercase tracking-wider" style={{ color, backgroundColor: `${color}15` }}>
        {level}
      </div>
    </div>
  );
}
