'use client'
import React from 'react'
import { Button } from '../ui/button'
import TimeOptions from './time-options'

interface SelectTimeProps {
  times: string[]
  title: string
}

const SelectTime: React.FC<SelectTimeProps> = ({ times, title }) => {
  return (
    <div>
      <p>{`At what time would you like to watch ${title}?`}</p>
      <TimeOptions times={times} title={title} />
    </div>
  )
}

export default SelectTime
