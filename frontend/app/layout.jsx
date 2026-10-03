import localFont from 'next/font/local';
import { GTM_ID, gtmEnabled, gtmHeadScript, gtmNoscriptSrc } from '@/config/gtm';
import './globals.css';

// Fonts live in the repo (src/fonts, SIL OFL) — no network fetch at build or dev time, so a flaky connection can never
// break the first render.
const inter = localFont({ src: '../src/fonts/inter-latin-wght-normal.woff2', weight: '100 900', variable: '--font-inter', display: 'swap' });
const jakarta = localFont({ src: '../src/fonts/plus-jakarta-sans-latin-wght-normal.woff2', weight: '200 800', variable: '--font-jakarta', display: 'swap' });
const roboto = localFont({
  src: [
    { path: '../src/fonts/roboto-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: '../src/fonts/roboto-latin-500-normal.woff2', weight: '500', style: 'normal' }
  ],
  variable: '--font-roboto',
  display: 'swap'
});

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
