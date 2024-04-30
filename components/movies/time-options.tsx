import React from 'react'
import { Button } from '../ui/button'
import { useUIState, useActions } from 'ai/rsc'
import type { AI } from '@/lib/chat/actions'

interface TimeOptionsProps {
  times: string[] | undefined
  title: string
}

const TimeOptions: React.FC<TimeOptionsProps> = ({ times, title }) => {
  const [, setMessages] = useUIState<typeof AI>()
  const { submitUserMessage } = useActions()
  return (
    <div className="flex gap-2 mt-2">
      {times?.map(time => {
        return (
          <Button
            variant="outline"
            key={time}
            onClick={async () => {
              const response = await submitUserMessage(
                `I would like to pick seats for ${title} at ${time}`
              )
              setMessages(currentMessages => [...currentMessages, response])
            }}
          >
            {time}
          </Button>
        )
      })}
    </div>
  )
}

export default TimeOptions
