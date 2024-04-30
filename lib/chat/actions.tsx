import 'server-only'

import {
  createAI,
  createStreamableUI,
  getMutableAIState,
  getAIState,
  render,
  createStreamableValue
} from 'ai/rsc'
import OpenAI from 'openai'
import { redirect } from 'next/navigation'
import { getMovies, getAllMovies } from '@/lib/tools'
import {
  spinner,
  BotCard,
  BotMessage,
  SystemMessage,
  Stock,
  Purchase
} from '@/components/stocks'
import { Sale } from '@/components/stocks/stock-sale'
import type { Movie, Search } from '@/lib/types'

import { z } from 'zod'
import { MoviesSkeleton } from '@/components/stocks/movies-skeleton'
import { Events } from '@/components/stocks/events'
import { Stocks } from '@/components/stocks/stocks'
import { sleep, nanoid } from '@/lib/utils'
import { SpinnerMessage, UserMessage } from '@/components/stocks/message'
import { Chat } from '@/lib/types'
import { createClient } from '../supabase/server'
import { SelectSeats } from '@/components/movies/select-seats'
import MovieList from '@/components/movies/movies-list'
import SelectTime from '@/components/movies/select-time'
import { PurchaseTickets } from '@/components/movies/purchase-ticket'
import { IconCheck, IconSpinner } from '@/components/ui/icons'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
})

