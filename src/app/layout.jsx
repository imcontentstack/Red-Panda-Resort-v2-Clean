import { cache } from "react";
import "./globals.css";
import Script from "next/script";
import { LyticsTracking } from "@/context/lyticsTracking";
import AppWrapper from "@/components/appWrapper";
import {
  Cinzel,
  Cormorant,
  Inter,
  Montserrat,
  Open_Sans,
  Playfair_Display,
  Poppins,
  Raleway,
  Roboto,
  Rokkitt,
  Spectral,
} from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  weight: ["400", "500", "600", "700", "800", "900"],
});

const roboto = Roboto({
  subsets: ["latin"],
  variable: "--font-roboto",
  weight: ["100", "300", "400", "500", "700", "900"],
});

const playfair_display = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "500", "600", "700", "800", "900"],
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["400", "500", "600", "700", "800", "900"],
});

const raleway = Raleway({
  subsets: ["latin"],
  variable: "--font-raleway",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const open_sans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-opensans",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const spectral = Spectral({
  subsets: ["latin"],
  variable: "--font-spectral",
  weight: ["200", "300", "400", "500", "600", "700", "800"],
});

const rokkitt = Rokkitt({
  subsets: ["latin"],
  variable: "--font-rokkitt",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const cormorant = Cormorant({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["300", "400", "500", "600", "700"],
});

// -------------------------------
// SERVER FETCH FOR CONFIG
// -------------------------------
const getConfig = cache(async () => {
  try {
    const res = await fetch(
      `https://${process.env.CONTENTSTACK_CDN_HOST}/v3/content_types/config/entries`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          api_key: process.env.CONTENTSTACK_API_KEY || "",
          access_token: process.env.CONTENTSTACK_DELIVERY_TOKEN || "",
        },
        next: { revalidate: 60 },
      }
    );

    if (!res.ok) {
      console.warn("Config fetch failed:", res.status);
      return {};
    }

    const json = await res.json();
    return json.entries?.[0] || {};
  } catch (error) {
    console.warn("Config fetch error:", error);
    return {};
  }
});

// -------------------------------
// FONT PICKER
// -------------------------------
function fontPicker(fontName) {
  const map = {
    Poppins: "var(--font-poppins)",
    Cinzel: "var(--font-cinzel)",
    Roboto: "var(--font-roboto)",
    Playfair_Display: "var(--font-playfair)",
    Montserrat: "var(--font-montserrat)",
    Raleway: "var(--font-raleway)",
    Open_Sans: "var(--font-opensans)",
    Spectral: "var(--font-spectral)",
    Rokkitt: "var(--font-rokkitt)",
    Cormorant: "var(--font-cormorant)",
  };

  return map[fontName] || "var(--font-inter)";
}

export const metadata = {
  title: "Red Panda Resort",
  description: "Red Panda Resort is a demo website made using Contentstack.",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Red Panda Resort",
    description:
      "Red Panda Resort is a luxury resort located in the heart of the Himalayas. It is a perfect place for a relaxing vacation.",
    images: [
      {
        url: "https://www.redpandaresort.com/images/logo.png",
      },
    ],
  },
};

export default async function RootLayout({ children, params }) {
  const parameters = await params;
  const locale = parameters?.locale || "en";

  const config = await getConfig();

  const headerFont = fontPicker(config.header_font);
  const buttonFont = fontPicker(config.button_font);
  const paragraphFont = fontPicker(config.paragraph_font);

  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
  const lyticsTag = process.env.LYTICS_TAG;

  return (
    <html lang={locale}>
      <head>
        {/* Google Tag Manager */}
        {gtmId && (
          <Script id="google-tag-manager" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              window.dataLayer.push({
                'gtm.start': new Date().getTime(),
                event: 'gtm.js'
              });

              (function(w,d,s,l,i){
                w[l]=w[l]||[];
                var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),
                dl=l!='dataLayer'?'&l='+l:'';
                j.async=true;
                j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
                f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${gtmId}');
            `}
          </Script>
        )}

        {/* Font Awesome */}
        <Script
          src="https://kit.fontawesome.com/d480817398.js"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />

        {/* Dynamic CMS-controlled font rules */}
        <style
          precedence="default"
          href="dynamic-font-rules"
          dangerouslySetInnerHTML={{
            __html: `
              h1, h2, h3 { font-family: ${headerFont}; }
              .button, button { font-family: ${buttonFont}; }
              .font-paragraph { font-family: ${paragraphFont} !important; }
            `,
          }}
        />
      </head>

      <body
        suppressHydrationWarning
        className={[
          inter.variable,
          poppins.variable,
          cinzel.variable,
          montserrat.variable,
          playfair_display.variable,
          roboto.variable,
          raleway.variable,
          open_sans.variable,
          spectral.variable,
          rokkitt.variable,
          cormorant.variable,
        ].join(" ")}
      >
        {/* GTM noscript fallback */}
        {gtmId && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        )}

        {/* Existing Lytics tracking */}
        {lyticsTag && <LyticsTracking />}

        <AppWrapper>{children}</AppWrapper>
      </body>
    </html>
  );
}