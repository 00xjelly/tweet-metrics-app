"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search } from 'lucide-react';

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
        console.log('Processing URL:', url);
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
                <div>
                  <h3 className="text-lg font-medium mb-2">Post URLs</h3>
                  <Textarea
                    placeholder="Enter URLs (one per line)"
                    value={urls}
                    onChange={(e) => setUrls(e.target.value)}
                    className="min-h-[100px]"
                  />
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
