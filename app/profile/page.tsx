'use client';

import React from "react";
import { BarChart, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

export default function ProfileMetricsPage() {
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<any>(null);
  const [file, setFile] = React.useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData(e.currentTarget);
      if (file) formData.append("file", file);

      const res = await fetch("/api/profile/metrics", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message);
      }

      const data = await res.json();
      setResult(data);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">
            Profile Metrics
          </h2>
          <p className="text-sm text-muted-foreground">
            Compare engagement metrics across multiple Twitter profiles.
          </p>
        </div>
      </div>
      <Separator className="my-4" />
      <hr className="my-4 border-t border-border" />
      <div className="grid gap-4 grid-cols-2">
        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Analysis Parameters</CardTitle>
              <CardDescription>
                Configure the parameters for your analysis.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="profiles">Twitter Profiles</Label>
                <Input
                  id="profiles"
                  name="profiles"
                  placeholder="e.g., elonmusk"
                  placeholder="e.g., elonmusk, jackX"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Enter multiple profiles separated by commas (e.g., elonmusk, jackX) or upload a CSV file
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="file">Upload CSV</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".csv"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="count">Number of tweets to analyze</Label>
                <input
                  type="number"
                  id="count"
                  name="count"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Enter number of tweets"
                  max={200}
                />
                <p className="text-sm text-muted-foreground mt-1">Maximum 200 tweets</p>
                <input 
                  type="number"
                  id="count"
                  name="count"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Enter number of tweets (max 200)"
                  max={200}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="metric">Metric</Label>
                <Select name="metric" defaultValue="avg_impressions">
                  <SelectTrigger>
                    <SelectValue placeholder="Select metric" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="avg_impressions">
                      Average Impressions
                    </SelectItem>
                    <SelectItem value="avg_replies">Average Replies</SelectItem>
                    <SelectItem value="avg_retweets">Average Retweets</SelectItem>
                    <SelectItem value="avg_likes">Average Likes</SelectItem>
                    <SelectItem value="avg_quotes">Average Quotes</SelectItem>
                    <SelectItem value="avg_bookmarks">Average Bookmarks</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button disabled={loading}>
                {loading ? "Processing..." : "Compare Profiles"}
              </Button>
            </CardFooter>
          </form>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
            <CardDescription>Analysis results will appear here.</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {result && !error && (
              <div className="space-y-8">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Average by Profile</div>
                  <BarChart className="h-[200px]" />
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Raw Data</div>
                  <pre className="p-4 bg-secondary rounded-lg overflow-auto">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}