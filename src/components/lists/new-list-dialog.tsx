'use client'

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
import { useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { PlusCircle, Upload } from "lucide-react"
import Papa from 'papaparse'

export function NewListDialog({ onListCreated }: { onListCreated: () => void }) {
  const [name, setName] = useState('')
  const [urls, setUrls] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClientComponentClient()

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      Papa.parse(file, {
        complete: (results) => {
          // Assuming CSV has URLs in first column
          const uploadedUrls = results.data
            .map((row: any) => row[0])
            .filter(Boolean)
            .join('\n')
          setUrls(prevUrls => prevUrls ? `${prevUrls}\n${uploadedUrls}` : uploadedUrls)
        }
      })
    }
  }

  const handleSubmit = async () => {
    try {
      setIsLoading(true)
      // Clean and deduplicate URLs using object keys
      const urlsArray = urls.split('\n')
        .map(url => url.trim())
        .filter(Boolean)
      const uniqueUrls = Object.keys(
        urlsArray.reduce((acc, url) => ({ ...acc, [url]: true }), {})
      )

      const { error } = await supabase
        .from('profile_lists')
        .insert({
          name,
          profiles: uniqueUrls
        })

      if (error) throw error

      setIsOpen(false)
      setName('')
      setUrls('')
      onListCreated()
    } catch (error) {
      console.error('Error creating list:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary">
          <PlusCircle className="w-4 h-4 mr-2" />
          New List
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Create New Profile List</DialogTitle>
          <DialogDescription>
            Create a new list of Twitter profiles to track. Add URLs directly or upload a CSV.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">List Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Tech Influencers"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="urls">Profile URLs</Label>
            <Textarea
              id="urls"
              value={urls}
              onChange={(e) => setUrls(e.target.value)}
              placeholder="Enter URLs (one per line)"
              className="h-32"
            />
          </div>
          <div>
            <Label htmlFor="csv" className="mb-2 block">Or Upload CSV</Label>
            <Input
              id="csv"
              type="file"
              accept=".csv"
              onChange={handleCsvUpload}
              className="cursor-pointer"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isLoading || !name || !urls}>
            Create List
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}