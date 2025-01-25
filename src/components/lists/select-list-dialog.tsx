'use client'

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { BookmarkPlus } from "lucide-react"

type ProfileList = {
  id: string
  name: string
  profiles: string[]
  created_at: string
}

interface SelectListDialogProps {
  onSelect: (profiles: string[]) => void
}

export function SelectListDialog({ onSelect }: SelectListDialogProps) {
  const [lists, setLists] = useState<ProfileList[]>([])
  const [open, setOpen] = useState(false)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchLists = async () => {
      const { data } = await supabase
        .from('profile_lists')
        .select('*')
        .order('created_at', { ascending: false })

      if (data) setLists(data)
    }

    if (open) {
      fetchLists()
    }
  }, [open, supabase])

  const handleSelect = (profiles: string[]) => {
    onSelect(profiles)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <BookmarkPlus className="h-4 w-4 mr-2" />
          Select List
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Select Profile List</DialogTitle>
          <DialogDescription>
            Choose a saved list to import profiles
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {lists.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No saved lists found
            </p>
          ) : (
            <div className="space-y-2">
              {lists.map((list) => (
                <div
                  key={list.id}
                  className="flex items-center justify-between p-2 border rounded-lg hover:bg-accent cursor-pointer"
                  onClick={() => handleSelect(list.profiles)}
                >
                  <div>
                    <h3 className="font-medium">{list.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {list.profiles.length} profiles
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">
                    Select
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}