import React, { useRef, useEffect } from 'react';

export default function Agent({ agentData, classNames = '' }) {
  const iframeRef = useRef(null);
  const htmlContent = agentData?.agent?.code;

  const inIframe = () => {
    try {
        return window.self !== window.top;
    } catch (e) {
        console.error('🚀 ~ inIframe ~ e:', e)
        return false;
    }
  }

  useEffect(() => {
    const handleMessageFromIframe = (event) => {
      if (!iframeRef.current || event.source !== iframeRef.current.contentWindow) {
        return;
      }
      const { type, payload } = event.data;

      // --- PARENT LOGIC ---
      switch (type) {
        case 'request-styles': {
          const styleData = [];
          const styleNodes = document.head.querySelectorAll('link[rel="stylesheet"], style');
          styleNodes.forEach(node => {
            if (node.tagName === 'LINK') {
              styleData.push({ type: 'link', href: node.href });
            } else if (node.tagName === 'STYLE') {
              styleData.push({ type: 'style', content: node.innerHTML });
            }
          });
          iframeRef.current.contentWindow.postMessage({
            type: 'styles-response',
            payload: styleData
          }, window.location.origin);
          break;
        }
        case 'resize-iframe': {
          if (iframeRef.current) {
            iframeRef.current.style.height = `${payload.height}px`;
          }
          break;
        }
        // Handle navigation requests from the iframe
        case 'navigate': {
          const { url, target } = payload;
          if (target === '_blank') {
            // Open in a new tab
            window.open(url, '_blank', 'noopener,noreferrer');
          } else {
            // Navigate the main window
            window.location.href = url;
          }
          break;
        }
        default:
          break;
      }
    };
    window.addEventListener('message', handleMessageFromIframe);
    return () => {
      window.removeEventListener('message', handleMessageFromIframe);
    };
  }, []);

  const encodedHtmlContent = JSON.stringify(htmlContent || '');

  const iframeSrcDoc = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>body { visibility: hidden; margin: 0; }</style>
      </head>
      <body class="${classNames}">
        <script>
          // --- CHILD (IFRAME) SCRIPT ---
          const htmlContent = ${encodedHtmlContent};

          window.addEventListener('message', (event) => {
            const { type, payload } = event.data;
            if (type === 'styles-response') {
              payload.forEach(styleInfo => {
                if (styleInfo.type === 'link') {
                  const link = document.createElement('link');
                  link.rel = 'stylesheet';
                  link.href = styleInfo.href;
                  document.head.appendChild(link);
                } else if (styleInfo.type === 'style') {
                  const style = document.createElement('style');
                  style.innerHTML = styleInfo.content;
                  document.head.appendChild(style);
                }
              });
              const tailwindScript = document.createElement('script');
              tailwindScript.src = "https://cdn.tailwindcss.com";
              tailwindScript.onload = () => {
                document.body.innerHTML = htmlContent;
                document.body.style.visibility = 'visible';

                // Add click listener after content is loaded
                document.body.addEventListener('click', (e) => {
                  const link = e.target.closest('a');
                  if (link && link.href) {
                    // Prevent the iframe from navigating itself
                    e.preventDefault();
                    // Send the navigation request to the parent
                    window.parent.postMessage({
                      type: 'navigate',
                      payload: {
                        url: link.href,
                        target: link.target
                      }
                    }, '*');
                  }
                });

                setTimeout(() => {
                  const height = document.documentElement.scrollHeight;
                  window.parent.postMessage({ type: 'resize-iframe', payload: { height } }, '*');
                }, 100);
              };
              document.head.appendChild(tailwindScript);
            }
          });
          window.parent.postMessage({ type: 'request-styles' }, '*');
        </script>
      </body>
    </html>
  `;

  if (htmlContent) {
    return (
      <iframe
        ref={iframeRef}
        title="Agent Component"
        srcDoc={iframeSrcDoc}
        style={{ width: '100%', border: 'none', display: 'block', pointerEvents: inIframe() ? 'none' : 'auto' }}
        scrolling="no"
      />
    );
  }

  return (
    <div>
      <div className="text-center text-lg text-gray-500 w-full h-[300px] flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-lg">
        <div className="mb-4">
          <svg className="w-16 h-16 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c0 .621-.504 1.125-1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        </div>
        <p className="font-medium text-gray-600 mb-2">Component Generator</p>
        <p className="text-sm text-gray-500 max-w-md px-4">Your custom component will appear here once generated. Create dynamic, personalized content powered by AI.</p>
      </div>
    </div>
  );
}