'use client'

/* eslint-disable @next/next/no-img-element */
import React from 'react'
import Image from 'next/image'
import { useUIState, useActions } from 'ai/rsc'
import type { AI } from '@/lib/chat/actions'
import type { MovieProps } from '@/lib/types'
import type { Movie } from '@/lib/types'
import SelectTime from './select-time'
import TimeOptions from './time-options'

const MovieList: React.FC<MovieProps> = ({ movies }) => {
  const [, setMessages] = useUIState<typeof AI>()
  const { submitUserMessage } = useActions()

  // no movies found
  if (!movies.length)
    return <p>We could not find movies matching your search. </p>

  // found exact movie
  if (movies.length === 1)
    return (
      <div>
        {movies.map((movie: Movie) => {
          return (
            <div
              key={movie.title}
              className="flex gap-2 border border-zinc-300 rounded-md overflow-hidden"
            >
              <Image
                alt={movie.title}
                className="aspect-poster object-cover"
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${movie.poster_key}`}
                width={120}
                height={200}
              />
              <div className="p-2">
                <h4 className="font-semibold text-md">{movie.title}</h4>
                <span className="text-slate-500 text-sm">
                  English &middot;{' '}
                </span>
                <span className="text-slate-500 text-sm">{movie.rating}</span>
                <TimeOptions
                  times={['15:30', '17:20', '19:30', '20:00', '21:50']}
                  title={movie.title}
                />
              </div>
            </div>
          )
        })}
      </div>
    )

  // list all movies
  return (
    <div className="grid grid-cols-2 gap-2">
      {movies.map((movie: Movie) => {
        return (
          <div
            key={movie.title}
            className="flex gap-2 cursor-pointer transition-all border border-zinc-300 rounded-md hover:bg-zinc-200 overflow-hidden"
            onClick={async () => {
              const response = await submitUserMessage(
                `I have selected the following movie: ${movie.title}. [System: User is trying to select times for ${movie.title}, Call the select_time function.]`
              )
              setMessages(currentMessages => [...currentMessages, response])
            }}
          >
            <Image
              alt={movie.title}
              className="aspect-poster object-cover"
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${movie.poster_key}`}
              width={70}
              height={100}
            />
            <div className="p-2">
              <h4 className="font-semibold text-md">{movie.title}</h4>
              <span className="text-slate-500 text-sm">English &middot; </span>
              <span className="text-slate-500 text-sm">{movie.rating}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default MovieList
