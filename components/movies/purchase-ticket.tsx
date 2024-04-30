'use client'

import { CardIcon, SparklesIcon } from '@/components/ui/icons'
import { cn } from '@/lib/utils'
import { readStreamableValue, useActions, useUIState } from 'ai/rsc'
import { useState } from 'react'

type Status =
  | 'requires_confirmation'
  | 'requires_code'
  | 'completed'
  | 'failed'
  | 'expired'

interface PurchaseProps {
  status: Status
  summary: {
    movie: string
    time: string
    price: number
    seats: string[]
  }
}

export const suggestions = ['Show ticket', 'Buy snacks']

export const PurchaseTickets = ({
  status = 'requires_confirmation',
  summary = {
    movie: 'American Airlines',
    time: '10:00 AM',
    price: 100,
    seats: ['1A', '2A']
  }
}: PurchaseProps) => {
  const [currentStatus, setCurrentStatus] = useState(status)
  const { submitUserMessage, requestCode, validateCode } = useActions()
  const [display, setDisplay] = useState(null)
  const [_, setMessages] = useUIState()

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 p-4 sm:p-6 border border-zinc-200 rounded-2xl bg-white">
        <div className="flex">
          <div className="flex items-center gap-2 text-zinc-950">
            <div className="size-6 flex items-center justify-center bg-zinc-100 rounded-full text-zinc-500 [&>svg]:size-3">
              <CardIcon />
            </div>
            <div className="text-sm text-zinc-600">Visa · · · · 0512</div>
          </div>
        </div>
        {currentStatus === 'requires_confirmation' ? (
          <div className="flex flex-col gap-4">
            <p className="">
              You are one step away. Please confirm your purchase to continue.
            </p>
            <button
              className="p-2 text-center rounded-full cursor-pointer bg-zinc-900 text-zinc-50 hover:bg-zinc-600 transition-colors"
              onClick={async () => {
                const { status, display } = await requestCode()
                setCurrentStatus(status)
                setDisplay(display)
              }}
            >
              Pay ${summary.price}
            </button>
          </div>
        ) : currentStatus === 'requires_code' ? (
          <>
            <div>Enter the CVC code for your card ending in 0512</div>
            <div className="flex justify-center p-2 text-center border rounded-full text-zinc-950">
              <input
                className="w-16 text-center bg-transparent outline-none tabular-nums"
                type="text"
                maxLength={4}
                placeholder="------"
                autoFocus
              />
            </div>
            <button
              className="p-2 text-center rounded-full cursor-pointer bg-zinc-900 text-zinc-50 hover:bg-zinc-600 transition-colors"
              onClick={async () => {
                const { status, display } = await validateCode()

                for await (const statusFromStream of readStreamableValue(
                  status
                )) {
                  setCurrentStatus(statusFromStream as Status)
                  setDisplay(display)
                }
              }}
            >
              Submit
            </button>
          </>
        ) : // add later:  || currentStatus === 'in_progress'
        currentStatus === 'completed' ? (
          display
        ) : currentStatus === 'expired' ? (
          <div className="flex items-center justify-center gap-3">
            Your Session has expired!
          </div>
        ) : null}
      </div>

      <div
        className={cn(
          'flex flex-col sm:flex-row items-start gap-2',
          currentStatus === 'completed' ? 'opacity-100' : 'opacity-0'
        )}
      >
        {suggestions.map(suggestion => (
          <button
            key={suggestion}
            className="flex items-center gap-2 px-3 py-2 text-sm transition-colors bg-zinc-50 hover:bg-zinc-100 rounded-xl cursor-pointer"
            onClick={async () => {
              const response = await submitUserMessage(suggestion)
              setMessages((currentMessages: any[]) => [
                ...currentMessages,
                response
              ])
            }}
          >
            <SparklesIcon />
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  )
}
