import { TweetSection } from '@/components/tweets/section';

export default function TweetsPage({ params }: { params: { id: string } }) {
  return <TweetSection requestId={params.id} />;
}