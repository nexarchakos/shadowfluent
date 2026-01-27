/**
 * Initialize Google Tag Manager dynamically
 * This script injects the GTM script into the <head> if a Container ID is provided
 */

export const injectGTM = (): void => {
  if (typeof document === 'undefined') return;

  const containerId = import.meta.env.VITE_GTM_CONTAINER_ID;

  if (!containerId || containerId === 'GTM-XXXXXXX') {
    return;
  }

  // Check if GTM is already loaded
  if (document.querySelector(`script[src*="googletagmanager.com/gtm.js"]`)) {
    return;
  }

  // Inject GTM script into <head>
  const gtmScript = document.createElement('script');
  gtmScript.innerHTML = `
    (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','${containerId}');
  `;
  document.head.appendChild(gtmScript);

  // Inject GTM noscript into <body>
  const noscript = document.createElement('noscript');
  noscript.innerHTML = `
    <iframe src="https://www.googletagmanager.com/ns.html?id=${containerId}"
    height="0" width="0" style="display:none;visibility:hidden"></iframe>
  `;
  document.body.insertBefore(noscript, document.body.firstChild);
};
