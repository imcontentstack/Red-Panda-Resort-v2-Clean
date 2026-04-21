"use client";
import { useState, useEffect } from "react";
import { ContentstackClient } from "@/lib/contentstack-client"
import Footer from "@/components/footer";
import Header from "@/components/header";
import PageHero from "@/components/pageHero";
import TextSection from "@/components/textSection";
import People from "@/components/people";
import Hero from "@/components/hero";
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
import ArticleBanner from "@/components/articleBanner";
import Modal from "@/components/modal";
import { useParams } from "next/navigation";
import { useDataContext } from "@/context/data.context";
import { pagesReferences } from "@/helpers/referencePaths";
import { jsonToHTML } from '@contentstack/utils';
import { inLivePreview } from '@/utils/lp';
import { useJstag } from "@/context/lyticsTracking";

export default function Page({ }) {
    const [entry, setEntry] = useState({});
    const [isKiosk, setIsKiosk] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const params = useParams();
    const jstag = useJstag();

    const initialData = useDataContext();

    const getContent = async () => {
        const result = await ContentstackClient.getElementByUrlWithRefs(
            "page",
            "/pages/" + params.title,
            params.locale,
            pagesReferences,
            initialData
        );

        const pageEntry = result?.[0];
        if (!pageEntry) {
            setEntry({});
            setIsLoading(false);
            return;
        }

        jsonToHTML({
            entry: pageEntry,
            paths: ['modular_blocks.category_banner.description']
        });

        setEntry(pageEntry);
        setIsLoading(false);
    };

    useEffect(() => {
        ContentstackClient.onEntryChange(getContent);
    }, []);

    useEffect(() => {
    const modalData = entry?.modal?.[0];
    const hasValidModal =
    modalData &&
    ((Array.isArray(modalData.modular_blocks) && modalData.modular_blocks.length > 0) ||
        Boolean(modalData.button_text));
    if (!isLoading && hasValidModal && !inLivePreview()) {
        const key = `page_modal_shown_${params.locale}_${params.title}`;
        const hasShownModal = localStorage.getItem(key);

        if (!hasShownModal) {
        const timer = setTimeout(() => {
            setIsModalOpen(true);
            localStorage.setItem(key, "true");
        }, 500);

        return () => clearTimeout(timer);
        }
    }
    }, [isLoading, entry?.modal, params.locale, params.title]);

    useEffect(() => {
        if(entry?.taxonomies && entry?.taxonomies?.length > 0){
            entry?.taxonomies.map((tax) => {
                console.log(`sending ${tax?.term_uid} to data and insights`);
                jstag?.send({taxonomy: tax.term_uid})
            })
        }
    }, [entry])

    console.log(entry)
    return (
        <div >
            {entry?._applied_variants?.title !== "cs76fdee0e83c5c333" &&
                <Header locale={params.locale} />
            }
            <div className={entry?.modular_blocks?.length === 0 ? "visual-builder__empty-block-parent" : ""} {...entry?.$?.modular_blocks}>
                {entry?.modular_blocks?.map((block, index) => (
                    <div key={index} {...entry?.$?.['modular_blocks__' + index]}>
                        {block.hasOwnProperty("hero") &&
                            <PageHero key={index} content={block.hero} {...entry?.$?.['modular_blocks__' + index]}/>
                        }
                        {block.hasOwnProperty("people") &&
                            <People key={index} content={block.people} isKiosk={entry?._applied_variants?.title === "cs76fdee0e83c5c333"} />
                        }
                        {block.hasOwnProperty("text_block") &&
                            <TextSection key={index} content={block.text_block} />
                        }
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
                        {block.hasOwnProperty("hero_banner") &&
                            <Hero key={index} content={block?.hero_banner?.hero} locale={params.locale} withHeader={false} />
                        }
                        {block.hasOwnProperty("image_grid") &&
                            <ImageGrid key={index} content={block.image_grid} isKiosk={entry?._applied_variants?.title === "cs76fdee0e83c5c333"} {...block.$?.image_grid}/>
                        }
                        {block.hasOwnProperty("articles") &&
                            <ArticleBanner key={index} content={block.articles} />
                        }
                        {block.hasOwnProperty("tabs") &&
                            <Tabs key={index} content={block.tabs} />
                        }
                        {block.hasOwnProperty("marquee") &&
                            <Marquee key={index} content={block.marquee} />
                        }
                        {block.hasOwnProperty("form_builder") &&
                            <FormBuilder key={index} content={block.form_builder} />
                        }
                        {block.hasOwnProperty("recommendations_banner") && (
                            <RecommendationsBanner key={index} content={block.recommendations_banner} />
                        )}
                        {block.hasOwnProperty("article_banner") && (
                            <ArticleBanner key={index} content={block.article_banner} />
                         )}
                    </div>
                ))}

            </div>

            {entry?._applied_variants?.title !== "cs76fdee0e83c5c333" &&
                <Footer />
            }

            <Modal content={entry?.modal} open={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
}
