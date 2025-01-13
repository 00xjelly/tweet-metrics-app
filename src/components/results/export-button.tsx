"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface ExportButtonProps {
  requestId: string;
}

export function ExportButton({ requestId }: ExportButtonProps) {
  const handleExport = async () => {
    try {
      const response = await fetch(`/api/export/${requestId}`);
      
      if (!response.ok) {
        throw new Error('Export failed');
      }
      
      const csvContent = await response.text();
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tweet-analysis-${requestId}.csv`;
      
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      // You could add a toast notification here for better UX
    }
  };

  return (
    <Button onClick={handleExport} variant="outline" className="gap-2">
      <Download className="h-4 w-4" />
      Export CSV
    </Button>
  );
}