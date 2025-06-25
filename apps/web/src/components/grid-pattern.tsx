import { type SVGProps, useId } from 'react'

export type GridPattern = Omit<
  SVGProps<SVGSVGElement>,
  'width' | 'height' | 'x' | 'y'
> & {
  width: number
  height: number
  x: string | number
  y: string | number
  squares: Array<[x: number, y: number]>
}

export function GridPattern({
  width,
  height,
  x,
  y,
  squares,
  ...props
}: GridPattern) {
  const patternId = useId()

  return (
    <svg aria-hidden='true' {...props}>
      <defs>
        <pattern
          id={patternId}
          width={width}
          height={height}
          patternUnits='userSpaceOnUse'
          x={x}
          y={y}
        >
          <path d={`M.5 ${height}V.5H${width}`} fill='none' />
        </pattern>
      </defs>

      <rect
        width='100%'
        height='100%'
        strokeWidth={0}
        fill={`url(#${patternId})`}
      />

      {squares && (
        <svg x={x} y={y} className='overflow-visible'>
          <title>square</title>

          {squares.map(([x, y]) => (
            <rect
              strokeWidth='0'
              key={`${x}-${y}`}
              width={width + 1}
              height={height + 1}
              x={x * width}
              y={y * height}
            />
          ))}
        </svg>
      )}
    </svg>
  )
}
