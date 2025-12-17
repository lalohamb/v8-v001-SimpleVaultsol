import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="utf-8" />
        <meta name="description" content="Cronos AI Platform - Agent-powered DeFi automation" />
        <link rel="icon" href="/favicon.ico" />

        {/* Suppress browser extension errors early */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const originalError = console.error;
                console.error = function(...args) {
                  const msg = args.join(' ');
                  if (
                    msg.includes('chainId') ||
                    msg.includes('getter') ||
                    msg.includes('chrome-extension://') ||
                    msg.includes('moz-extension://')
                  ) {
                    console.warn('Suppressed extension error:', msg);
                    return;
                  }
                  originalError.apply(console, args);
                };

                // Suppress Next.js error overlay for extension errors
                if (typeof window !== 'undefined') {
                  window.addEventListener('error', function(e) {
                    if (
                      e.filename?.includes('chrome-extension://') ||
                      e.filename?.includes('moz-extension://') ||
                      e.message?.includes('chainId') ||
                      e.message?.includes('getter')
                    ) {
                      e.stopImmediatePropagation();
                      e.preventDefault();
                      return false;
                    }
                  }, true);

                  window.addEventListener('unhandledrejection', function(e) {
                    const msg = e.reason?.message || e.reason?.toString() || '';
                    if (
                      msg.includes('chainId') ||
                      msg.includes('getter') ||
                      msg.includes('chrome-extension://') ||
                      msg.includes('moz-extension://')
                    ) {
                      e.stopImmediatePropagation();
                      e.preventDefault();
                      return false;
                    }
                  }, true);
                }
              })();
            `,
          }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