async function submitUserMessage(content: string) {
  'use server'

  const aiState = getMutableAIState<typeof AI>()

  aiState.update({
    ...aiState.get(),
    messages: [
      ...aiState.get().messages,
      {
        id: nanoid(),
        role: 'user',
        content
      }
    ]
  })

  let textStream: undefined | ReturnType<typeof createStreamableValue<string>>
  let textNode: undefined | React.ReactNode

  const ui = render({
    model: 'gpt-3.5-turbo',
    provider: openai,
    initial: <SpinnerMessage />,
    messages: [
      {
        role: 'system',
        content: `
        You are a friendly assistant for users who want to purchase movie tickets. You will have information about movies and their availability, and the ability to modify the UI through the tools available. 


        When the user wants see all available movies, call get_all_movies to show a list of all available movies. 
        When the user wants to search for movies, call search_movies. You have two options here: 
        1. Search for a specific movie, like "Do you have tickets for Spiderman?" or "are you playing The Matrix", in which case you would call search_movies limit of 1 (since only 1 is being asked for). 
        2. Semantic search, for when the users asks for "movies to watch with my kids", "movies about war", or "superhero movies". In this case, you would call search_movies with a limit of 6. 

        When the user interacts with the UI, the messages you receive will direct you to the correct function to call to update the UI, with the parameters you need. 
        `
      },
      ...aiState.get().messages.map((message: any) => ({
        role: message.role,
        content: message.content,
        name: message.name
      }))
    ],
    text: ({ content, done, delta }) => {
      if (!textStream) {
        textStream = createStreamableValue('')
        textNode = <BotMessage content={textStream.value} />
      }

      if (done) {
        textStream.done()
        aiState.done({
          ...aiState.get(),
          messages: [
            ...aiState.get().messages,
            {
              id: nanoid(),
              role: 'assistant',
              content
            }
          ]
        })
      } else {
        textStream.update(delta)
      }

      return textNode
    },
    functions: {
      show_all_movies: {
        description: 'Provide a list of available movies',
        parameters: z.object({}),
        render: async function* ({}) {
          yield (
            <BotCard>
              <MoviesSkeleton />
            </BotCard>
          )

          const userInput = aiState.get().messages
          const lastMessage = userInput.slice(-2)[userInput.length - 1].content

          let movies: Movie[] = (await getAllMovies()) || []

          aiState.done({
            ...aiState.get(),
            messages: [
              ...aiState.get().messages,
              {
                id: nanoid(),
                role: 'function',
                name: 'showMovies',
                content: JSON.stringify(movies)
              }
            ]
          })

          return (
            <BotCard>
              <MovieList movies={movies} />
            </BotCard>
          )
        }
      },
      search_movies: {
        description: 'Search for movies',
        parameters: z.object({
          search: z.string(),
          limit: z.number()
        }),
        render: async function* ({ search }) {
          yield (
            <BotCard>
              <MoviesSkeleton />
            </BotCard>
          )

          const movies = await getMovies(search, 1)

          aiState.done({
            ...aiState.get(),
            messages: [
              ...aiState.get().messages,
              {
                id: nanoid(),
                role: 'function',
                name: 'searchMovies',
                content: JSON.stringify(movies)
              }
            ]
          })

          return (
            <BotCard>
              <MovieList movies={movies} />
            </BotCard>
          )
        }
      },
      show_times: {
        description: 'Provide a list of available times',
        parameters: z.object({
          title: z.string(),
          times: z.array(z.string())
        }),
        render: async function* ({ title, times }) {
          yield (
            <BotCard>
              <SpinnerMessage />
            </BotCard>
          )

          aiState.done({
            ...aiState.get(),
            messages: [
              ...aiState.get().messages,
              {
                id: nanoid(),
                role: 'function',
                name: 'showTimes',
                content: JSON.stringify({ title, times })
              }
            ]
          })

          return (
            <BotCard>
              <SelectTime title={title} times={times} />
            </BotCard>
          )
        }
      },
      show_seats: {
        description: 'Provide a list of available seats',
        parameters: z.object({
          movie: z.string(),
          time: z.string(),
          date: z.string()
        }),
        render: async function* ({ movie, time, date }) {
          yield (
            <BotCard>
              <SpinnerMessage />
            </BotCard>
          )
          const summary = { movie, time, date }

          aiState.done({
            ...aiState.get(),
            messages: [
              ...aiState.get().messages,
              {
                id: nanoid(),
                role: 'function',
                name: 'listStocks',
                content: JSON.stringify(summary)
              }
            ]
          })

          return (
            <BotCard>
              <SelectSeats summary={summary} />
            </BotCard>
          )
        }
      },
      purchase_tickets: {
        description: 'Purchase tickets',
        parameters: z.object({
          movie: z.string(),
          time: z.string(),
          price: z.number(),
          seats: z.array(z.string())
        }),
        render: async function* ({ movie, time, price, seats }) {
          yield (
            <BotCard>
              <SpinnerMessage />
            </BotCard>
          )

          const summary = { movie, time, price, seats }

          aiState.done({
            ...aiState.get(),
            messages: [
              ...aiState.get().messages,
              {
                id: nanoid(),
                role: 'function',
                name: 'purchaseTickets',
                content: JSON.stringify(summary)
              }
            ]
          })

          return (
            <BotCard>
              <PurchaseTickets
                status="requires_confirmation"
                summary={summary}
              />
            </BotCard>
          )
        }
      }
    }
  })

  return {
    id: nanoid(),
    display: ui
  }
}

// **** UI FUNCTIONS ****
export async function requestCode() {
  'use server'

  const aiState = getMutableAIState()

  aiState.done({
    ...aiState.get(),
    messages: [
      ...aiState.get().messages,
      {
        role: 'assistant',
        content:
          "A code has been sent to user's phone. They should enter it in the user interface to continue."
      }
    ]
  })

  const ui = createStreamableUI(
    <div className="animate-spin">
      <IconSpinner />
    </div>
  )

  ;(async () => {
    await sleep(1000)
    ui.done()
  })()

  return {
    status: 'requires_code',
    display: ui.value
  }
}

