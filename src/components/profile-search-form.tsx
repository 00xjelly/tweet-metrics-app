'use client'

import { Search, Upload, Loader2, X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { SelectListDialog } from "@/components/lists/select-list-dialog"
import { useProfileForm } from '@/hooks/use-profile-form'

export function ProfileSearchForm() {
  const {
    form,
    isLoading,
    error,
    csvUrls,
    processingStatus,
    handleListSelect,
    handleCsvUpload,
    clearCsvUrls,
    onSubmit
  } = useProfileForm();

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

        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mentioned User Filter</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Filter by mentioned user" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="csvFile"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Upload CSV</FormLabel>
              <FormControl>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept=".csv"
                    onChange={handleCsvUpload}
                    disabled={Boolean(form.getValues('@'))}
                  />
                  {csvUrls.length > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={clearCsvUrls}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {csvUrls.length > 0 && (
          <div className="text-sm text-gray-600">
            Found {csvUrls.length} valid Twitter/X profile URLs
          </div>
        )}

        <FormField
          control={form.control}
          name="maxItems"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Maximum Items</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min={1} 
                  max={200} 
                  {...field} 
                  onChange={e => field.onChange(parseInt(e.target.value))} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="twitterContent"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content Filter</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Filter by keywords or content" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="includeReplies"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
              </FormControl>
              <FormLabel className="font-normal">Include Replies</FormLabel>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="dateRange.since"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date</FormLabel>
                <FormControl>
                  <Input 
                    type="date" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dateRange.until"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Date</FormLabel>
                <FormControl>
                  <Input 
                    type="date" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded">
            {error}
          </div>
        )}

        {processingStatus && (
          <div className="text-sm text-gray-600">
            {processingStatus}
          </div>
        )}

        <Button 
          type="submit" 
          className="w-full" 
          disabled={isLoading || (csvUrls.length === 0 && !form.getValues('@'))}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" />
              Analyze Profiles
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}