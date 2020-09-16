import React from 'react'
import { ReactComponent as IconStar } from '../images/icons/comment-star.svg'

export interface StarsProps {
  value: number
  size?: number
  className?: string
  starClassName?: string
  onStar?: (star: number) => void
}

export default function Stars(props: StarsProps) {

  const {
    value,
    size = 18,
    className = '',
    starClassName = '',
    onStar = () => {},
  } = props

  const width = size
  const height = size

  let starList = Array
    .from('1'.repeat(Math.floor(value)))
    .map(Number)
    .concat([value % 1, 0, 0, 0, 0])
    .slice(0, 5)

  return (
    <div className={className}>
      {starList.map((percent, index) => (
        <span
          key={index}
          className={`inline-block relative ${starClassName}`}
          style={{ width, height, fontSize: 0 }}
          onClick={() => onStar(index + 1)}
        >
          <span className="block w-full h-full absolute">
            {(IconStar as any).render({ width, height, fill: '#E4E4E4' })}
          </span>
          <span
            className="block h-full absolute overflow-hidden"
            style={{ width: `${percent * 100}%` }}
          >
            {(IconStar as any).render({ width, height, fill: '#3A88FD' })}
          </span>
        </span>
      ))}
    </div>
  )
}
