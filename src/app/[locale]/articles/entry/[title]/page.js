"use client";
import { useState, useEffect } from "react";
import { ContentstackClient } from "@/lib/contentstack-client";
import Footer from "@/components/footer";
import Header from "@/components/header";
import { jsonToHtml } from "@contentstack/json-rte-serializer";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationDot, faUser, faCalendar } from "@awesome.me/kit-610837e1f9/icons/classic/light";
import { useParams } from "next/navigation";
import { useDataContext } from "@/context/data.context";
// import { useJstag } from "@/context/lyticsTracking";

export default function Page({ }) {
    const [entry, setEntry] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const params = useParams();
    const initialData = useDataContext();
    //const jstag = useJstag();

    const getContent = async () => {
        const entry = await ContentstackClient.getElementByUrl(
            "article",
            "/articles/entry/" + params.title,
            params.locale,
            initialData
        );
        setEntry(entry?.[0] ?? {});
        setIsLoading(false);
        //jstag.send({"taxonomy" : entry?.taxonomies[0]?.term_uid});
    };

    useEffect(() => {
        ContentstackClient.onEntryChange(getContent);
    }, []);

    if (isLoading) 
        return;

    // video helpers
    const videoFile = entry?.video_options?.video?.url;
    const videoControls = entry?.video_options?.video_controls;
    const videoLoop = entry?.video_options?.in_loop;

    return (
        <div>
            <Header locale={params.locale} />

            <div className="bg-white px-6 pt-8 pb-32 lg:px-8">
                <div className="mx-auto max-w-3xl text-base leading-7 text-neutral-700">
                    <p className="mb-6 text-sm font-semibold leading-7 text-cyan-600 uppercase">
                        <Link href="/en/articles">ARTICLES</Link> / {entry?.headline}
                    </p>
                    {/* show video if available, otherwise image */}
                    {videoFile ? (
                        <video
                            className="mb-10 w-full"
                            controls={videoControls === "Show Controls"}
                            autoPlay={videoControls === "Autoplay"}
                            muted={videoControls === "Autoplay"}
                            loop={
                                videoControls === "Autoplay"
                                    ? true
                                    : videoControls === "Show Controls"
                                    ? videoLoop
                                    : false
                            }
                        >
                            <source src={videoFile} />
                        </video>
                    ) : entry?.banner_image?.url ? (
                        <img src={entry?.banner_image?.url} className="mb-10" {...entry?.banner_image?.$?.url}></img>
                    ) : (
                        <div className="h-[300px] w-full bg-gray-400 flex items-center justify-center" {...entry?.$?.banner_image}>
                            <svg className="w-10 h-10 text-gray-200 dark:text-gray-600" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 18">
                                <path d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z" />
                            </svg>
                        </div>
                    )}

                    <h1 className="mt-5 text-4xl font-medium uppercase tracking-wider  sm:text-5xl text-neutral-700" {...entry?.$?.headline}>
                        {entry?.headline}
                    </h1>
                    <p className="mt-6 font-paragraph font-light text-md text-left whitespace-pre-wrap tracking-wide leading-8 text-neutral-700 italic" {...entry?.$?.teaser}>
                        {entry?.teaser}
                    </p>
                    {entry?.isevent && <>
                        <div className="flex items-center mt-6 justify-between">
                            {
                                entry?.event_details?.event_date ? 
                                    <div className="flex items-center gap-x-2" {...entry?.event_details?.$?.event_date}>
                                        <FontAwesomeIcon icon={faCalendar} className="text-md text-neutral-700" />
                                        <span className="font-paragraph font-light text-md text-left whitespace-pre-wrap tracking-wide leading-8 text-neutral-700" >
                                            {new Date(entry?.event_details?.event_date).toLocaleDateString(params.locale, { year: 'numeric', month: 'long', day: 'numeric' })} - {new Date(entry?.event_details?.event_date).toLocaleTimeString(params.locale, { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div> 
                                : null
                            }
                            {
                                entry?.event_details?.event_type ?
                                    <div className="flex items-center gap-x-2" {...entry?.event_details?.$?.event_type}>
                                        <FontAwesomeIcon icon={faUser} className="text-md text-neutral-700" />
                                        <span className="font-paragraph font-light text-md text-left whitespace-pre-wrap tracking-wide leading-8 text-neutral-700 capitalize" >
                                            {entry?.event_details?.event_type?.replace(/-/g, ' ')}
                                        </span>
                                    </div> 
                                : null
                            }
                        </div>
                        {entry?.event_details?.venue && <div className="flex items-center gap-x-2 mt-2" {...entry?.event_details?.$?.venue}>
                            <FontAwesomeIcon icon={faLocationDot} className="text-md text-neutral-700" />
                            <span className="font-paragraph font-light text-md text-left whitespace-pre-wrap tracking-wide leading-8 text-neutral-700 capitalize" >
                                {entry?.event_details?.venue}
                            </span>
                        </div>}
                    </>}
                    
                    {entry?.article_body &&
                        <div>
                            {entry?.article_body?.children?.length === 1 && entry?.article_body?.children?.[0]?.children?.[0]?.text === "" &&
                                <div className="mt-10 max-w-3xl article" {...entry?.$?.article_body}>Article body</div>
                            }
                            {entry?.article_body &&
                                <div className="mt-10 max-w-3xl whitespace-break-spaces article [&_a]:text-blue-500" dangerouslySetInnerHTML={{ __html: jsonToHtml(entry?.article_body) }} {...entry?.$?.article_body}></div>
                            }
                        </div>
                    }
                </div>
            </div>

            <Footer />
        </div>
    );

}
