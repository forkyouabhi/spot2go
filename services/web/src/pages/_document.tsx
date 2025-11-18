import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="icon" href="/favicon.ico" />

        {/* --- PWA Meta Tags --- */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="application-name" content="Spot2Go" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Spot2Go" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#6C0345" />
        <link rel="apple-touch-icon" href="/logo-mark.png" />
        {/* --- End PWA Tags --- */}
        
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}