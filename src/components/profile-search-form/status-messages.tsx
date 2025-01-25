interface StatusMessagesProps {
  error: string | null;
  processingStatus: string;
}

export function StatusMessages({ error, processingStatus }: StatusMessagesProps) {
  return (
    <>
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
    </>
  );
} 