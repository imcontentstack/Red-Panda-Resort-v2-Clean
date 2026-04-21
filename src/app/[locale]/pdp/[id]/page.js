"use client";
import { useState, useEffect, useCallback } from "react";
import { ContentstackClient } from "@/lib/contentstack-client"
import Footer from "@/components/footer";
import Header from "@/components/header";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/20/solid";
import { useRouter } from "next/navigation";
import { LyticsTracking, useEntity, useJstag } from "@/context/lyticsTracking";
import PageHero from "@/components/pageHero";
import TextSection from "@/components/textSection";
import People from "@/components/people";
import Hero from "@/components/hero";
import ArticleBanner from "@/components/articleBanner";
import ImageGrid from "@/components/imageGrid";
import Tabs from "@/components/tabs";
import Marquee from "@/components/marquee";
import FormBuilder from "@/components/formBuilder";
import Cards from "@/components/cards";
import Reviews from "@/components/reviews";
import CategoryBanner from "@/components/categoryBanner";
import Agent from "@/components/agent";
import LeadCapture from "@/components/leadCapture";
import ProductFeature from "@/components/productFeature";
import RecommendationsBanner from "@/components/recommendationsBanner";
import { useParams } from "next/navigation";
import Link from "next/link";
import RPCommerce from "@/lib/rpcommerce";
import { pdpReferences } from "@/helpers/referencePaths";
import { useDataContext, useCommerceFallback } from "@/context/data.context";
import { jsonToHTML } from '@contentstack/utils';


