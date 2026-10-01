import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

// Self-hosted at build time: no render-blocking @import to Google, no third-party request at runtime.
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-jakarta', display: 'swap' });

export const metadata = {
  title: 'BusinessAI | Business Intelligence',
  description: 'Conversational analytics workspace'
};

export const viewport = { width: 'device-width', initialScale: 1, themeColor: '#1b2350' };

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${jakarta.variable}`}>
      <body>{children}</body>
    </html>
  );
}
