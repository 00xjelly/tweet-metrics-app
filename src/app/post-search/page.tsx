"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Upload } from 'lucide-react';
import Papa from 'papaparse';

const isValidPostUrl = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url.trim());
    return (
      (parsedUrl.hostname === 'twitter.com' || 
       parsedUrl.hostname === 'x.com') &&
      parsedUrl.pathname.split('/').length >= 4 &&
      parsedUrl.pathname.includes('/status/')
    );
  } catch {
    return false;
  }
};

export default function PostSearch() {
  const [urls, setUrls] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [includeReplies, setIncludeReplies] = useState(false);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const handleCsvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      complete: (results) => {
        const urlList = results.data
          .flat()
          .filter(Boolean)
          .map(String)
          .filter(isValidPostUrl);

        setUrls(urlList.join('\n'));
      },
      error: (error) => {
        console.error('Error parsing CSV:', error);
      },
    });
  };

  const handleAnalyze = async () => {
    setIsLoading(true);
    try {
      const urlList = urls
        .split('\n')
        .map(url => url.trim())
        .filter(url => url !== '');

      const validUrls = urlList.filter(isValidPostUrl);
      
      if (validUrls.length === 0) {
        throw new Error('No valid post URLs found');
      }

      // Process each URL individually
      for (const url of validUrls) {
        // API call will be implemented here
        console.log('Processing URL:', url, 'with replies:', includeReplies);
        console.log('Date range:', startDate, 'to', endDate);
      }

    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Request Post Metrics</CardTitle>
          <CardDescription>
            Search for Twitter posts and analyze their metrics using different methods.
            Add multiple entries to batch process your requests.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="post" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="profile" className="w-1/2">Profile Search</TabsTrigger>
              <TabsTrigger value="post" className="w-1/2">Post Search</TabsTrigger>
            </TabsList>
            <TabsContent value="post" className="mt-4">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="grid grid-cols-2 gap-4 flex-1">
                    <div>
                      <label htmlFor="startDate" className="text-sm font-medium block mb-1">Start Date</label>
                      <input
                        type="date"
                        id="startDate"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full p-2 rounded border"
                      />
                    </div>
                    <div>
                      <label htmlFor="endDate" className="text-sm font-medium block mb-1">End Date</label>
                      <input
                        type="date"
                        id="endDate"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full p-2 rounded border"
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <input
                      type="checkbox"
                      id="replies"
                      checked={includeReplies}
                      onChange={(e) => setIncludeReplies(e.target.checked)}
                      className="h-4 w-4"
                    />
                    <label htmlFor="replies" className="text-sm">Include Replies</label>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Post URLs</h3>
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Enter URLs (one per line)"
                      value={urls}
                      onChange={(e) => setUrls(e.target.value)}
                      className="min-h-[100px]"
                    />
                    <div className="flex justify-end">
                      <Button variant="outline" size="sm" asChild>
                        <label>
                          <Upload className="mr-2 h-4 w-4" />
                          Upload CSV
                          <input
                            type="file"
                            accept=".csv"
                            className="hidden"
                            onChange={handleCsvUpload}
                          />
                        </label>
                      </Button>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleAnalyze}
                  disabled={isLoading}
                  className="w-full"
                >
                  <Search className="mr-2 h-4 w-4" />
                  Analyze Posts
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
