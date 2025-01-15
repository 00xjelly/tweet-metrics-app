"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FolderOpen } from 'lucide-react'

interface SavedBatch {
  id: string
  name: string
  data: any
}

interface BatchLoadDialogProps {
  savedBatches: SavedBatch[]
  onLoad: (batch: SavedBatch) => void
  type: "profile" | "post" | "metrics"
}

export function BatchLoadDialog({ savedBatches, onLoad, type }: BatchLoadDialogProps) {
  const [open, setOpen] = useState(false)
  const [selectedBatch, setSelectedBatch] = useState<string>("")

  const handleLoad = () => {
    const batch = savedBatches.find(b => b.id === selectedBatch)
    if (batch) {
      onLoad(batch)
      setOpen(false)
      setSelectedBatch("")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <FolderOpen className="h-4 w-4" />
          Load Batch
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Load Saved Batch</DialogTitle>
          <DialogDescription>
            Load a previously saved {type} search batch.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Select value={selectedBatch} onValueChange={setSelectedBatch}>
            <SelectTrigger>
              <SelectValue placeholder="Select a saved batch" />
            </SelectTrigger>
            <SelectContent>
              {savedBatches.map((batch) => (
                <SelectItem key={batch.id} value={batch.id}>
                  {batch.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleLoad} disabled={!selectedBatch}>
            Load
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}