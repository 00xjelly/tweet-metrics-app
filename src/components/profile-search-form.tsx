'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Search, Upload, Loader2, X } from 'lucide-react'
import { useState, useCallback } from "react"
import { useRouter } from 'next/navigation'
import { useMetrics } from "@/context/metrics-context"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { processBatch } from "@/lib/batch-processor"
import { SelectListDialog } from "@/components/lists/select-list-dialog"
import Papa from 'papaparse'

// ... rest of your imports and schema definitions ...

export function ProfileSearchForm() {
  // ... other state declarations ...

  const handleListSelect = (profiles: string[]) => {
    // Extract usernames from profile URLs
    const usernames = profiles
      .map(url => extractUsername(url))
      .filter(username => username.length > 0)
      .join(', ');

    // Set the usernames in the form
    form.setValue('@', usernames);
    // Clear any CSV uploads
    clearCsvUrls();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="@"
          render={({ field }) => (
            <FormItem>
              <FormLabel>X Username(s)</FormLabel>
              <FormControl>
                <div className="relative flex gap-2">
                  <div className="relative flex-1">
                    <Input 
                      placeholder="e.g. user1, user2" 
                      {...field} 
                      onChange={(e) => {
                        field.onChange(e);
                        if (e.target.value) {
                          clearCsvUrls();
                        }
                      }}
                      disabled={csvUrls.length > 0}
                    />
                    {field.value && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2"
                        onClick={() => field.onChange('')}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <SelectListDialog onSelect={handleListSelect} />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* ... rest of your form fields ... */}
      </form>
    </Form>
  )
}
