/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
'use client'

import { useAIState, useActions, useUIState } from 'ai/rsc'
import { useEffect, useState } from 'react'
import { SparklesIcon } from '../ui/icons'
import { Button } from '../ui/button'

interface SelectSeatsProps {
  summary: {
    movie: string
    time: string
    date: string
  }
}

export const suggestions = [
  'Proceed to checkout',
  'List hotels and make a reservation'
]

export const SelectSeats = ({ summary }: SelectSeatsProps) => {
  const [aiState, setAIState] = useAIState()
  const [selectedSeats, setSelectedSeats] = useState<string[]>([])
  // const { movie, time, date } = summary
  const [, setMessages] = useUIState()
  const { submitUserMessage } = useActions()
  const price = 7.5

  const [numberOfSeats, setNumberOfSeats] = useState([
    10, 9, 8, 7, 6, 5, 4, 3, 2, 1
  ])
  const [seatRows, setSeatRows] = useState(['A', 'B', 'C', 'D', 'E'])

  const availableSeats = seatRows.flatMap(row =>
    numberOfSeats.map(seat => `${row}${seat}`)
  )

  function formatPrice(selectedSeatsLength: number, price: number) {
    const totalPrice = selectedSeatsLength * price
    const formattedPrice = totalPrice.toFixed(2).replace('.', ',') // Converts to two decimal places and uses comma
    return `$${formattedPrice}`
  }

  function formatDate(dateString: string): string {
    const date = new Date(dateString)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)

    // Set time to 00:00:00 to ignore time part in comparisons
    date.setHours(0, 0, 0, 0)
    today.setHours(0, 0, 0, 0)
    tomorrow.setHours(0, 0, 0, 0)

    if (date.getTime() === today.getTime()) {
      return 'Today'
    } else if (date.getTime() === tomorrow.getTime()) {
      return 'Tomorrow'
    } else {
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long', // 'long', 'short', or 'narrow'
        // year: 'numeric', // 'numeric' or '2-digit'
        month: 'long', // 'numeric', '2-digit', 'long', 'short', or 'narrow'
        day: 'numeric' // 'numeric' or '2-digit'
      }
      return date.toLocaleDateString('en-US', options)
    }
  }

  return (
    <div className="grid gap-4">
      <p>Great! Please select a seat to continue.</p>
      <div className="grid gap-4 p-4 sm:p-6 border border-zinc-200 rounded-2xl bg-white">
        <div className="flex items-center gap-4">
          <div className="w-10 sm:w-12 shrink-0 aspect-square rounded-lg bg-zinc-50 overflow-hidden">
            <img
              src="https://www.gstatic.com/flights/airline_logos/70px/UA.png"
              className="object-cover aspect-square"
              alt="airline logo"
            />
          </div>
          <div>
            <div className="font-medium">{formatDate(summary.date)}</div>
            <div className="text-sm text-zinc-600">
              {summary.movie} at {summary.time}
            </div>
          </div>
        </div>
        <div className="relative flex w-ful p-4 sm:p-6 justify-center rounded-xl sm:rounded-lg bg-zinc-50">
          <div className="flex flex-col gap-4 p-4 border border-zinc-200 rounded-lg bg-zinc-50">
            <div className="pl-8">
              <p className="w-full bg-slate-600 text-white rounded-sm text-center">
                Screen
              </p>
            </div>
            {seatRows.map((row, rowIndex) => (
              <div key={`row-${rowIndex}`} className="flex flex-row gap-3">
                {numberOfSeats.map((seat, seatIndex) => (
                  <div
                    key={`seat-${seatIndex}`}
                    className={`align-center relative flex size-6 flex-row items-center justify-center rounded ${
                      seatIndex === 0
                        ? 'transparent'
                        : selectedSeats.includes(`${row}${seat}`)
                          ? 'cursor-pointer border-x border-b border-emerald-500 bg-emerald-300'
                          : availableSeats.includes(`${row}${seat}`)
                            ? 'cursor-pointer border-x border-b border-sky-500 bg-sky-200'
                            : 'cursor-not-allowed border-x border-b border-zinc-300 bg-zinc-200'
                    }`}
                    onClick={() => {
                      if (selectedSeats.includes(`${row}${seat}`)) {
                        setSelectedSeats(
                          selectedSeats.filter(s => s !== `${row}${seat}`)
                        )
                      } else {
                        setSelectedSeats([...selectedSeats, `${row}${seat}`])
                      }
                    }}
                  >
                    {seatIndex === 0 ? (
                      <div className="w-6 text-sm text-center tabular-nums text-zinc-500">
                        {row}
                      </div>
                    ) : (
                      <div
                        className={`absolute top-0 h-2 w-7 rounded border ${
                          selectedSeats.includes(`${row}${seat}`)
                            ? 'border-emerald-500 bg-emerald-300'
                            : availableSeats.includes(`${row}${seat}`)
                              ? 'border-sky-500 bg-sky-300'
                              : 'border-zinc-300 bg-zinc-200'
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            ))}
            <div className="flex gap-3">
              {numberOfSeats.map((seat, index) => {
                if (seat === numberOfSeats.length)
                  return <div className="w-6" key={seat}></div>
                return (
                  <div
                    key={seat}
                    className="w-6 text-sm text-center shrink-0 text-zinc-500"
                  >
                    {seat}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
        {/* {selectedSeats.length > 0 && ( */}
        <div>
          <div>
            <div className="flex justify-between items-center">
              <p>
                <span className="text-xl font-bold">
                  {selectedSeats.length}
                </span>{' '}
                seats
              </p>
              <div>
                <p>{formatPrice(selectedSeats.length, price)} USD</p>
              </div>
            </div>
            <div className="flex items-center min-h-4">
              {selectedSeats.map((seat, index) => {
                return (
                  <span className="text-xs text-slate-400" key={seat}>
                    {seat}
                    {index < selectedSeats.length - 1 ? `${' '}·${' '}` : ' '}
                  </span>
                )
              })}
            </div>
          </div>
          <div className="flex flex-col items-end justify-center w-full">
            <Button
              disabled={selectedSeats.length === 0}
              onClick={async () => {
                const response = await submitUserMessage(
                  `I would like to purchase ${selectedSeats.length} seats for ${summary.movie} at ${summary.time}. Please proceed to checkout by calling the purchase tickets function with a price of ${selectedSeats.length * 7.5}.`
                )
                setMessages((currentMessages: any) => [
                  ...currentMessages,
                  response
                ])
              }}
            >
              Proceed to checkout
            </Button>
          </div>
        </div>
        {/* )} */}
      </div>
    </div>
  )
}
