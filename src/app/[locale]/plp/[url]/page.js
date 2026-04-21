"use client";
import { useState, useEffect, useCallback } from "react";
import { ContentstackClient } from "@/lib/contentstack-client"
import Footer from "@/components/footer";
import Header from "@/components/header";
import PageHero from "@/components/pageHero";
import TextSection from "@/components/textSection";
import Hero from "@/components/hero";
import ArticleBanner from "@/components/articleBanner";
import ImageGrid from "@/components/imageGrid";
import Tabs from "@/components/tabs";
import Marquee from "@/components/marquee";
import Cards from "@/components/cards";
import Reviews from "@/components/reviews";
import CategoryBanner from "@/components/categoryBanner";
import Agent from "@/components/agent";
import LeadCapture from "@/components/leadCapture";
import ProductFeature from "@/components/productFeature";
import { AnimatePresence, motion } from "framer-motion";
import { useJstag } from "@/context/lyticsTracking";
import { useParams } from "next/navigation";
import RPCommerce from "@/lib/rpcommerce";
import CategoryHero from "@/components/categoryHero";
import ProductCard from "@/components/productCard";
import FilterPanel from "@/components/filterPanel";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilterList } from '@awesome.me/kit-610837e1f9/icons/classic/solid';
import { jsonToHTML } from '@contentstack/utils';
import { useDataContext, usePlpCommercePrefetch } from "@/context/data.context";
import { plpReferences } from "@/helpers/referencePaths";

