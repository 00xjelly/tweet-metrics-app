"use client";

import { Button } from "@/components/ui/button";

interface ExportButtonProps {
  queryId: string;
}

export function ExportButton({ queryId }: ExportButtonProps) {
  const handleExport = async () => {
    try {
      // Get the CSV data using query parameter
      const response = await fetch(`/api/tweets/export?id=${queryId}`);
      
      if (!response.ok) {
        throw new Error('Export failed');
      }
      
      // Get the CSV content
      const csvContent = await response.text();
      
      // Create a blob and download link
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tweet-analysis-${queryId}.csv`;
      
      // Trigger download
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      // You might want to show an error message to the user here
    }
  };

  return (
    <Button onClick={handleExport} variant="outline" className="gap-2">
      Export CSV
    </Button>
  );
}