export async function validateCode() {
  'use server'

  const aiState = getMutableAIState()

  const status = createStreamableValue('in_progress')
  const ui = createStreamableUI(
    <div className="flex flex-col items-center justify-center gap-3 p-6 text-zinc-500">
      <div className="animate-spin">
        <IconSpinner />
      </div>
      <div className="text-sm text-zinc-500">
        Please wait while we fulfill your order.
      </div>
    </div>
  )

  ;(async () => {
    await sleep(2000)

    ui.done(
      <div className="flex flex-col items-center text-center justify-center gap-3 p-4 text-emerald-700">
        <IconCheck />
        <div>Payment Succeeded</div>
        <div className="text-sm text-zinc-600">
          Thanks for your purchase! You will receive your tickets by email
          shortly.
        </div>
      </div>
    )

    aiState.done({
      ...aiState.get(),
      messages: [
        ...aiState.get().messages.slice(0, -1),
        {
          role: 'assistant',
          content: 'The purchase has completed successfully.'
        }
      ]
    })

    status.done('completed')
  })()

  return {
    status: status.value,
    display: ui.value
  }
}

// **** TYPES ****

export type Message = {
  role: 'user' | 'assistant' | 'system' | 'function' | 'data' | 'tool'
  content: string
  id: string
  name?: string
}

export type AIState = {
  chatId: string
  messages: Message[]
}

export type UIState = {
  id: string
  display: React.ReactNode
}[]

export const AI = createAI<AIState, UIState>({
  actions: {
    submitUserMessage,
    requestCode,
    validateCode
  },
  initialUIState: [],
  initialAIState: { chatId: nanoid(), messages: [] },
  unstable_onGetUIState: async () => {
    'use server'

    const supabase = createClient()

    const {
      data: { user }
    } = await supabase.auth.getUser()

    if (user) {
      const aiState = getAIState()

      if (aiState) {
        const uiState = getUIStateFromAIState(aiState)
        return uiState
      }
    } else {
      return
    }
  },
  unstable_onSetAIState: async ({ state, done }) => {
    'use server'

    const supabase = createClient()

    const {
      data: { user }
    } = await supabase.auth.getUser()

    if (user) {
      const { chatId, messages } = state

      const createdAt = new Date()
      const userId = user.id as string
      const path = `/chat/${chatId}`
      const title = messages[0].content.substring(0, 100)

      const chat: Chat = {
        id: chatId,
        title,
        user_id: userId,
        created_at: createdAt,
        messages,
        path
      }

      await saveChat(chat)
    } else {
      return
    }
  }
})

const saveChat = async (chat: Chat) => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('chats')
    .upsert(chat, { onConflict: 'id' }) // Assuming 'id' is the unique identifier/primary key for chats
    .select()

  if (error) {
    console.error(error)
    return
  }
}

export const removeChat = async ({
  id,
  path
}: {
  id: string
  path: string
}) => {
  'use server'
  const supabase = createClient()
  const { data, error } = await supabase.from('chats').delete().eq('id', id)

  if (error) {
    console.error(error)
    return
  }
  redirect('/')
}

export const getUIStateFromAIState = (aiState: Chat) => {
  return aiState.messages
    .filter(message => message.role !== 'system')
    .map((message, index) => ({
      id: `${aiState.chatId}-${index}`,
      display:
        message.role === 'function' ? (
          message.name === 'listStocks' ? (
            <BotCard>
              <Stocks props={JSON.parse(message.content)} />
            </BotCard>
          ) : message.name === 'showStockPrice' ? (
            <BotCard>
              <Stock props={JSON.parse(message.content)} />
            </BotCard>
          ) : message.name === 'showStockPurchase' ? (
            <BotCard>
              <Purchase props={JSON.parse(message.content)} />
            </BotCard>
          ) : message.name === 'getEvents' ? (
            <BotCard>
              <Events props={JSON.parse(message.content)} />
            </BotCard>
          ) : message.name === 'showStockSale' ? (
            <BotCard>
              <Sale props={JSON.parse(message.content)} />
            </BotCard>
          ) : null
        ) : message.role === 'user' ? (
          <UserMessage>{message.content}</UserMessage>
        ) : (
          <BotMessage content={message.content} />
        )
    }))
}