export default function Page({  }) {
  const params = useParams();
  const initialData = useDataContext();
  const commerceFallback = useCommerceFallback();
  const jstag = useJstag();

  const [entry, setEntry] = useState({});
  const [product, setProduct] = useState(() => commerceFallback?.product ?? {});
  const [isLoading, setIsLoading] = useState(() => {
    const hasStack = Array.isArray(initialData) && initialData.length > 0;
    const hasCommercePrefetch = Boolean(commerceFallback?.product);
    return !(hasStack || hasCommercePrefetch);
  });
  const [imageIndex, setImageIndex] = useState(0);
  const router = useRouter();
  const [variants, setVariants] = useState(
    () => commerceFallback?.variants ?? commerceFallback?.product?.variants ?? []
  );
  const [variantsOpen, setVariantsOpen] = useState(false);
  const [variantImageIndices, setVariantImageIndices] = useState({});
  const [translations, setTranslations] = useState({});
  const [purchaseOpen, setPurchaseOpen] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const handleGoBack = () => {
    router.back();
  };

  const handleChange = (event) => {
    event.preventDefault();
    setInputValue(event.target.value);
  };

  function buyClick(price) {
    jstag.send({
      shopify_total_spend: price,
      _e: "purchase",
      email: inputValue,
    });
    jstag.call("resetPolling");
    setInputValue("");
    setPurchaseSuccess(true);
  }

  const getProductsbyURL = useCallback(async (id) => {
      try {
        const products = await RPCommerce.getProductByUrl(id, params.locale);
        if (products && products.length > 0) {
          setVariants(products[0]?.variants);
          setProduct(products[0]);
        }
      } catch (e) {
        console.error("getProductByUrl failed:", e);
      } finally {
        setIsLoading(false);
      }
    }, [params.locale]);

  const getContent = useCallback(async () => {
    if (params.id === "untitled" || !params.id) return;
    const hasStackPrefetch = Array.isArray(initialData) && initialData.length > 0;
    const hasCommercePrefetch = Boolean(commerceFallback?.product);
    if (!hasStackPrefetch && !hasCommercePrefetch) {
      setIsLoading(true);
    }
      const query = await ContentstackClient.getElementByUrlWithRefs(
        "pdp",
        "/pdp/" + params.id,
        params.locale,
        pdpReferences,
        initialData
      );
      if (query && query.length > 0){
        console.log(query)
        const q0 = query[0];

        jsonToHTML({
          entry: q0,
          paths: ['modular_blocks_top.category_banner.description', 'modular_blocks_bottom.category_banner.description']
        });
        
        if(q0?.product && Array.isArray(q0?.product) && q0?.product?.length > 0) {
          q0.product = q0.product[0];
        }
        if(q0?.variants && Array.isArray(q0?.variants) && q0?.variants?.length > 0) {
          q0.variants = q0.variants[0];
        }
        setProduct(q0?.product?.items?.[0])
        setEntry(q0);
        setVariants(q0?.variants?.items);
        setIsLoading(false);
    } else if (commerceFallback?.product) {
      setVariants(commerceFallback.variants ?? commerceFallback.product?.variants ?? []);
      setProduct(commerceFallback.product);
      setEntry({});
      setIsLoading(false);
    } else {
      console.log("can't find contentstack entry, fetching product by url")
      await getProductsbyURL(params.id);
    }
  }, [params.id, params.locale, initialData, commerceFallback, getProductsbyURL]);

  const getTranslations = useCallback(async () => {
    try {
      // Clear translations when locale changes
      setTranslations({});
      // Fetch all translations entries and find the one with title "PDP Translations"
      const translationsEntries = await ContentstackClient.getElementByType(
        "translations",
        params.locale,
        null
      );
      const translationsEntry = translationsEntries?.find(
        (entry) => entry.title === "PDP Translations"
      );
      if (translationsEntry && translationsEntry.key_values) {
        const translationsMap = {};
        translationsEntry.key_values.forEach((item) => {
          translationsMap[item.key] = item.value;
        });
        setTranslations(translationsMap);
      } else {
        console.warn(`No translations found for locale: ${params.locale} with title "PDP Translations"`);
      }
    } catch (error) {
      console.error("Error fetching translations:", error);
    }
  }, [params.locale]);

  const getTranslation = (key, fallback) => {
    return translations[key] || fallback;
  };

  useEffect(() => {
    getTranslations();
    ContentstackClient.onEntryChange(getContent);
  }, [getTranslations, getContent]);

  
  if (isLoading || (!entry && !product)) {
    return (
      <div className="relative">
        <Header locale={params.locale} />
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-600"></div>
            <p className="mt-4 text-gray-600">Loading product...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <Header locale={params.locale} />
      <div className="max-w-8xl mx-auto px-8 pt-10 flex flex-col font-paragraph mb-12">
        <div className="w-full md:flex gap-16">
          <div className="md:w-1/2">
            <button
              onClick={() => handleGoBack()}
              className="flex mb-4 items-center text-cyan-600 hover:text-[#D1A261]"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              <p className="inline-block">{getTranslation("back_button", "Back to previous products")}</p>
            </button>
            <div className="mt-4 flex gap-4">
              
              {/* Thumbnails column */}
              <div className="flex flex-col gap-3">
                {((entry?.images?.length === 0 || !entry?.images) &&
                  (product?.media && product?.media?.length > 0)) && (
                  <div className="flex flex-col gap-3">
                    {product.media?.map((image, index) => (
                      <button
                        key={index}
                        type="button"
                        className={
                          "border p-1 cursor-pointer bg-white my-[6px] " +
                          (imageIndex === index ? "border-black" : "border-gray-300")
                        }
                        onClick={() => setImageIndex(index)}
                      >
                        <img
                          className="h-[68px] w-[68px] object-cover"
                          src={image?.path}
                          alt={product?.name || `Product image ${index + 1}`}
                        />
                      </button>
                    ))}
                  </div>
                )}
                {entry?.images?.length > 0 && (
                  <div className="flex flex-col gap-3">
                    {entry?.images?.map((image, index) => (
                      <button
                        key={index}
                        type="button"
                        className={
                          "border p-1 cursor-pointer bg-white my-[6px] " +
                          (imageIndex === index ? "border-black" : "border-gray-300")
                        }
                        onClick={() => setImageIndex(index)}
                      >
                        <img
                          className="h-[68px] w-[68px] object-cover"
                          src={image.image?.url}
                          alt={entry?.product_name || `Product image ${index + 1}`}
                          {...image?.$?.image}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Main image */}
              <div className="flex-1">
                {(product?.media && product?.media?.length > 0) && (entry?.images?.length === 0 || !entry?.images) && (
                  <img
                    className="object-cover mx-auto h-[500px] w-full"
                    src={product?.media?.[imageIndex]?.path}
                    alt={product?.name || "Product image"}
                  />
                )}
                {(!product?.media || !product.media?.[0]?.media?.[0]) && entry?.images?.[imageIndex]?.image?.url && (
                  <img
                    className="object-cover mx-auto h-[500px] w-full"
                    src={entry?.images?.[imageIndex]?.image?.url}
                    alt={entry?.product_name || "Product image"}
                    {...entry?.images?.[imageIndex]?.$?.image}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="xl:w-1/2 lg:w-4/6 md:w-3/4 mt-10">
            <div className="text-[32px] leading-none mt-8" {...entry?.$?.product_name}>
              {entry?.product_name ? entry?.product_name : product?.name}
            </div>
            {(product?.sku || entry?.sku) && (
              <div className="text-[20px] mt-4">
                {entry?.sku ? entry?.sku : product?.sku}
              </div>
            )}
            {(product?.price || entry?.price) && (
              <div className="text-[32px] mt-4">
                
                {entry?.currency_symbol ? entry?.currency_symbol : product?.currency_symbol}{entry?.price ? entry?.price : product?.price}
              </div>
            )}
            <div id="wrapper" className="relative w-3/4 mt-4">
              {variants && variants.length > 0 && (
                <button
                  className="flex items-center gap-3 min-h-[75px] px-4 mt-4 md:w-full lg:w-3/4 xl:w-4/6 relative rounded-[60px] button tracking-widest uppercase bg-white font-bold text-cyan-600 shadow-sm ring-2 ring-inset ring-cyan-600 hover:bg-cyan-600 hover:text-white"
                  onClick={() => setVariantsOpen(true)}
                >
                  <img className="w-[70px] h-[70px] rounded-[50%] flex-shrink-0" src={variants?.[0]?.media?.[0]?.path} alt={variants?.[0]?.name || "Product variant"}></img>
                  <div className="flex-1 text-center whitespace-normal break-words">{getTranslation("variations_button", "SEE ALL VARIATIONS")}</div>
                </button>
              )}
              <button
                className="mt-4 rounded-[60px] md:w-full lg:w-3/4 xl:w-4/6 text-nowrap relative button px-8 py-4 text-md tracking-widest uppercase bg-white font-bold text-cyan-600 shadow-sm ring-2 ring-inset ring-cyan-600 hover:bg-cyan-600 hover:text-white"
                onClick={() => {
                  const productName = entry?.product_name || product?.name || "";
                  if (typeof jstag?.send === "function") {
                    jstag.send({ product_name: productName });
                  }
                  setPurchaseOpen(true);
                }}
              >
               {getTranslation("cart_button", "Add to Cart")}
              </button>
            </div>

            
          </div>
        </div>
        <div className="text-[32px] leading-none normal-case mt-8">
          {getTranslation("description_label", "Description")}
        </div>
        <div
          className="mt-4 font-extralight whitespace-pre-line [&_p]:mt-3 [&_ul]:list-disc  [&_ul]:pl-10 text-sm tracking-wide"
          dangerouslySetInnerHTML={{
            __html: entry?.description
              ? entry?.description
              : product?.description,
          }}
          {...entry?.$?.description}
        ></div>
      </div>

      <div
        className={
          entry?.modular_blocks?.length === 0
            ? "visual-builder__empty-block-parent"
            : ""
        }
        {...entry?.$?.modular_blocks}
      >
        {entry?.modular_blocks?.map((block, index) => (
          <div key={index} {...entry?.$?.["modular_blocks__" + index]}>
            {block.hasOwnProperty("hero") && (
              <PageHero
                key={index}
                content={block.hero}
                {...entry?.$?.["modular_blocks__" + index]}
              />
            )}
            {block.hasOwnProperty("people") && (
              <People
                key={index}
                content={block.people}
                isKiosk={
                  entry?._applied_variants?.title === "cs76fdee0e83c5c333"
                }
              />
            )}
            {block.hasOwnProperty("text_block") && (
              <TextSection key={index} content={block.text_block} />
            )}
            {block.hasOwnProperty("cards") &&
              <Cards key={index} content={block.cards} />
            }
            {block.hasOwnProperty("review") &&
              <Reviews key={index} content={block.review} />
            }
            {block.hasOwnProperty("product_banner") &&
              <ProductFeature key={index} content={block.product_banner} />
            }
            {block.hasOwnProperty("category_banner") &&
              <CategoryBanner key={index} content={block.category_banner} />
            }
            {block.hasOwnProperty("lead_capture") &&
              <LeadCapture key={index} content={block.lead_capture} />
            }
            {block.hasOwnProperty("agent") &&
              <Agent key={index} agentData={block.agent} />
            }
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
                  entry?._applied_variants?.title === "cs76fdee0e83c5c333"
                }
                {...block.$?.image_grid}
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
            {block.hasOwnProperty("form_builder") && (
              <FormBuilder key={index} content={block.form_builder} />
            )}
            {block.hasOwnProperty("recommendations_banner") && (
              <RecommendationsBanner key={index} content={block.recommendations_banner} />
            )}
          </div>
        ))}
      </div>

      {/* Variants Slideout */}
      {variantsOpen && (
        <div
          className="fixed top-0 h-full bg-black opacity-50 w-full z-40 transition-opacity duration-300"
          onClick={() => setVariantsOpen(false)}
        ></div>
      )}
      <div
        className={`fixed w-[450px] z-50 h-full top-0 right-0 border-l bg-white shadow-lg transition-transform duration-300 ease-in-out ${
          variantsOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center p-4 border-b">
            <div className="text-lg">All Variations</div>
            <XMarkIcon
              className="size-6 cursor-pointer"
              onClick={() => setVariantsOpen(false)}
            />
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-1 gap-4">
              {variants && variants?.length > 0 && (
                variants.map((variant, index) => {
                  const variantImages = variant.media || [];
                  const currentImageIndex = variantImageIndices[index] || 0;
                  const hasMultipleImages = variantImages.length > 1;

                  const handlePreviousImage = (e) => {
                    e.stopPropagation();
                    setVariantImageIndices(prev => ({
                      ...prev,
                      [index]: currentImageIndex > 0 ? currentImageIndex - 1 : variantImages.length - 1
                    }));
                  };
                  const handleNextImage = (e) => {
                    e.stopPropagation();
                    setVariantImageIndices(prev => ({
                      ...prev,
                      [index]: currentImageIndex < variantImages.length - 1 ? currentImageIndex + 1 : 0
                    }));
                  };

                  return (
                    <div key={index}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                      {variantImages.length > 0 && (
                        <div className="relative mb-3">
                          <img
                            className="w-full h-48 object-cover rounded-md"
                            src={variantImages[currentImageIndex]?.path}
                            alt={variant?.name || "Variant"}
                          />
                          {hasMultipleImages && (
                            <>
                              <button
                                type="button"
                                onClick={handlePreviousImage}
                                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-colors"
                                aria-label="Previous image"
                              >
                                <ArrowLeftIcon className="h-5 w-5" />
                              </button>
                              <button
                                type="button"
                                onClick={handleNextImage}
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-colors"
                                aria-label="Next image"
                              >
                                <ArrowRightIcon className="h-5 w-5" />
                              </button>
                            </>
                          )}
                        </div>
                      )}
                      <Link href={variant?.url ? variant?.url : "#"}>
                      <div className="text-lg font-semibold mb-2">
                        {variant.name}
                      </div>
                      {variant?.price && (
                        <p className="text-xl font-bold text-cyan-600">
                          {variant.price}
                        </p>
                      )}
                      {product?.price && (
                        <p className="text-xl font-bold text-cyan-600">
                          {product?.currency_symbol}{product?.price}
                        </p>
                      )}
                      {variant?.description && (
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2" dangerouslySetInnerHTML={{
                          __html: variant?.description,
                        }}>
                        </p>
                      )}
                      </Link>
                    </div>
                  );
              }))}
            </div>
          </div>
        </div>
      </div>

      <div
        className={`fixed top-0 h-full bg-black opacity-50 w-full z-40 hidden ${purchaseOpen ? "sm:block" : ""
          }`}
      ></div>
      <div
        className={`fixed w-full sm:w-[350px] z-50 h-full top-0 right-0 border-l bg-white shadow-lg p-4 transition-all duration-500 ${purchaseOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        <XMarkIcon
          className="size-5 ml-auto cursor-pointer"
          onClick={() => {
            setPurchaseOpen(false);
            setPurchaseSuccess(false);
          }}
        />

        {purchaseSuccess ? (
          <div className="flex flex-col items-center justify-center h-[calc(100%-40px)]">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 mb-6">
              <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 text-center">
              {getTranslation("purchase_success_title", "Purchase Complete!")}
            </h3>
            <p className="mt-3 text-sm text-gray-600 text-center px-4">
              {getTranslation(
                "purchase_success_message",
                "Thank you for your order."
              )}
            </p>
            <button
              onClick={() => {
                setPurchaseOpen(false);
                setPurchaseSuccess(false);
              }}
              className="mt-8 w-full rounded-lg bg-cyan-600 px-4 py-3 text-sm font-semibold text-white shadow hover:bg-cyan-700 transition-colors"
            >
              {getTranslation("purchase_success_button", "Continue Shopping")}
            </button>
          </div>
        ) : (
          <>
            <p className="">Your purchase:</p>

            <p className="mt font-medium ">
              {entry?.product_name ? entry?.product_name : product?.name}
            </p>

            <div className="flex mt-10">
              <div className="w-5/12">
                <p>Price:</p>
                <p className="mt-3">Total:</p>
              </div>
              {product?.price && (
                <div className="w-7/12">
                  <p>${entry?.price ? entry?.price : product?.price}</p>
                  <p className="mt-3">
                    ${entry?.price ? entry?.price : product?.price}
                  </p>
                </div>
              )}
            </div>

            <form className="mt-6 flex w-full">
              <input
                className="rounded-lg w-full py-2 px-4 max-md:p-1 border mr-0 text-gray-800 border-gray-200 bg-white"
                placeholder="Email"
                value={inputValue}
                onChange={handleChange}
              />
            </form>

            <div className="flex mt-3">
              <input type="checkbox" checked />
              <label className="ml-2">Use card on file</label>
            </div>

            <div className="mt-2 bg-[#efefef] py-2 px-4 flex items-center gap-4">
              <img
                className="h-8"
                src="https://images.contentstack.io/v3/assets/blt678db9efc83edd2d/blt237b95a3377390c0/681bec8e9b0925fa46df2048/amex-svgrepo-com.svg"
                alt="Credit card"
              />
              <p>...5309</p>
            </div>

            <button
              onClick={() => buyClick(entry?.price ? entry?.price : product?.price)}
              className="bg-black text-white rounded-lg py-4 w-full mt-10 font-semibold tracking-wide border-black border-2 hover:bg-white hover:text-black"
            >
              Complete Purchase
            </button>

            <button className="rounded-lg border-2 border-[#5a30f4] w-full mt-4 flex justify-center p-2">
              <img
                className="h-10"
                src="https://images.contentstack.io/v3/assets/blt678db9efc83edd2d/bltbc9d297783dbfffc/681e1c146b233bd9775c08c4/spay.png"
                alt="Shop Pay"
              />
            </button>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
