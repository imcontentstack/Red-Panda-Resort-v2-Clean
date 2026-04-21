"use client";
import { useState, useEffect } from "react";
import { ContentstackClient } from "@/lib/contentstack-client";
import Cards from "@/components/cards";
import Footer from "@/components/footer";
import HalfSquares from "@/components/halfSquares";
import Hero from "@/components/hero";
import ImageGrid from "@/components/imageGrid";
import Reviews from "@/components/reviews";
import TextBlock from "@/components/textBlock";
import ProductFeature from "@/components/productFeature";
import Tabs from "@/components/tabs";
import Marquee from "@/components/marquee";
import LeadCapture from "@/components/leadCapture";
import CategoryBanner from "@/components/categoryBanner";
import Agent from "@/components/agent";
import RecommendationsBanner from "@/components/recommendationsBanner";
import UserProfileForm from "@/components/userProfileForm";
import ArticleBanner from "@/components/articleBanner";
import Modal from "@/components/modal";
import { useParams } from "next/navigation";
import { useDataContext } from "@/context/data.context";
import { homepageReferences } from "@/helpers/referencePaths";
import { jsonToHTML } from '@contentstack/utils';
import { inLivePreview } from '@/utils/lp';

export default function Home({ }) {
  const [entry, setEntry] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const params = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const initialData = useDataContext();

  const getContent = async () => {
    const entry = await ContentstackClient.getElementByTypeWithRefs(
      "homepage",
      params.locale,
      homepageReferences,
      initialData
    );

    const first = entry?.[0];
    if (first) {
      jsonToHTML({
        entry: first,
        paths: ['modular_blocks.category_banner.description']
      });
    }

    setEntry(first ?? {});
    setIsLoading(false);
  };

  useEffect(() => {
    getContent();
    ContentstackClient.onEntryChange(() => {
      getContent();
    });
  }, []);

  useEffect(() => {
    const modalData = entry?.modal?.[0];
    const hasValidModal =
      modalData &&
      ((Array.isArray(modalData.modular_blocks) && modalData.modular_blocks.length > 0) ||
        Boolean(modalData.button_text));
    if (!isLoading && hasValidModal && !inLivePreview()) {
      const key = `homepage_modal_shown_${params.locale}`;
      const hasShownModal = localStorage.getItem(key);

      if (!hasShownModal) {
        const timer = setTimeout(() => {
          setIsModalOpen(true);
          localStorage.setItem(key, "true");
        }, 500);

        return () => clearTimeout(timer);
      }
    }
  }, [isLoading, entry?.modal, params.locale]);

  if (isLoading) return;

  return (
    <>
      <div
        data-pageref={entry?.uid}
        data-contenttype="homepage"
        data-locale={params.locale}
      >
        <Hero
          content={entry?.hero}
          locale={params.locale}
          withHeader={true}
          cslp={entry?.$?.hero}
        />
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
              {block.hasOwnProperty("text_block") && (
                <TextBlock key={index} content={block.text_block} />
              )}
              {block.hasOwnProperty("cards") && (
                <Cards key={index} content={block.cards} />
              )}
              {block.hasOwnProperty("image_grid") && (
                <ImageGrid key={index} content={block.image_grid} />
              )}
              {block.hasOwnProperty("review") && (
                <Reviews key={index} content={block.review} />
              )}
              {block.hasOwnProperty("text_and_image") && (
                <HalfSquares key={index} content={block.text_and_image} />
              )}
              {block.hasOwnProperty("product_banner") && (
                <ProductFeature key={index} content={block.product_banner} />
              )}
              {block.hasOwnProperty("category_banner") && (
                <CategoryBanner key={index} content={block.category_banner} />
              )}
              {block.hasOwnProperty("tabs") && (
                <Tabs key={index} content={block.tabs} />
              )}
              {block.hasOwnProperty("marquee") && (
                <Marquee key={index} content={block.marquee} />
              )}
              {block.hasOwnProperty("lead_capture") && (
                <LeadCapture key={index} content={block.lead_capture} />
              )}
              {block.hasOwnProperty("agent") && (
                  <Agent key={index} agentData={block.agent} />
              )}
              {block.hasOwnProperty("recommendations_banner") && (
                  <RecommendationsBanner key={index} content={block.recommendations_banner} />
              )}
              {block.hasOwnProperty("data_and_insights_form_builder") && (
                  <UserProfileForm key={index} content={block.data_and_insights_form_builder} />
              )}
              {block.hasOwnProperty("article_banner") && (
                  <ArticleBanner key={index} content={block.article_banner} />
              )}
            </div>
          ))}
        </div>

        <Footer />
        <Modal content={entry?.modal} open={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </div>
    </>
  );
}
