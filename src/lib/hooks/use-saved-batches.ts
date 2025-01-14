import { useState, useEffect } from 'react'

export interface SavedBatch {
  id: string
  name: string
  data: any
  type: string
  createdAt: string
}

const STORAGE_KEY = 'tweet-metrics-batches'

export function useSavedBatches(type: string) {
  const [savedBatches, setSavedBatches] = useState<SavedBatch[]>([])

  // Load saved batches on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setSavedBatches(parsed.filter((batch: SavedBatch) => batch.type === type))
      } catch (error) {
        console.error('Error loading saved batches:', error)
        localStorage.removeItem(STORAGE_KEY)
      }
    }
  }, [type])

  const saveBatch = (name: string, data: any) => {
    const newBatch: SavedBatch = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      data,
      type,
      createdAt: new Date().toISOString()
    }

    const stored = localStorage.getItem(STORAGE_KEY)
    let batches = []

    if (stored) {
      try {
        batches = JSON.parse(stored)
      } catch (error) {
        console.error('Error parsing saved batches:', error)
      }
    }

    const updatedBatches = [...batches, newBatch]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedBatches))
    setSavedBatches(updatedBatches.filter(batch => batch.type === type))
  }

  const deleteBatch = (id: string) => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return

    try {
      const batches = JSON.parse(stored)
      const updatedBatches = batches.filter((batch: SavedBatch) => batch.id !== id)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedBatches))
      setSavedBatches(updatedBatches.filter((batch: SavedBatch) => batch.type === type))
    } catch (error) {
      console.error('Error deleting batch:', error)
    }
  }

  return {
    savedBatches,
    saveBatch,
    deleteBatch
  }
}