import { db } from '@/db';
import { analyticsRequests } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { ExportButton } from '@/components/results/export-button';

export default async function ResultsPage({
  params
}: {
  params: { id: string };
}) {
  const requestId = parseInt(params.id);
  
  const request = await db.query.analyticsRequests.findFirst({
    where: eq(analyticsRequests.id, requestId)
  });

  if (!request) {
    return (
      <div className="p-4">
        <h1 className="text-xl font-bold mb-4">Request Not Found</h1>
        <p>The requested analysis could not be found.</p>
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
        <span className={request.status.stage === 'completed' ? 'text-green-600' : 'text-yellow-600'}>
          {request.status.stage}
        </span>
      </div>

      {/* Request Details */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Request Details</h2>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p><span className="font-medium">URLs:</span> {request.urls.length} tweets</p>
          <p><span className="font-medium">Created At:</span> {request.createdAt.toLocaleString()}</p>
          {request.status.progress > 0 && (
            <p><span className="font-medium">Progress:</span> {request.status.progress}%</p>
          )}
        </div>
      </div>
    </div>
  );
}