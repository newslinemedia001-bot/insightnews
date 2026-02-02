import './globals.css';

export const metadata = {
  title: 'InsightNews - Kenya\'s Best Digital News Platform',
  description: 'Get the latest news from Kenya, Politics, Entertainment, Sports, Business, and more. Your trusted source for breaking news and trending stories.',
  keywords: 'Kenya news, breaking news, politics, entertainment, sports, business, latest news',
  authors: [{ name: 'InsightNews Team' }],
  icons: {
    icon: '/insightnews.jpeg',
    shortcut: '/insightnews.jpeg',
    apple: '/insightnews.jpeg',
  },
  openGraph: {
    title: 'InsightNews - Kenya\'s Best Digital News Platform',
    description: 'Get the latest news from Kenya, Politics, Entertainment, Sports, Business, and more.',
    type: 'website',
    locale: 'en_KE',
    siteName: 'InsightNews',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'InsightNews - Kenya\'s Best Digital News Platform',
    description: 'Get the latest news from Kenya, Politics, Entertainment, Sports, Business, and more.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add your verification codes here when you have them
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
    // bing: 'your-bing-verification-code',
  },
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
