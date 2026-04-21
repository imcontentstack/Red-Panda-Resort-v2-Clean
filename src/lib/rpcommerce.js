const baseURL =  `${process.env.RED_PANDA_COMMERCE_API_URL}/api/public/store/${process.env.RED_PANDA_COMMERCE_STORE_ID}`;
const headers = {
    'Authorization': process.env.RED_PANDA_COMMERCE_STORE_TOKEN,
    'x-store-token': process.env.RED_PANDA_COMMERCE_STORE_TOKEN
}

function buildFetchInit(fetchOptions = {}) {
    const init = {
        headers,
        ...fetchOptions,
    };
    if (
        typeof AbortSignal !== "undefined" &&
        typeof AbortSignal.timeout === "function" &&
        !init.signal
    ) {
        init.signal = AbortSignal.timeout(25000);
    }
    return init;
}

const RPCommerce = {
    getCategoryByURL: async (url, locale, includeSubCategories = true, level = 2, fetchOptions = {}) => {
        const q = new URLSearchParams({
            url,
            includeSubCategories: String(includeSubCategories),
            locale,
            level: String(level),
            useFallbackLocale: "true",
        });
        const response = await fetch(`${baseURL}/categories/categoryByUrl?${q}`, buildFetchInit(fetchOptions));
        if (!response.ok) {
            return null;
        }

        const data = await response.json();
        return data.category;
    },

    getProductsByCategory: async (categoryId, locale, fetchOptions = {}) => {
        const q = new URLSearchParams({
            includeTags: "true",
            includeCategories: "true",
            categories: String(categoryId),
            includeVariants: "true",
            locale,
            includeMedia: "true",
            includeAttributes: "true",
            useFallbackLocale: "true",
        });
        const response = await fetch(`${baseURL}/products?${q}`, buildFetchInit(fetchOptions));
        if (!response.ok) {
            return null;
        }

        const data = await response.json();
        return data.products;
    },

    getCategoryFilters: async (categoryId, locale, fetchOptions = {}) => {
        const q = new URLSearchParams({
            locale,
            useFallbackLocale: "true",
        });
        const response = await fetch(`${baseURL}/filters/categories/${categoryId}?${q}`, buildFetchInit(fetchOptions));
        if (!response.ok) {
            return null;
        }
        return response.json();
    },

    getProductByUrl: async (id, locale, fetchOptions = {}) => {
        const q = new URLSearchParams({
            url: id,
            locale,
            useFallbackLocale: "true",
            includeMedia: "true",
            includeVariants: "true",
            includeAttributes: "true",
            includeAttributesMap: "true",
            includeCategories: "true",
            includeTags: "true",
            includeCustomData: "true",
        });
        const response = await fetch(`${baseURL}/products?${q}`, buildFetchInit(fetchOptions));
        if (!response.ok) {
            return null;
        }
        const data = await response.json();
        return data.products;
    }
};

export default RPCommerce;