import { createClient } from './supabase/server'

export const getMovies = async (input: string, limit: number) => {
  const supabase = createClient()

    const { data: movies, error } = await supabase.functions.invoke('search', {
      body: JSON.stringify({
        search: input,
        match_threshold: 0.8,
        limit: limit
      })
    })

    if (error) {
      console.error('Error searching movies', error)
      return
    }

    return movies.result
  
}

// working function to get movies
// create or replace function query_embeddings (
//   query_embedding vector(384),
//   match_threshold float
// )
// returns table (
//   id bigint,
//   movie_id bigint,
//   content text,
//   similarity float
// )
// language sql stable
// as $$
//   select
//     me.id,
//     me.movie_id,
//     me.content,
//     1 - (me.embedding <=> query_embedding) as similarity
//   from movie_embeddings as me
//   where 1 - (me.embedding <=> query_embedding) > match_threshold
//   order by similarity desc
// $$;

export const getAllMovies = async () => {
  const supabase = createClient()
  const { data: movies, error } = await supabase.from('movies').select('*')
  return movies
}
