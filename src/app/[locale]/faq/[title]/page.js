"use client";
import { useState, useEffect } from "react";
import { ContentstackClient } from "@/lib/contentstack-client";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { useParams } from "next/navigation";

export default function Page({ }) {
    const [entry, setEntry] = useState({});
    const [expandedId, setExpendedId] = useState("")
    const params = useParams();

    const getContent = async () => {
        const entry = await ContentstackClient.getElementByUrl(
            "faq",
            "/faq/" + params.title,
            params.locale,
            // [
            //     'modular_blocks.hero_banner.hero_banner',
            //     'modular_blocks.articles.articles'
            // ]
        );
        setEntry(entry?.[0] ?? {});
    };

    useEffect(() => {
        ContentstackClient.onEntryChange(getContent);
    }, []);

    function questionClicked(id) {
        if (expandedId === id)
            setExpendedId("");
        else
            setExpendedId(id);
    }

    return (
        <div>
            <Header locale={params.locale} />

            <div
                className="w-full h-[500px] bg-cover bg-center flex items-center justify-center"
                style={{ backgroundImage: `url(https://images.contentstack.io/v3/assets/bltc991c0dda4197336/blt5d9c10062e0a93f7/67411c8348603bf3bb498fd9/chairs_on_beach.jpeg)` }}
            >
                <h2 className="text-white">Frequently asked questions</h2>
            </div>

            <div className="max-w-4xl mx-auto px-8">
                <div className="mt-16">
                    {entry?.categories?.map((item, index) => (
                        <div key={index} className="mt-5">
                            <h3 className="text-2xl">{item.name}</h3>

                            <div className="mt-2 mb-16">
                                {item.faqs?.map((faq, fIdx) => (
                                    <div key={fIdx} className="border-b py-4 px-4 flex justify-between cursor-pointer " onClick={() => questionClicked(faq._metadata.uid)}>
                                        <div className="">
                                            <p className={(expandedId === faq._metadata.uid ? "font-medium" : "")}>{faq.question}</p>
                                            <div
                                                className={"mt-6 font-extralight text-base whitespace-pre-wrap [&_ul]:list-disc tracking-wide " + (expandedId === faq._metadata.uid ? "" : "hidden")}
                                                dangerouslySetInnerHTML={{
                                                    __html: faq.answer
                                                }}
                                            ></div>
                                        </div>
                                        <ChevronDownIcon className={"h-5 w-5 transition-transform duration-300 " + (expandedId === faq._metadata.uid ? "rotate-180" : "")} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <Footer locale={params.locale} />
        </div>
    )
}