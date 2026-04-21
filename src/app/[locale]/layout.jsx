
import { cache } from "react";
import { headers } from "next/headers";
import ContentstackServer from "@/lib/cstack";
import DataContextProvider from "@/context/data.context";
import { homepageReferences } from "@/helpers/referencePaths";

const fetchData = cache(async (locale) => {
  const headersList = await headers();
  const variantParam = headersList.get('x-personalize-variants');
  const data = await ContentstackServer.getElementByTypeWithRefs("homepage", locale, homepageReferences, {}, variantParam);
  return data;
});

export const generateMetadata = async ({ params }) => {
  const parameters = await params;
  const locale = parameters.locale;

  const headersList = await headers();
  const pathname = headersList.get('x-pathname');
  const isHomePage = !pathname || pathname === '/' || pathname === `/${locale}` || pathname === `/${locale}/`;

  if (!isHomePage) {
    return {};
  }

  const data = await fetchData(locale);
  const entry = data?.[0];

  return {
    title: entry?.seo?.title,
    description: entry?.seo?.description,
    robots: {
      index: !entry?.seo?.no_index,
      follow: !entry?.seo?.no_follow,
    },
    openGraph: {
      title: entry?.seo?.og_meta_tags?.title,
      description: entry?.seo?.og_meta_tags?.description,
      images: entry?.seo?.og_meta_tags?.image,
    },
  }
};

export default async function RootLayout({
  children,
  params,
}) {
  const parameters = await params;
  const locale = parameters.locale;
  const data = await fetchData(locale);
  const entry = data?.[0];

  const faqSchema =
    entry?.aeo?.questions?.length > 0
      ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: entry?.aeo?.questions?.map((question) => ({
          "@type": "Question",
          name: question?.title,
          acceptedAnswer: {
            "@type": "Answer",
            text: question?.answer,
          },
        })),
      }
      : null;

  const headersList = await headers();
  const pathname = headersList.get('x-pathname');
  const isHomePage = !pathname || pathname === '/' || pathname === `/${locale}` || pathname === `/${locale}/`;

  if (!isHomePage) {
    return <>{children}</>;
  }

  return (
    <DataContextProvider data={data}>
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      {children}
    </DataContextProvider>
  );
}
