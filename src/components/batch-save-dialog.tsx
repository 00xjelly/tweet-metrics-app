"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SaveIcon } from 'lucide-react'

interface BatchSaveDialogProps {
  onSave: (name: string) => void
  type: "profile" | "post" | "metrics"
}

export function BatchSaveDialog({ onSave, type }: BatchSaveDialogProps) {
  const [open, setOpen] = useState(false)
  const [batchName, setBatchName] = useState("")

  const handleSave = () => {
    if (batchName.trim()) {
      onSave(batchName)
      setOpen(false)
      setBatchName("")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <SaveIcon className="h-4 w-4" />
          Save as Batch
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Save Search Batch</DialogTitle>
          <DialogDescription>
            Save this {type} search batch for future use. You can access saved batches from the dropdown menu.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Batch Name</Label>
            <Input
              id="name"
              value={batchName}
              onChange={(e) => setBatchName(e.target.value)}
              placeholder="Enter a name for this batch"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Batch</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}