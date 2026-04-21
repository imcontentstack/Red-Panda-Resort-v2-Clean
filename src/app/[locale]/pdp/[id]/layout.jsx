
import { cache } from "react";
import { headers } from "next/headers";
import ContentstackServer from "@/lib/cstack";
import { pdpReferences } from "@/helpers/referencePaths";
import DataContextProvider from "@/context/data.context";
import RPCommerce from "@/lib/rpcommerce";

const fetchPdpPageData = cache(async (locale, id) => {
    const headersList = await headers();
    const variantParam = headersList.get('x-personalize-variants');

    const data = await ContentstackServer.getElementByUrlWithRefs(
        "pdp",
        "/pdp/" + id,
        locale,
        pdpReferences,
        {},
        variantParam
    );

    let commerceFallback = null;
    if (!data?.length && id && id !== "untitled") {
        try {
            const products = await RPCommerce.getProductByUrl(id, locale, {
                next: { revalidate: 300 },
            });
            if (products?.length > 0) {
                const p = products[0];
                commerceFallback = {
                    product: p,
                    variants: p?.variants ?? [],
                };
            }
        } catch {
            commerceFallback = null;
        }
    }

    return { data, commerceFallback };
});

export const generateMetadata = async ({ params }) => {
    const parameters = await params;
    const locale = parameters.locale;
    const { data, commerceFallback } = await fetchPdpPageData(locale, parameters.id);
    const entry = data?.[0];
    const product = commerceFallback?.product;

    return {
        title: entry?.seo?.title || entry?.product_name || product?.name || "Red Panda Resort",
        description:
            entry?.seo?.description ||
            entry?.description ||
            product?.description ||
            "Red Panda Resort is a demo website made using Contentstack.",
        robots: {
            index: !entry?.seo?.no_index,
            follow: !entry?.seo?.no_follow,
        },
        openGraph: {
            title: entry?.seo?.og_meta_tags?.title || entry?.product_name || product?.name || "Red Panda Resort",
            description:
                entry?.seo?.og_meta_tags?.description ||
                entry?.description ||
                product?.description ||
                "Red Panda Resort is a demo website made using Contentstack.",
            images: entry?.seo?.og_meta_tags?.image || entry?.images?.[0]?.image?.url || product?.media?.[0]?.path,
        },
    }
};

export default async function PDPLayout({
    children,
    params,
}) {
    const parameters = await params;
    const locale = parameters.locale;
    const { data, commerceFallback } = await fetchPdpPageData(locale, parameters.id);
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

    return (
        <DataContextProvider data={data} commerceFallback={commerceFallback}>
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