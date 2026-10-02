import { Inter, Plus_Jakarta_Sans, Roboto } from 'next/font/google';
import { GTM_ID, gtmEnabled, gtmHeadScript, gtmNoscriptSrc } from '@/config/gtm';
import './globals.css';

// Self-hosted at build time: no render-blocking @import to Google, no third-party request at runtime.
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-jakarta', display: 'swap' });
const roboto = Roboto({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-roboto', display: 'swap' });

export const metadata = {
  title: 'BusinessAI | Business Intelligence',
  description: 'Conversational analytics workspace'
};

export const viewport = { width: 'device-width', initialScale: 1, themeColor: '#1b2350' };

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${jakarta.variable} ${roboto.variable}`}>
      <head>
        {/* Google Tag Manager — as high in <head> as possible */}
        {gtmEnabled && <script dangerouslySetInnerHTML={{ __html: gtmHeadScript(GTM_ID) }} />}
      </head>
      <body>
        {/* Google Tag Manager (noscript) — immediately after the opening <body> tag */}
        {gtmEnabled && (
          <noscript>
            <iframe src={gtmNoscriptSrc(GTM_ID)} height="0" width="0" style={{ display: 'none', visibility: 'hidden' }} title="Google Tag Manager" />
          </noscript>
        )}
        {children}
      </body>
    </html>
  );
}
