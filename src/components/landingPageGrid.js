
export default function LandingPageGrid({ content, isKiosk }) {
    return (
        <div className="max-w-8xl mx-auto px-8 my-24 pb-24" {...content?.$}>
            <div className={" " + (isKiosk ? "hidden" : "")}>
                {content?.images?.length === 0 &&
                    <div className="h-[800px] visual-builder__empty-block-parent" {...content?.$?.images}>

                    </div>
                }
                {content?.images?.length === 1 &&
                    <div className="grid grid-cols-4 h-[800px] gap-6" {...content?.$?.images}>
                        {!content?.images?.[0]?.image?.url &&
                            <div className="col-span-4 row-span-2 h-full bg-gray-400 flex items-center justify-center" {...content?.images?.[0]?.$?.image} >
                                <svg className="w-10 h-10 text-gray-200 dark:text-gray-600" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 18">
                                    <path d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z" />
                                </svg>
                            </div>
                        }
                        {content?.images?.[0]?.image?.url &&
                            <div className="relative bg-center bg-cover group col-span-4 row-span-2 w-full"
                                style={{ backgroundImage: `url(${content?.images?.[0]?.image?.url})` }}
                                {...content?.images?.[0]?.$?.image}
                            >
                                <div className="w-full h-full flex bg-black opacity-0 group-hover:opacity-50 transition-opacity duration-300" ></div>
                                <p className="absolute bottom-5 left-5 text-white text-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" {...content?.images?.[0]?.$?.text}>{content?.images?.[0]?.text}</p>
                            </div>
                        }
                    </div>
                }
                {content?.images?.length === 2 &&
                    <div className="grid grid-cols-4 h-[800px] gap-6" {...content?.$?.images}>
                        {[0, 1].map((item, index) => {
                            if (!content?.images?.[index]?.image?.url)
                                return (
                                    <div key={index} className="col-span-2 row-span-2 bg-gray-400 flex items-center justify-center" {...content?.images?.[index]?.$?.image}>
                                        <svg className="w-10 h-10 text-gray-200 dark:text-gray-600" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 18">
                                            <path d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z" />
                                        </svg>
                                    </div>
                                )
                            else {
                                return (
                                    <div key={index} className="relative bg-center bg-cover group col-span-2 row-span-2"
                                        style={{ backgroundImage: `url(${content?.images?.[index]?.image?.url})` }}
                                        {...content?.images?.[index]?.$?.image}
                                    >
                                        <div className="w-full h-full flex bg-black opacity-0 group-hover:opacity-50 transition-opacity duration-300" ></div>
                                        <p className="absolute bottom-5 left-5 text-white text-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" {...content?.images?.[index]?.$?.text}>{content?.images?.[index]?.text}</p>
                                    </div>
                                )
                            }
                        })}

                    </div>
                }
                {content?.images?.length === 3 &&
                    <div className="grid grid-cols-4 h-[800px] gap-6" {...content?.$?.images}>
                        {[0, 1, 2].map((item, index) => {
                            if (!content?.images?.[index]?.image?.url) {
                                return (
                                    <div key={index} className={"bg-gray-400 flex items-center justify-center " +
                                        (index === 0 ? "col-span-2 row-span-2" : "col-span-2")
                                    }
                                        {...content?.images?.[index]?.$?.image}
                                    >
                                        <svg className="w-10 h-10 text-gray-200 dark:text-gray-600" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 18">
                                            <path d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z" />
                                        </svg>
                                    </div>
                                )
                            }
                            else {
                                return (
                                    <div key={index} className={"relative bg-center bg-cover group " +
                                        (index === 0 ? "col-span-2 row-span-2" : "col-span-2")}
                                        style={{ backgroundImage: `url(${content?.images?.[index]?.image?.url})` }}
                                        {...content?.images?.[index]?.$?.image}
                                    >
                                        <div className="w-full h-full flex bg-black opacity-0 group-hover:opacity-50 transition-opacity duration-300" ></div>
                                        <p className="absolute bottom-5 left-5 text-white text-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" {...content?.images?.[index]?.$?.text}>{content?.images?.[index]?.text}</p>
                                    </div>
                                )
                            }
                        })}
                    </div>
                }
                {content?.images?.length >= 4 &&
                    <div className="grid grid-cols-4 h-[800px] gap-6" {...content?.$?.images}>
                        {[0, 1, 2, 4].map((item, index) => {
                            if (!content?.images?.[index]?.image?.url) {
                                return (
                                    <div key={index} className={"bg-gray-400 flex items-center justify-center " +
                                        (index === 0 ? "col-span-2 row-span-2" :
                                            index === 3 ? "col-span-2" : "")
                                    }
                                        {...content?.images?.[index]?.$?.image}
                                    >
                                        <svg className="w-10 h-10 text-gray-200 dark:text-gray-600" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 18">
                                            <path d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z" />
                                        </svg>
                                    </div>
                                )
                            }
                            else {
                                return (
                                    <div key={index} className={"relative bg-center bg-cover group " +
                                        (index === 0 ? "col-span-2 row-span-2" :
                                            index === 3 ? "col-span-2" : "")}
                                        style={{ backgroundImage: `url(${content?.images[index]?.image?.url})` }}
                                        {...content?.images?.[index]?.$?.image}
                                    >
                                        <div className="w-full h-full flex bg-black opacity-0 group-hover:opacity-50 transition-opacity duration-300" ></div>
                                        <p className="absolute bottom-5 left-5 text-white text-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" {...content?.images?.[index]?.$?.text}>{content?.images?.[index]?.text}</p>
                                    </div>
                                )
                            }
                        })}
                    </div>
                }
            </div>

            <div className={"max-h-[800px] gap-6 " + (isKiosk ? "flex" : "hidden")}>
                {(content?.images && content?.images?.length > 0) && (
                    content?.images?.map((item, index) => (
                        <div key={index} className={"w-1/2 " + (index > 1 ? "hidden" : "")}>
                            <img className="object-cover object-center h-[800px] w-full" src={item?.image?.url} />
                            <button className="rounded-xl w-full py-8 bg-[#005D94] text-white text-2xl mt-5">{item?.text}</button>
                        </div>
                )))}
            </div>
        </div>
    )
}