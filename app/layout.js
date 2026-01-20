import './globals.css';

export const metadata = {
  title: 'InsightNews - Kenya\'s Best Digital News Platform',
  description: 'Get the latest news from Kenya, Politics, Entertainment, Sports, Business, and more. Your trusted source for breaking news and trending stories.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
