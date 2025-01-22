"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Upload, X, Loader2 } from 'lucide-react';
import Papa from 'papaparse';
import { analyzeMetrics } from '@/lib/api';
import { useMetrics } from '@/context/metrics-context';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();
  const { setResults } = useMetrics();
  const [urls, setUrls] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [includeReplies, setIncludeReplies] = useState(false);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleCsvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      complete: (results) => {
        const urlList = results.data
          .flat()
          .filter(Boolean)
          .map(String)
          .map(url => url.trim())
          .filter(url => url.length > 0)
          .filter(isValidPostUrl);

        if (urlList.length === 0) {
          setError('No valid post URLs found in the CSV');
          return;
        }

        setUrls(urlList.join('\n'));
        setError(null);
        
        // Reset file input
        if (event.target) {
          event.target.value = '';
        }
      },
      error: (error) => {
        console.error('Error parsing CSV:', error);
        setError('Error parsing CSV file');
      },
    });
  };

  const clearUrls = () => {
    setUrls('');
    setError(null);
  };

  const handleAnalyze = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const urlList = urls
        .split('\n')
        .map(url => url.trim())
        .filter(url => url !== '');

      const validUrls = urlList.filter(isValidPostUrl);
      
      if (validUrls.length === 0) {
        throw new Error('No valid post URLs found');
      }

      const response = await analyzeMetrics({
        urls: validUrls,
        since: startDate || undefined,
        until: endDate || undefined,
        includeReplies
      });

      if (!response.success) {
        throw new Error(response.error);
      }

      setResults(response.data.posts);
      router.push('/results');

    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
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
                    <div className="relative">
                      <Textarea
                        placeholder="Enter URLs (one per line)"
                        value={urls}
                        onChange={(e) => setUrls(e.target.value)}
                        className="min-h-[100px]"
                      />
                      {urls && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={clearUrls}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="flex justify-end">
                      <Button variant="outline" size="sm" asChild>
                        <label className="cursor-pointer">
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

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded">
                    {error}
                  </div>
                )}

                <Button
                  onClick={handleAnalyze}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Analyze Posts
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
