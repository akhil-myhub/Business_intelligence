// Google Tag Manager. The container id is public by design (it appears in every page's HTML).
// Set NEXT_PUBLIC_GTM_ID to another container, or to an empty string to switch tracking off (e.g. local dev).
export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID ?? 'GTM-T7GVH8SR';

// Only well-formed container ids are ever interpolated into markup.
const VALID = /^GTM-[A-Z0-9]{4,12}$/;
export const gtmEnabled = VALID.test(GTM_ID);

// The official head snippet, verbatim apart from the container id.
export const gtmHeadScript = id => `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${id}');`;

export const gtmNoscriptSrc = id => `https://www.googletagmanager.com/ns.html?id=${id}`;
