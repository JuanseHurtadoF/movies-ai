'use client'
import React from 'react'
import { SelectSeats } from '@/components/movies/select-seats'
import { PurchaseTickets } from '@/components/movies/purchase-ticket'

const Page = () => {
  return (
    <div className="max-w-2xl mx-auto">
      <PurchaseTickets
        status="requires_confirmation"
        summary={{
          movie: 'The Matrix',
          time: '8:00 PM',
          price: 10,
          seats: ['J1', 'J2']
        }}
      />
    </div>
  )
}

export default Page
