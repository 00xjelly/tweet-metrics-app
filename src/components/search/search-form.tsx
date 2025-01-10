"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Papa from 'papaparse';

export function SearchForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [urls, setUrls] = useState<string[]>([]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch('/api/tweets/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to analyze tweets');
      }

      router.push(`/tweets/${data.data.id}`);

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleUrlInput = (value: string) => {
    setUrls([value.trim()]);
  };

  const handleTextInput = (value: string) => {
    const lines = value.split('\n').map(line => line.trim()).filter(Boolean);
    setUrls(lines);
  };

  const handleFileInput = async (file: File) => {
    return new Promise((resolve) => {
      Papa.parse(file, {
        complete: (results) => {
          const urlList = results.data
            .flat()
            .map(url => String(url).trim())
            .filter(Boolean);
          setUrls(urlList);
          resolve(null);
        }
      });
    });
  };

  return (
    <div className="w-full max-w-xl mx-auto p-4">
      <div className="space-y-4">
        <div>
          <label className="block mb-2">Enter tweet URL</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            placeholder="https://twitter.com/..."
            onChange={(e) => handleUrlInput(e.target.value)}
            disabled={loading}
          />
        </div>

        <div>
          <label className="block mb-2">Or paste multiple URLs</label>
          <textarea
            className="w-full p-2 border rounded h-32"
            placeholder="Enter tweet URLs (one per line)"
            onChange={(e) => handleTextInput(e.target.value)}
            disabled={loading}
          />
        </div>

        <div>
          <label className="block mb-2">Or upload CSV</label>
          <input
            type="file"
            accept=".csv"
            className="w-full"
            onChange={(e) => e.target.files?.[0] && handleFileInput(e.target.files[0])}
            disabled={loading}
          />
        </div>

        {error && (
          <div className="p-4 text-sm text-red-500 bg-red-50 rounded">
            {error}
          </div>
        )}

        <button
          className={`w-full px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed`}
          onClick={handleSubmit}
          disabled={loading || urls.length === 0}
        >
          {loading ? 'Processing...' : 'Analyze Tweets'}
        </button>
      </div>
    </div>
  );
}