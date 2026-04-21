"use client";
import { useState, useEffect } from "react";
import { ContentstackClient } from "@/lib/contentstack-client"
import Header from "@/components/header";
import Footer from "@/components/footer";
import Link from "next/link";

export default function FaqSection({ params }){
    const [entry, setEntry] = useState({});
    const [category, setCategory] = useState({});

    const getContent = async () => {
        const raw = await ContentstackClient.getElementByUrlWithRefs(
            "faq",
            "/faq/" + params.title,
            params.locale,
            [
            ]
        );
        const entry = Array.isArray(raw) ? raw[0] : raw;
       
        const cat = entry?.categories?.find(c => c._metadata.uid === params.id)
        setCategory(cat);
        const q = cat?.faqs?.find((q) => q._metadata.uid === params.qid);
        setEntry(q);
    };

    useEffect(() => {
        ContentstackClient.onEntryChange(getContent);
    }, []);

    return(
        <div>
            <Header locale={params.locale} />
            
            <div className="max-w-7xl mx-auto px-8 mt-10 mb-24">
                <div className="flex text-sm">
                    <Link href={"/faqs/" + params.title} className="">Red Panda Maldives</Link>
                    <p className="mx-2">&gt;</p>
                    <Link href="#">{category?.name}</Link>
                </div>

                <div className="flex mt-10">
                    <div className="w-full pr-10">
                        <p className="text-3xl font-medium">{entry?.question}</p>
                        <div
                            className={"mt-16 font-extralight text-base whitespace-pre-wrap [&_ul]:list-disc tracking-wide " }
                            dangerouslySetInnerHTML={{
                                __html: entry?.answer
                            }}
                        ></div>
                    </div>
                    <div className="max-w-[450px]">
                        <p className="text-2xl mb-5 font-semibold">{category?.name}</p>
                        {category?.faqs?.map((item, index) => (
                            <div key={index} className="flex">
                                <div className="w-0 h-0 mr-5 mt-2 border-t-[6px] border-t-transparent border-l-[9px] border-l-black border-b-[6px] border-b-transparent" />
                                <Link href={"/faqs/" + params.title + '/section/' + params.id + "/" + item._metadata?.uid} className="text-base leading-7 font-light">{item.question}</Link>
                            </div>
                        ))}
                    </div>
                </div>
                
            </div>

            <Footer locale={params.locale} />
        </div>
    )
}