"use client";
import { useState, useEffect } from "react";
import { ContentstackClient } from "@/lib/contentstack-client";
import Header from "@/components/header";
import styled, {StyleSheetManager} from "styled-components";
import isPropValid from "@emotion/is-prop-valid";
import Footer from "@/components/footer";
import { useRouter } from "next/navigation";
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { useParams } from "next/navigation";

const HoverAnchor = styled.a`
    &:hover {
        background: ${props => props.hover};
        color: ${props => props.hover_text};
    };
    background: ${props => props.bg};
    color: ${props => props.text}
`

HoverAnchor.defaultProps = {
    $hover: "#000000",
    $hover_text: "#FFFFFF",
    $bg: "#ABABAB",
    $text: "#000000"
}

export default function Page({ }) {
    const [search, setSearch] = useState("")
    const [entry, setEntry] = useState({});
    const [notFoundVisible, setNotFoundVisible] = useState(false)
    const router = useRouter();
    const params = useParams();

    const getContent = async () => {
        const entry = await ContentstackClient.getElementByUrlWithRefs(
            "faq",
            "/faq/" + params.title,
            params.locale,
            [
            ]
        );
        setEntry(Array.isArray(entry) ? entry[0] : entry);
    };

    useEffect(() => {
        ContentstackClient.onEntryChange(getContent);
    }, []);

    async function searchForAnswer() {
        const regex = new RegExp(search, 'i');
        let found = false;
        entry?.categories?.forEach((category) => {
            category?.faqs?.forEach((faq) => {
                if(regex.test(faq.question) || regex.test(faq.answer)){
                    if(!found)
                        router.push(params.title + "/section/" + category._metadata.uid + "/" + faq._metadata.uid);
                    found = true;
                    return;
                }
            })
        })
        if(!found)  
            setNotFoundVisible(true);
    }

    return (
        <div>
            <Header locale={params.locale} />

            <div
                className="w-full h-[500px] bg-cover bg-center flex items-center justify-center"
                style={{ backgroundImage: `url(https://images.contentstack.io/v3/assets/bltc991c0dda4197336/blt5d9c10062e0a93f7/67411c8348603bf3bb498fd9/chairs_on_beach.jpeg)` }}
            >
                <div>
                    <h3 className="text-white" {...entry?.$?.headline}>{entry?.headline}</h3>
                    <div className="flex relative">
                        <input
                            value={search}
                            onChange={(e) => {setSearch(e.target.value); setNotFoundVisible(false)}}
                            placeholder={entry?.placeholder}
                            className=" py-3 px-4 w-[600px] bg-white rounded-l"
                            {...entry?.$?.placeholder}
                        />
                        <ExclamationCircleIcon className={"absolute right-32 h-10 w-10 top-1 text-red-600 " + (notFoundVisible ? "" : "hidden")}/>
                        <button className="bg-black text-white py-3 px-8" onClick={() => searchForAnswer()} >{entry?.button_text}</button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mt-10 gap-8 text-center">
                {entry?.categories?.map((item, index) => (
                    <StyleSheetManager key={index} shouldForwardProp={isPropValid}>
                        <HoverAnchor  href={'/faqs/' + params.title + '/section/' + item._metadata.uid} bg={entry?.tile_color?.hex} hover={entry?.hover_color?.hex} hover_text={entry?.hover_text?.hex} text={entry?.text_color?.hex}
                            className={"flex  h-[115px] items-center justify-center px-4 whitespace-pre-wrap " + (entry?.rounded_tiles ? "rounded-lg " : " ") + (entry?.shadows ? "shadow-lg" : "")}
                        >
                            <p className="uppercase font-medium">{item.name}</p>
                        </HoverAnchor>
                    </StyleSheetManager>
                ))}
            </div>

            <Footer locale={params.locale} />
        </div>
    )
}