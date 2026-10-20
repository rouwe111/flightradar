import { INK, PINK } from '@/components/dashboard/constants'
import { rad } from '@/lib/geo'
import type { SkyPlane } from '@/lib/types'

export function Radar({
  planes,
  rangeKm,
  selectedHex,
  onSelect,
}: {
  planes: Array<SkyPlane>
  rangeKm: number
  selectedHex: string
  onSelect: (hex: string) => void
}) {
  const C = 200
  const R = 176
  const pos = (p: SkyPlane) => ({
    x: C + (p.dKm * Math.sin(rad(p.brg)) * R) / rangeKm,
    y: C - (p.dKm * Math.cos(rad(p.brg)) * R) / rangeKm,
  })
  const labels: Array<[string, number, number]> = [
    ['N', C, 16],
    ['E', 386, C + 5],
    ['S', C, 394],
    ['W', 14, C + 5],
  ]

  // Three stacked layers with the same viewBox: background, sweep, planes.
  // Only the sweep layer moves, and it rotates as a whole element, which the
  // browser composites on the GPU without repainting the radar each frame.
  return (
    <div className="ov-radar-stack">
      <svg
        viewBox="0 0 400 400"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
        className="ov-radar"
      >
        <circle cx={C} cy={C} r={R} fill="#fff" fillOpacity="0.75" />
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <g key={f}>
            <circle
              cx={C}
              cy={C}
              r={R * f}
              fill="none"
              stroke={INK}
              strokeOpacity="0.18"
            />
            <text
              x={C + 4}
              y={C - R * f + 13}
              fontSize="11"
              fill={INK}
              fillOpacity="0.65"
            >
              {Math.round(rangeKm * f)} km
            </text>
          </g>
        ))}
        <line
          x1={C}
          y1={C - R}
          x2={C}
          y2={C + R}
          stroke={INK}
          strokeOpacity="0.14"
        />
        <line
          x1={C - R}
          y1={C}
          x2={C + R}
          y2={C}
          stroke={INK}
          strokeOpacity="0.14"
        />
        {labels.map(([t, x, y]) => (
          <text
            key={t}
            x={x}
            y={y}
            textAnchor="middle"
            fontSize="15"
            fontWeight="800"
            fill={INK}
          >
            {t}
          </text>
        ))}
      </svg>
      <svg
        viewBox="0 0 400 400"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
        className="ov-radar ov-sweep"
      >
        <g>
          <path
            d={`M${C} ${C} L${C} ${C - R} A${R} ${R} 0 0 0 ${C - R * 0.574} ${C - R * 0.819} Z`}
            fill={PINK}
            fillOpacity="0.12"
          />
          <line
            x1={C}
            y1={C}
            x2={C}
            y2={C - R}
            stroke={PINK}
            strokeOpacity="0.5"
            strokeWidth="1.5"
          />
        </g>
      </svg>
      <svg
        viewBox="0 0 400 400"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Radar view of aircraft around the house"
        className="ov-radar"
      >
        {planes
          .filter((p) => p.dKm <= rangeKm)
          .map((p) => {
            const { x, y } = pos(p)
            const sel = p.hex === selectedHex
            return (
              <g
                key={p.hex}
                transform={`translate(${x} ${y})`}
                onClick={() => onSelect(p.hex)}
                style={{ cursor: 'pointer' }}
              >
                <circle r="14" fill="transparent" />
                {sel && (
                  <circle r="14" fill="none" stroke={PINK} strokeWidth="2.5" />
                )}
                <path
                  d="M0 -9 L5.5 7 L0 4 L-5.5 7 Z"
                  transform={`rotate(${p.track ?? 0}) scale(${sel ? 1.35 : 1})`}
                  fill={sel ? PINK : INK}
                  fillOpacity={sel ? 1 : 0.6}
                />
                {sel && p.callsign && (
                  <text
                    y="-20"
                    textAnchor="middle"
                    fontSize="13"
                    fontWeight="800"
                    fill={INK}
                  >
                    {p.callsign}
                  </text>
                )}
              </g>
            )
          })}

        <circle cx={C} cy={C} r="5" fill={INK} />
        <circle
          cx={C}
          cy={C}
          r="9"
          fill="none"
          stroke={INK}
          strokeWidth="1.5"
        />
      </svg>
    </div>
  )
}
