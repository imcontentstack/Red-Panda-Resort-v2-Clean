
export default function IconGrid({ content }){
    return(
        <div className="py-10 px-8">
            <div className={content?.items?.length === 0 ? "visual-builder__empty-block-parent" : ""} {...content?.$?.items}>
                {content?.items?.map((item, index) => (
                    <div className="flex mt-5" key={index}>
                        {!item.image?.url &&
                            <div className="h-[32px] w-[32px] bg-gray-400 flex items-center justify-center" {...item.$?.image}>
                            <svg className="w-10 h-10 text-gray-200 dark:text-gray-600" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 18">
                                <path d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z" />
                            </svg>
                        </div>
                        }
                        {item.image?.url &&
                            <img className="size-[32px]" src={item.image?.url} {...item.image?.$?.url} />
                        }
                        
                        <div className="ml-5">
                            <p className="font-medium text-[16px]" {...item.$?.headline}>{item.headline}</p>
                            <p className="text-[16px] mt-2 tracking-tight" {...item.$?.details}>{item.details}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}