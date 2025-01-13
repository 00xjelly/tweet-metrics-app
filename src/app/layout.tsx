import './globals.css';

export const metadata = {
  title: 'Tweet Analytics',
  description: 'Analyze tweet metrics and engagement',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}