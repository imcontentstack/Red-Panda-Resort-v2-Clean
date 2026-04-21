
import { cache } from "react";
import { headers } from "next/headers";
import ContentstackServer from "@/lib/cstack";
import { plpReferences } from "@/helpers/referencePaths";
import DataContextProvider from "@/context/data.context";
import RPCommerce from "@/lib/rpcommerce";

const fetchPlpPageData = cache(async (locale, url) => {
    const headersList = await headers();
    const variantParam = headersList.get('x-personalize-variants');

    const data = await ContentstackServer.getElementByUrlWithRefs(
        "plp",
        "/plp/" + url,
        locale,
        plpReferences,
        {},
        variantParam
    );

    let plpCommercePrefetch = null;
    const slug = url && url !== "untitled" ? url : null;
    const categoryPath = slug ? (slug.startsWith("/") ? slug : `/${slug}`) : null;

    if (categoryPath) {
        try {
            const category = await RPCommerce.getCategoryByURL(categoryPath, locale, true, 2, {
                next: { revalidate: 300 },
            });
            if (category?.id) {
                const [products, filters] = await Promise.all([
                    RPCommerce.getProductsByCategory(category.id, locale, {
                        next: { revalidate: 300 },
                    }),
                    RPCommerce.getCategoryFilters(category.id, locale, {
                        next: { revalidate: 300 },
                    }),
                ]);
                plpCommercePrefetch = {
                    category,
                    products: products ?? [],
                    filters,
                };
            }
        } catch {
            plpCommercePrefetch = null;
        }
    }

    return { data, plpCommercePrefetch };
});

export const generateMetadata = async ({ params }) => {
    const parameters = await params;
    const locale = parameters.locale;
    const { data, plpCommercePrefetch } = await fetchPlpPageData(locale, parameters.url);
    const entry = data?.[0];
    const category = plpCommercePrefetch?.category;

    return {
        title: entry?.seo?.title || entry?.headline || category?.name || "Red Panda Resort",
        description:
            entry?.seo?.description ||
            entry?.description ||
            category?.description ||
            "Red Panda Resort is a demo website made using Contentstack.",
        robots: {
            index: !entry?.seo?.no_index,
            follow: !entry?.seo?.no_follow,
        },
        openGraph: {
            title: entry?.seo?.og_meta_tags?.title || entry?.headline || category?.name || "Red Panda Resort",
            description:
                entry?.seo?.og_meta_tags?.description ||
                entry?.description ||
                category?.description ||
                "Red Panda Resort is a demo website made using Contentstack.",
            images: entry?.seo?.og_meta_tags?.image || entry?.image?.url || category?.image,
        },
    }
};

export default async function PLPLayout({
    children,
    params,
}) {
    const parameters = await params;
    const locale = parameters.locale;
    const { data, plpCommercePrefetch } = await fetchPlpPageData(locale, parameters.url);
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
        <DataContextProvider data={data} plpCommercePrefetch={plpCommercePrefetch}>
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