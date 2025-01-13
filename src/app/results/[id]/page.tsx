import { db } from '@/db';
import { searchQueries } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { ExportButton } from '@/components/results/export-button';

export default async function ResultsPage({
  params
}: {
  params: { id: string };
}) {
  const queryId = parseInt(params.id);
  
  const query = await db.query.searchQueries.findFirst({
    where: eq(searchQueries.id, queryId)
  });

  if (!query) {
    return (
      <div className="p-4">
        <h1 className="text-xl font-bold mb-4">Query Not Found</h1>
        <p>The requested query could not be found.</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">Analysis Results</h1>
        <ExportButton queryId={params.id} />
      </div>
      
      {/* Status indicator */}
      <div className="mb-4">
        <span className="font-semibold">Status: </span>
        <span className={query.status === 'completed' ? 'text-green-600' : 'text-yellow-600'}>
          {query.status}
        </span>
      </div>

      {/* Query Details */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Query Details</h2>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p><span className="font-medium">Query Type:</span> {query.queryType}</p>
          <p><span className="font-medium">Created At:</span> {query.createdAt.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
