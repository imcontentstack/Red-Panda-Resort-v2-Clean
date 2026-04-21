"use client";
import { useState, useEffect } from "react";
import { ContentstackClient } from "@/lib/contentstack-client";
import Header from "@/components/header";
import Footer from "@/components/footer";
import Link from "next/link";

export default function FaqSection({ params }){
    const [entry, setEntry] = useState({});

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
        setEntry(cat);
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
                    <Link href="#">{entry?.name}</Link>
                </div>

                <h3 className="text-center mt-24">{entry?.name}</h3>

                <div className="grid grid-cols-3 mt-10 gap-x-8 gap-y-5">
                    {entry?.faqs?.map((item, index) => (
                        <div key={index} className="flex items-top">
                            <div className="w-0 h-0 mr-5 mt-2 border-t-[6px] border-t-transparent border-l-[9px] border-l-black border-b-[6px] border-b-transparent" />
                            <Link href={"/faqs/" + params.title + '/section/' + params.id + "/" + item._metadata?.uid}>{item.question}</Link>
                        </div>
                    ))}
                </div>
            </div>

            <Footer locale={params.locale} />
        </div>
    )
}