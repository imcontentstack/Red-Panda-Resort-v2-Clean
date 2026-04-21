import { cslp } from "@/lib/cstack";
import Link from "next/link";

export default function Cards({ content }) {
    

    return (
            <div className="py-24  justify-center " style={{ backgroundColor: content?.background_color?.hex }} {...content?.$?.background_color}>
                {(content?.card && content?.card?.length === 0) &&
                    <div className="h-[800px] visual-builder__empty-block-parent" {...content?.$?.card} >
                    </div>
                }
                {(content?.card && content?.card?.length > 0) &&
                    <div className="lg:flex lg:flex-row justify-center" {...content.$?.card}>
                        {content?.card?.map((data, index) => (
                            <div key={index} className="md:w-full lg:w-[550px] m-5 flex flex-col border border-gray-200 shadow " {...cslp(content, 'card__', index)} style={{ backgroundColor: data?.card_background_color?.hex }} >
                                {data?.image?.url &&

                                    <div className="bg-cover bg-bottom" {...data?.$?.image}>
                                        <img src={data?.image?.url}></img>
                                    </div>
                                }
                                {!data?.image?.url &&
                                    <div className="h-[300px] w-full bg-gray-400 flex items-center justify-center" {...data?.$?.image}>
                                        <svg className="w-10 h-10 text-gray-200 dark:text-gray-600" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 18">
                                            <path d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z" />
                                        </svg>
                                    </div>
                                }
                                <div className="p-5">
                                  
                                        <h2 className="mt-8 text-center text-neutral-700" {...data?.$?.headline}>
                                            {data?.headline}
                                        </h2>
                                   
                                    <p className="m-5 mt-8 text-left whitespace-break-spaces leading-8 text-neutral-700" {...data?.$?.body}>
                                        {data?.body}
                                    </p>
                                </div>
                                <div className="flex flex-col items-center mt-auto mb-12">
                                {data?.page && (
                                    <Link href={(data?.page?.length > 0 && data?.page?.[0]?.url) ? data?.page?.[0]?.url : '/'}>
                                    <button className="rounded-md button px-8 py-4 text-md tracking-widest uppercase font-bold text-cyan-600 shadow-sm ring-2 ring-inset ring-cyan-600 hover:text-white hover:bg-cyan-600" {...data?.$?.button_text}>
                                        {data?.button_text}
                                    </button>
                                </Link>
                                )}
                                </div>
                            </div>
                        ))}
                    </div>
                }
            </div>
    );
}
