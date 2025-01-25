'use client'

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
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
import { Textarea } from "@/components/ui/textarea"
import { PlusCircle } from "lucide-react"
import Papa from 'papaparse'

interface NewListDialogProps {
  onListCreated: () => void
}

export function NewListDialog({ onListCreated }: NewListDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [urls, setUrls] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClientComponentClient()

  const handleSubmit = async () => {
    if (!name || !urls) return

    try {
      setIsLoading(true)
      const profileUrls = urls
        .split('\n')
        .map(url => url.trim())
        .filter(Boolean)

      const { error } = await supabase
        .from('profile_lists')
        .insert({
          name,
          profiles: profileUrls,
          last_analyzed: new Date().toISOString()
        })

      if (error) throw error

      setOpen(false)
      setName('')
      setUrls('')
      onListCreated()
    } catch (error) {
      console.error('Error creating list:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    Papa.parse(file, {
      complete: (results) => {
        // Assuming the CSV has URLs in the first column
        const newUrls = results.data
          .map((row: any) => row[0])
          .filter(Boolean)
          .join('\n')
        
        setUrls(prev => prev ? `${prev}\n${newUrls}` : newUrls)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <PlusCircle className="h-4 w-4 mr-2" />
          New List
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New List</DialogTitle>
          <DialogDescription>
            Create a new list of Twitter profiles to track
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">List Name</Label>
            <Input
              id="name"
              placeholder="e.g., Tech Influencers"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="urls">Profile URLs</Label>
            <Textarea
              id="urls"
              placeholder="Enter URLs (one per line)"
              value={urls}
              onChange={(e) => setUrls(e.target.value)}
              className="h-20"
            />
          </div>
          <div>
            <Label htmlFor="csv">Or Upload CSV</Label>
            <Input
              id="csv"
              type="file"
              accept=".csv"
              onChange={handleCsvUpload}
              className="mt-1.5"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isLoading || !name || !urls}
          >
            Create List
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}