export default function PLP() {
  const params = useParams();
  const initialData = useDataContext();
  const plpCommercePrefetch = usePlpCommercePrefetch();
  const jstag = useJstag();

  const [entry, setEntry] = useState({});
  const [category, setCategory] = useState(() => {
    const p = plpCommercePrefetch?.category;
    return p ? { ...p } : {};
  });
  const [products, setProducts] = useState(() => plpCommercePrefetch?.products ?? []);
  const [categoryFilters, setCategoryFilters] = useState(
    () => plpCommercePrefetch?.filters ?? null
  );
  const [filter, setFilter] = useState([]);
  const [sortBy, setSortBy] = useState("top_sellers");
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(() => {
    const p = plpCommercePrefetch;
    return !(p?.category?.id != null && p.products != null);
  });

  const applyCategoryFromEntry = useCallback(
    async (entryList) => {
      const plpFirst = entryList?.[0];
      if (
        plpFirst?.product_category &&
        Array.isArray(plpFirst.product_category) &&
        plpFirst.product_category.length > 0
      ) {
        plpFirst.product_category = plpFirst.product_category[0];
      }
      const csFallback = plpFirst?.product_category?.items?.[0];
      let resolved =
        plpCommercePrefetch?.category ||
        (await RPCommerce.getCategoryByURL(
          "/" + params.url,
          params.locale,
          true,
          2
        )) ||
        csFallback;
      const categoryData = {
        ...(resolved || {}),
        name: plpFirst?.headline || resolved?.name,
        description:
          plpFirst?.description &&
          plpFirst?.description != "<p></p>" &&
          plpFirst?.description != ""
            ? plpFirst?.description
            : resolved?.description,
        image: plpFirst?.image?.url || resolved?.image,
        video: plpFirst?.video?.url || null,
        $: plpFirst?.$,
      };
      setCategory(categoryData);
    },
    [plpCommercePrefetch, params.url, params.locale]
  );

  const getContent = useCallback(async () => {
    const entry = await ContentstackClient.getElementByUrlWithRefs(
      "plp",
      "/plp/" + params.url,
      params.locale,
      plpReferences,
      initialData
    );

    const firstEntry = entry?.[0];
    if (firstEntry) {
      jsonToHTML({
        entry: firstEntry,
        paths: [
          "modular_blocks_top.category_banner.description",
          "modular_blocks_bottom.category_banner.description",
          "description",
        ],
      });
    }

    const plpFirst = entry?.[0];
    if (
      plpFirst?.product_category &&
      Array.isArray(plpFirst.product_category) &&
      plpFirst.product_category.length > 0
    ) {
      plpFirst.product_category = plpFirst.product_category[0];
    }
    setEntry(entry);
    await applyCategoryFromEntry(entry);
  }, [params.url, params.locale, initialData, applyCategoryFromEntry]);

  useEffect(() => {
    if (!category?.id) return;

    if (
      plpCommercePrefetch?.category?.id === category.id &&
      plpCommercePrefetch.products != null
    ) {
      setProducts(plpCommercePrefetch.products);
      setCategoryFilters(plpCommercePrefetch.filters ?? null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const getProducts = async (id) => {
      try {
        const list = await RPCommerce.getProductsByCategory(id, params.locale);
        setProducts(list ?? []);
      } catch (e) {
        console.error("getProductsByCategory failed:", e);
        setProducts([]);
      }
    };

    const getFilters = async (id) => {
      try {
        const filters = await RPCommerce.getCategoryFilters(id, params.locale);
        setCategoryFilters(filters);
      } catch (e) {
        console.error("getCategoryFilters failed:", e);
        setCategoryFilters(null);
      }
    };

    Promise.all([getProducts(category.id), getFilters(category.id)]).finally(
      () => {
        setIsLoading(false);
      }
    );
  }, [category, params.locale, plpCommercePrefetch]);

  useEffect(() => {
    ContentstackClient.onEntryChange(getContent);
  }, [getContent]);

  useEffect(() => {
    jstag.send({ lead_score: 25 });
    jstag.call("resetPolling");
  }, [jstag, params.url]);

  /**
   * FILTER MANAGEMENT
   * =================
   * Handles adding/removing filters from the active filter list.
   * Filters are stored as strings: 'attr_123', 'tag_456', 'brand_Nike'
   */
  const handleFilterChange = (item, isOn) => {
    if (isOn) {
      // Add filter to active filters
      let temp = [...filter];
      temp.push(item);
      setFilter(temp);
    } else {
      // Remove filter from active filters
      const fils = filter.filter((f) => f !== item);
      setFilter(fils);
    }
  };

  /**
   * Reset all filters and sorting to default state
   */
  const handleResetAll = () => {
    setFilter([]);
    setSortBy("top_sellers");
  };

  /**
   * PRODUCT SORTING
   * ===============
   * Sorts products based on selected criteria.
   * This runs AFTER filtering - only sorts visible products.
   * 
   * Available Sort Options:
   * - top_sellers: Default order from Red Panda Commerce (most popular first)
   * - newest: Sort by created_at date (newest first)
   * - price_low_high: Sort by price ascending
   * - price_high_low: Sort by price descending
   */
  const sortProducts = (productsToSort) => {
    const sorted = [...productsToSort];

    switch (sortBy) {
      case "newest":
        return sorted.sort((a, b) => {
          const dateA = new Date(a.created_at || 0);
          const dateB = new Date(b.created_at || 0);
          return dateB - dateA; // Newest first
        });

      case "price_low_high":
        return sorted.sort((a, b) => {
          const priceA = parseFloat(a.price || 0);
          const priceB = parseFloat(b.price || 0);
          return priceA - priceB; // Low to high
        });

      case "price_high_low":
        return sorted.sort((a, b) => {
          const priceA = parseFloat(a.price || 0);
          const priceB = parseFloat(b.price || 0);
          return priceB - priceA; // High to low
        });

      default:
        // top_sellers - keep original order from API (most popular first)
        return sorted;
    }
  };

  /**
   * CLIENT-SIDE FILTERING SYSTEM
   * =============================
   * This function determines if a product passes all active filters.
   * It's completely extensible - works automatically for ANY attributes from Red Panda Commerce.
   * 
   * FILTER STRUCTURE:
   * - Filters are stored as strings with prefixes: 'attr_123', 'tag_456', 'brand_Nike'
   * - This prefix system allows us to handle different filter types generically
   * 
   * FILTERING LOGIC:
   * - OR Logic: Within same category (e.g., Red OR Blue for Color)
   * - AND Logic: Between different categories (e.g., must match Color AND Size AND Tags)
   * 
   * WHY IT'S EXTENSIBLE:
   * - Uses attribute IDs, not hardcoded names
   * - Loops through all attributes dynamically from API
   * - New attributes (Material, Pattern, Fit, etc.) work automatically with no code changes
   */
  const isInFilter = (product) => {
    // No filters active = show all products
    if (filter.length === 0) return true;
    if (!product) return false;

    // STEP 1: Parse selected filters by type
    // =======================================
    // Extract IDs from filter strings like 'attr_123' → 123
    const attributeFilters = filter.filter(f => f.startsWith('attr_')).map(f => parseInt(f.replace('attr_', '')));
    const tagFilters = filter.filter(f => f.startsWith('tag_')).map(f => parseInt(f.replace('tag_', '')));
    const brandFilters = filter.filter(f => f.startsWith('brand_')).map(f => f.replace('brand_', ''));

    // STEP 2: Handle Attribute Filters (Color, Size, Material, Pattern, etc.)
    // ========================================================================
    if (attributeFilters.length > 0 && categoryFilters?.filters?.attributes) {
      // Group selected filters by their attribute type
      // Example: {112: [1, 2, 3], 113: [5, 6]} 
      // where 112 = Color attribute_id with value_ids [1=Red, 2=Blue, 3=Green]
      //       113 = Size attribute_id with value_ids [5=Small, 6=Medium]
      const attributeGroups = {};

      // Loop through ALL attributes from API (not just Color/Size - works for ANY attribute!)
      categoryFilters.filters.attributes.forEach(attr => {
        // Find which values for this attribute are selected
        // E.g., for Color (attr.id = 112), find if Red (id=1), Blue (id=2), etc. are selected
        const selectedValueIds = attr.values
          .filter(v => attributeFilters.includes(v.id))
          .map(v => v.id);

        // If user selected any values for this attribute, add to groups
        if (selectedValueIds.length > 0) {
          attributeGroups[attr.id] = selectedValueIds;
        }
      });

      // Get all attribute value_ids that this product has
      // E.g., product has [1, 5] meaning Red (1) and Small (5)
      const productAttributeValueIds = product.attributes?.map(attr => attr.value_id) || [];

      // Check each attribute group (AND logic between groups)
      for (const valueIds of Object.values(attributeGroups)) {
        // OR Logic within same attribute: Product needs at least ONE matching value
        // Example: If user selected "Red OR Blue" for Color, product must have Red OR Blue
        const hasMatchInGroup = valueIds.some(valueId =>
          productAttributeValueIds.includes(valueId)
        );

        // AND Logic between attributes: If this attribute has selections, product MUST match
        // Example: Product must match (Red OR Blue) AND (Small OR Medium) AND (Cotton OR Wool)
        if (!hasMatchInGroup) return false;
      }
    }

    // STEP 3: Handle Tag Filters (OR logic - product needs at least one matching tag)
    // ===============================================================================
    if (tagFilters.length > 0) {
      const productTagIds = product.tags?.map(tag => tag.id) || [];
      const hasMatchingTag = tagFilters.some(filterId =>
        productTagIds.includes(filterId)
      );
      // If user selected tags but product doesn't have any, exclude it
      if (!hasMatchingTag) return false;
    }

    // STEP 4: Handle Brand Filters (OR logic - product needs to match one of selected brands)
    // ======================================================================================
    if (brandFilters.length > 0) {
      const productBrand = product.brand?.name || product.brand_name || product.brand;
      const hasMatchingBrand = brandFilters.some(brandName =>
        productBrand && (productBrand === brandName || productBrand.toLowerCase() === brandName.toLowerCase())
      );
      // If user selected brands but product doesn't match any, exclude it
      if (!hasMatchingBrand) return false;
    }

    // Product passed all filter checks!
    return true;
  };

  const transformEntryProducts = () => {
    const first = entry?.[0];
    if (!first?.entry_products || !Array.isArray(first.entry_products) || first.entry_products.length === 0) {
      return [];
    }

    return first.entry_products.map((product) => {
      const productImages = [];
      if (product?.images && Array.isArray(product.images) && product.images.length > 0) {
        product.images.forEach(img => {
          const imageUrl = img?.image?.url || img?.url || img;
          if (imageUrl) {
            productImages.push({ path: imageUrl });
          }
        });
      }
      // If no images array, use single image
      if (productImages.length === 0 && product?.image) {
        const imageUrl = product.image?.url || product.image;
        if (imageUrl) {
          productImages.push({ path: imageUrl });
        }
      }

      // Extract URL - remove /pdp/ prefix if present since ProductCard adds it
      let productUrl = product?.url || "";
      if (productUrl.startsWith("/pdp/")) {
        productUrl = productUrl.replace("/pdp/", "");
      }

      // Transform Contentstack product reference to match ProductCard structure
      return {
        url: productUrl || product?.uid || "",
        name: product?.product_name || product?.name || product?.title || "",
        price: product?.price || "",
        currency_symbol: product?.currency_symbol || "$",
        image: productImages.length > 0 ? productImages[0].path : "",
        image_path: productImages.length > 0 ? productImages[0].path : "",
        media: productImages,
        tags: product?.tags || [],
        attributes: product?.attributes || [],
        variants: product?.variants?.items || product?.variants || [],
        // Add any other fields that might be needed
        created_at: product?.created_at || new Date().toISOString(),
        brand: product?.brand || null,
        brand_name: product?.brand_name || product?.brand?.name || null,
      };
    });
  };

  // Combine Red Panda Commerce products with Contentstack entry_products
  const allProducts = [
    ...(Array.isArray(products) ? products : []),
    ...transformEntryProducts()
  ];

  console.log(entry)

  return (
    <div className="relative overflow-hidden">
      <Header locale={params.locale} />
      <div className="flex min-h-screen">
        <div
          className={`pb-24 grow bg-white text-black`}
        >
          <AnimatePresence mode="wait">
            <div
              className={
                entry?.[0]?.modular_blocks_top?.length === 0
                  ? "visual-builder__empty-block-parent"
                  : ""
              }
              {...entry?.[0]?.$?.modular_blocks_top}
            >
              {entry?.[0]?.modular_blocks_top?.map((block, index) => {
                const metadata = entry?.[0]?.$?.[`modular_blocks_top__${index}`];
                const uniqueKey = `${Object.keys(block)[0]}_${index}_${block.wasReplaced ? "replaced" : "original"
                  }`;

                const blockContent = (
                  <>
                    {block.hasOwnProperty("hero") && (
                      <PageHero
                        key={index}
                        content={block.hero}
                        {...metadata}
                      />
                    )}
                    {block.hasOwnProperty("text_block") && (
                      <TextSection key={index} content={block.text_block} />
                    )}
                    {block.hasOwnProperty("cards") && (
                      <Cards key={index} content={block.cards} />
                    )}
                    {block.hasOwnProperty("review") && (
                      <Reviews key={index} content={block.review} />
                    )}
                    {block.hasOwnProperty("product_banner") && (
                      <ProductFeature
                        key={index}
                        content={block.product_banner}
                      />
                    )}
                    {block.hasOwnProperty("category_banner") && (
                      <CategoryBanner
                        key={index}
                        content={block.category_banner}
                        locale={params.locale}
                      />
                    )}
                    {block.hasOwnProperty("lead_capture") && (
                      <LeadCapture key={index} content={block.lead_capture} />
                    )}
                    {block.hasOwnProperty("agent") && (
                      <Agent key={index} agentData={block.agent} />
                    )}
                    {block.hasOwnProperty("hero_banner") && (
                      <Hero
                        key={index}
                        content={block.hero_banner.hero}
                        locale={params.locale}
                        withHeader={false}
                      />
                    )}
                    {block.hasOwnProperty("image_grid") && (
                      <ImageGrid
                        key={index}
                        content={block.image_grid}
                        isKiosk={
                          entry?.[0]?._applied_variants?.title ===
                          "cs76fdee0e83c5c333"
                        }
                        {...block?.$?.image_grid}
                      />
                    )}
                    {block.hasOwnProperty("articles") && (
                      <ArticleBanner key={index} content={block.articles} />
                    )}
                    {block.hasOwnProperty("tabs") && (
                      <Tabs key={index} content={block.tabs} />
                    )}
                    {block.hasOwnProperty("marquee") && (
                      <Marquee key={index} content={block.marquee} />
                    )}
                  </>
                );

                return block.wasReplaced ? (
                  <motion.div
                    key={uniqueKey}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                  >
                    {blockContent}
                  </motion.div>
                ) : (
                  <div key={uniqueKey} {...metadata}>
                    {blockContent}
                  </div>
                );
              })}
            </div>
          </AnimatePresence>
          {(!entry || !entry?.[0] || entry?.[0]?.show_category_hero) && (
            <CategoryHero category={category} locale={params.locale} />
          )}
          <FilterPanel
            isOpen={filterPanelOpen}
            onClose={() => setFilterPanelOpen(false)}
            sortBy={sortBy}
            setSortBy={setSortBy}
            selectedFilters={filter}
            onFilterChange={handleFilterChange}
            onResetAll={handleResetAll}
            categoryFilters={categoryFilters}
          />
          {/* LOADING SPINNER */}
          {isLoading && (
            <div className="flex items-center justify-center py-32">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-600"></div>
                <p className="mt-4 text-gray-600">Loading products...</p>
              </div>
            </div>
          )}

          {/* PRODUCT COUNTER: Shows filtered product count */}
          {!isLoading && allProducts?.length > 0 && <div className="w-full mx-auto px-12 mt-12 mb-8">
            <div className="text-[0.7rem] font-normal text-black">
              {allProducts.filter((item) => isInFilter(item)).length} RESULTS
            </div>
          </div>}

          {/* 
            PRODUCT GRID WITH FILTERING & SORTING
            =====================================
            Flow: ALL PRODUCTS → Filter (isInFilter) → Sort (sortProducts) → Display
            
            1. Start with all products from Red Panda Commerce
            2. Filter: Apply client-side filtering using isInFilter()
            3. Sort: Sort filtered results based on selected criteria
            4. Display: Render with fade-in animation
            
            This approach works great for:
            - Small to medium catalogs (< 1000 products)
            - Dynamic filtering without API calls
            - Any new attributes automatically supported
          */}
          {!isLoading && (
            <div className="w-full mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-2 gap-y-16 pb-16">
              {Array.isArray(allProducts) && sortProducts(allProducts.filter((item) => isInFilter(item)))
                .map((item, index) => (
                  <motion.div
                    key={item?.url || item?.uid || index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.1 }}
                    transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <ProductCard item={item} />
                  </motion.div>
                ))}
            </div>
          )}
        </div>
      </div>

      {!filterPanelOpen && !isLoading && (
        <button
          onClick={() => setFilterPanelOpen(true)}
          className={`fixed ${(process.env.LIVE_PREVIEW_ENABLED) ? "bottom-16" : "bottom-8"} right-8 z-50 bg-white hover:bg-gray-50 text-gray-800 font-medium px-6 py-4 rounded-full shadow-lg border border-gray-400 flex items-center gap-2 transition-all duration-200 hover:shadow-xl ${filterPanelOpen ? "hidden" : ""}`}
        >
          <FontAwesomeIcon icon={faFilterList} />
          <span className="uppercase tracking-wide text-[0.8rem] font-light">Filters and Sorting</span>
        </button>
      )}


      <AnimatePresence mode="wait">
        <div
          className={
            entry?.[0]?.modular_blocks_bottom?.length === 0
              ? "visual-builder__empty-block-parent"
              : ""
          }
          {...entry?.[0]?.$?.modular_blocks_bottom}
        >
          {entry?.[0]?.modular_blocks_bottom?.map((block, index) => {
            const metadata = entry?.[0]?.$?.[`modular_blocks_bottom__${index}`];
            const uniqueKey = `${Object.keys(block)[0]}_${index}_${block.wasReplaced ? "replaced" : "original"
              }`;

            const blockContent = (
              <>
                {block.hasOwnProperty("hero") && (
                  <PageHero
                    key={index}
                    content={block.hero}
                    {...metadata}
                  />
                )}
                {block.hasOwnProperty("text_block") && (
                  <TextSection key={index} content={block.text_block} />
                )}
                {block.hasOwnProperty("cards") && (
                  <Cards key={index} content={block.cards} />
                )}
                {block.hasOwnProperty("review") && (
                  <Reviews key={index} content={block.review} />
                )}
                {block.hasOwnProperty("product_banner") && (
                  <ProductFeature
                    key={index}
                    content={block.product_banner}
                  />
                )}
                {block.hasOwnProperty("category_banner") && (
                  <CategoryBanner
                    key={index}
                    content={block.category_banner}
                    locale={params.locale}
                  />
                )}
                {block.hasOwnProperty("lead_capture") && (
                  <LeadCapture key={index} content={block.lead_capture} />
                )}
                {block.hasOwnProperty("agent") && (
                  <Agent key={index} agentData={block.agent} />
                )}
                {block.hasOwnProperty("hero_banner") && (
                  <Hero
                    key={index}
                    content={block.hero_banner.hero}
                    locale={params.locale}
                    withHeader={false}
                  />
                )}
                {block.hasOwnProperty("image_grid") && (
                  <ImageGrid
                    key={index}
                    content={block.image_grid}
                    isKiosk={
                      entry?.[0]?._applied_variants?.title ===
                      "cs76fdee0e83c5c333"
                    }
                    {...block?.$?.image_grid}
                  />
                )}
                {block.hasOwnProperty("articles") && (
                  <ArticleBanner key={index} content={block.articles} />
                )}
                {block.hasOwnProperty("tabs") && (
                  <Tabs key={index} content={block.tabs} />
                )}
                {block.hasOwnProperty("marquee") && (
                  <Marquee key={index} content={block.marquee} />
                )}
              </>
            );

            return block.wasReplaced ? (
              <motion.div
                key={uniqueKey}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
              >
                {blockContent}
              </motion.div>
            ) : (
              <div key={uniqueKey} {...metadata}>
                {blockContent}
              </div>
            );
          })}
        </div>
      </AnimatePresence>

      <Footer />
    </div>
  );
}
