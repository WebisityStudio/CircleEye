import React from 'react';

interface ThreatMeterProps {
  level: number; // 0-4 corresponding to the 5 threat levels
  levelLabel?: string;
  heading?: string;
  isLoading?: boolean;
  onFindOutMore?: () => void;
}

const THREAT_COLORS = [
  { level: 0, label: 'Low', color: '#15CC3D' },
  { level: 1, label: 'Moderate', color: '#88C100' },
  { level: 2, label: 'Substantial', color: '#F6C833' },
  { level: 3, label: 'Severe', color: '#F97B22' },
  { level: 4, label: 'Critical', color: '#D90429' },
];

export function ThreatMeter({
  level = 0,
  levelLabel,
  heading = 'Terrorist Threat Level',
  isLoading = false,
  onFindOutMore,
}: ThreatMeterProps) {
  const size = 280;
  const strokeWidth = 32;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;

  const safeLevel = Math.max(0, Math.min(THREAT_COLORS.length - 1, level));
  const perSectionAngle = Math.PI / THREAT_COLORS.length;
  const gapAngle = 0.03;

  // Calculate needle angle - point to middle of current level's arc
  const sectionStart = Math.PI + safeLevel * perSectionAngle + gapAngle / 2;
  const sectionEnd = Math.PI + (safeLevel + 1) * perSectionAngle - gapAngle / 2;
  const needleAngle = (sectionStart + sectionEnd) / 2;

  // Generate arc sections
  const sections = THREAT_COLORS.map((item, i) => {
    const start = Math.PI + i * perSectionAngle + gapAngle / 2;
    const end = Math.PI + (i + 1) * perSectionAngle - gapAngle / 2;
    return { color: item.color, start, end };
  });

  // Convert polar to cartesian
  const polarToCartesian = (angle: number, r: number) => ({
    x: center + r * Math.cos(angle),
    y: center + r * Math.sin(angle),
  });

  // Create arc path
  const describeArc = (startAngle: number, endAngle: number, innerR: number, outerR: number) => {
    const startOuter = polarToCartesian(startAngle, outerR);
    const endOuter = polarToCartesian(endAngle, outerR);
    const startInner = polarToCartesian(endAngle, innerR);
    const endInner = polarToCartesian(startAngle, innerR);

    const largeArcFlag = endAngle - startAngle <= Math.PI ? 0 : 1;

    return [
      'M', startOuter.x, startOuter.y,
      'A', outerR, outerR, 0, largeArcFlag, 1, endOuter.x, endOuter.y,
      'L', startInner.x, startInner.y,
      'A', innerR, innerR, 0, largeArcFlag, 0, endInner.x, endInner.y,
      'Z'
    ].join(' ');
  };

  // Needle path
  const needleLength = radius - strokeWidth - 10;
  const needleTip = polarToCartesian(needleAngle, needleLength);
  const needleBase1 = polarToCartesian(needleAngle + Math.PI / 2, 6);
  const needleBase2 = polarToCartesian(needleAngle - Math.PI / 2, 6);

  const needlePath = `M ${needleBase1.x} ${needleBase1.y} L ${needleTip.x} ${needleTip.y} L ${needleBase2.x} ${needleBase2.y} Z`;

  // Background arc
  const bgArcPath = describeArc(Math.PI, 2 * Math.PI, radius - strokeWidth * 1.1, radius + strokeWidth * 0.1);

  return (
    <div className="relative bg-brand-inputBackground rounded-2xl p-6 flex flex-col items-center">
      {onFindOutMore && (
        <button
          onClick={onFindOutMore}
          className="absolute top-4 right-5 text-brand-primary underline text-sm font-semibold hover:text-brand-secondary transition-colors z-10"
        >
          Find out more
        </button>
      )}

      <svg
        width={size}
        height={size / 2 + 40}
        viewBox={`0 0 ${size} ${size / 2 + 40}`}
        className="mt-2"
      >
        {/* Background arc */}
        <path d={bgArcPath} fill="#2B2B2B" />

        {/* Colored segments */}
        {sections.map((section, i) => (
          <path
            key={i}
            d={describeArc(section.start, section.end, radius - strokeWidth + 2, radius - 2)}
            fill={section.color}
            style={{ transition: 'fill 0.3s ease' }}
          />
        ))}

        {/* Needle */}
        {!isLoading && (
          <>
            <path
              d={needlePath}
              fill="#fff"
              style={{
                transition: 'all 0.5s ease-out',
                transformOrigin: `${center}px ${center}px`,
              }}
            />
            <circle cx={center} cy={center} r={8} fill="#fff" />
          </>
        )}

        {/* Loading indicator */}
        {isLoading && (
          <text
            x={center}
            y={center - 20}
            textAnchor="middle"
            fill="#666"
            fontSize="14"
          >
            Loading...
          </text>
        )}
      </svg>

      {/* Label below meter */}
      <div className="text-center -mt-4">
        <p
          className="text-xl font-bold mb-2"
          style={{ color: THREAT_COLORS[safeLevel].color }}
        >
          {isLoading ? 'Loading' : (levelLabel ?? 'Unknown')}
        </p>
        <h3 className="text-2xl font-bold text-brand-text">{heading}</h3>
      </div>
    </div>
  );
}

export default ThreatMeter;
