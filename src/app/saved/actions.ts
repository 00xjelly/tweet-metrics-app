'use server'

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function fetchSavedData() {
  const supabase = createServerComponentClient({ cookies })

  const { data: searchesData } = await supabase
    .from('saved_searches')
    .select('*')
    .order('created_at', { ascending: false })

  const { data: listsData } = await supabase
    .from('profile_lists')
    .select('*')
    .order('created_at', { ascending: false })

  return {
    searches: searchesData || [],
    lists: listsData || []
  }
}

export async function deleteSearch(id: string) {
  'use server'
  const supabase = createServerComponentClient({ cookies })
  return await supabase
    .from('saved_searches')
    .delete()
    .match({ id })
}

export async function deleteList(id: string) {
  'use server'
  const supabase = createServerComponentClient({ cookies })
  return await supabase
    .from('profile_lists')
    .delete()
    .match({ id })
}