"use client";
import { useState, useEffect } from "react";
import { ContentstackClient } from "@/lib/contentstack-client"
import PageHero from "@/components/pageHero";
import TextSection from "@/components/textSection";
import People from "@/components/people";
import Hero from "@/components/hero";
import LandingPageGrid from "@/components/landingPageGrid";
import ArticleBanner from "@/components/articleBanner";
import { useParams } from "next/navigation";


export default function Page({ }) {
    const [entry, setEntry] = useState({});
    const [isKiosk, setIsKiosk] = useState(false);
    const params = useParams();

    const getContent = async () => {
        const entry = await ContentstackClient.getElementByUrlWithRefs(
            "page",
            "/page/" + params.title,
            params.locale,
            [
                'modular_blocks.hero_banner.hero_banner',
                'modular_blocks.articles.articles'
            ]
        );
        setEntry(entry?.[0] ?? {});
    };

    useEffect(() => {
        ContentstackClient.onEntryChange(getContent);
    }, []);

    return (
        <div>
            {entry?.modular_blocks?.map((block, index) => {
                if (block.hasOwnProperty("hero")) {
                    return <PageHero key={index} content={block.hero} />;
                }
                else if (block.hasOwnProperty("people")) {
                    return <People key={index} content={block.people} isKiosk={true} />;
                }
                else if (block.hasOwnProperty("text_block")) {
                    return <TextSection key={index} content={block.text_block} />;
                }
                else if (block.hasOwnProperty("hero_banner")) {
                    return <Hero key={index} content={block?.hero_banner?.hero_banner} locale={params.locale} withHeader={false} />
                }
                else if (block.hasOwnProperty("image_grid")) {
                    return <LandingPageGrid key={index} content={block.image_grid} isKiosk={true}/>
                }
                else if (block.hasOwnProperty("articles")){
                    return <ArticleBanner key={index} content={block.articles} />
                }
            })}
        </div>
    );
}
