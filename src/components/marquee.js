import { cslp } from "@/lib/cstack";

export default function Marquee({ content }) {
    return (
        <div className="w-full inline-flex flex-nowrap overflow-hidden mt-10" {...content.$?.images}>
            {content?.images?.length === 0 &&
                <div className="my-24 w-full visual-builder__empty-block-parent"  >
                </div>
            }
            <ul className="flex items-center justify-center md:justify-start [&_li]:mx-4 [&_img]:max-w-none animate-infinite-scroll">
                {(content?.images && content?.images?.length > 0) && (
                    content?.images?.map((image, index) => (
                        <li key={index} {...cslp(content, 'images__', index)}>
                            {!image.image?.url &&
                                <div className="h-[200px] w-[200px] bg-gray-400 flex items-center justify-center" {...image?.$?.image}>
                                    <svg className="w-10 h-10 text-gray-200 dark:text-gray-600" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 18">
                                        <path d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z" />
                                    </svg>
                                </div>
                            }
                            {image?.image?.url &&
                                <img className="w-64 object-scale-down" src={image?.image?.url} />
                            }
                        </li>
                )))}
            </ul>
            <ul className="flex items-center justify-center md:justify-start [&_li]:mx-4 [&_img]:max-w-none animate-infinite-scroll" aria-hidden="true">
                {(content?.images && content?.images?.length > 0) && (
                    content?.images?.map((image, index) => (
                        <li key={index} {...cslp(content, 'images__', index)}>
                            {!image.image?.url &&
                                <div className="h-[200px] w-[200px] bg-gray-400 flex items-center justify-center" {...image?.$?.image}>
                                    <svg className="w-10 h-10 text-gray-200 dark:text-gray-600" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 18">
                                        <path d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z" />
                                    </svg>
                                </div>
                            }
                            {image?.image?.url &&
                                <img className="w-64 object-scale-down" src={image?.image?.url} {...image?.$?.image} />
                            }
                        </li>
                )))}
            </ul>
        </div>
    )
}