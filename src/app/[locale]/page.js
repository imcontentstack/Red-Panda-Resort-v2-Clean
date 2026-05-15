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
import LyticsHomepageSync from "@/components/LyticsHomepageSync";
import { useParams } from "next/navigation";
import { useDataContext } from "@/context/data.context";
import { homepageReferences, pagesReferences } from "@/helpers/referencePaths";
import { jsonToHTML } from "@contentstack/utils";
import { inLivePreview } from "@/utils/lp";

export default function Home() {
  const [entry, setEntry] = useState({});
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const params = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const initialData = useDataContext();

  const getContent = async () => {
    try {
      const homepageEntry = await ContentstackClient.getElementByTypeWithRefs(
        "homepage",
        params.locale,
        homepageReferences,
        initialData
      );

      const first = homepageEntry?.[0];

      if (first) {
        jsonToHTML({
          entry: first,
          paths: ["modular_blocks.category_banner.description"],
        });
      }

      let campaignCandidates = [];

      try {
        const campaignPages = await ContentstackClient.getElementByTypeWithRefs(
          "page",
          params.locale,
          pagesReferences,
          null
        );

        console.log("RAW campaign pages", campaignPages);

        campaignCandidates =
          campaignPages
            ?.map((page) => {
              const campaign =
                page?.campaigns_section || page?.campaign_section || null;

              if (!campaign) return null;

              const campaignHeroBlock = page?.modular_blocks?.find(
                (block) =>
                  block?.configurable_hero ||
                  block?.hero ||
                  block?.full_page_hero
              );

              const campaignHero =
                campaignHeroBlock?.configurable_hero ||
                campaignHeroBlock?.hero ||
                campaignHeroBlock?.full_page_hero ||
                null;

              return {
                ...campaign,
                page_title: page?.title,
                page_url: page?.url,
                page_uid: page?.uid,
                hero: campaignHero,
              };
            })
            ?.filter((campaign) => campaign?.campaign_key) || [];

        console.log(
          "Campaign candidates with hero",
          campaignCandidates.map((campaign) => ({
            key: campaign?.campaign_key,
            hasHero: Boolean(campaign?.hero),
            heroKeys: campaign?.hero ? Object.keys(campaign.hero) : [],
            image:
              campaign?.hero?.image?.url ||
              campaign?.hero?.image_options?.image?.url,
          }))
        );
      } catch (campaignError) {
        console.warn("Campaign page fetch failed:", campaignError);
        campaignCandidates = [];
      }

      console.log("Campaign candidates for homepage", campaignCandidates);

      setCampaigns(campaignCandidates);
      setEntry(first ?? {});
    } catch (error) {
      console.error("Homepage content fetch failed:", error);
      setEntry({});
      setCampaigns([]);
    } finally {
      setIsLoading(false);
    }
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
      ((Array.isArray(modalData.modular_blocks) &&
        modalData.modular_blocks.length > 0) ||
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

  if (isLoading) return null;

  return (
    <>
      <div
        data-pageref={entry?.uid}
        data-contenttype="homepage"
        data-locale={params.locale}
      >
        <LyticsHomepageSync />

        <Hero
          content={entry?.hero}
          campaigns={campaigns}
          locale={params?.locale}
          withHeader={true}
          cslp={entry?.$}
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
                <RecommendationsBanner
                  key={index}
                  content={block.recommendations_banner}
                />
              )}
              {block.hasOwnProperty("data_and_insights_form_builder") && (
                <UserProfileForm
                  key={index}
                  content={block.data_and_insights_form_builder}
                />
              )}
              {block.hasOwnProperty("article_banner") && (
                <ArticleBanner key={index} content={block.article_banner} />
              )}
            </div>
          ))}
        </div>

        <Footer />
        <Modal
          content={entry?.modal}
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </div>
    </>
  );
}