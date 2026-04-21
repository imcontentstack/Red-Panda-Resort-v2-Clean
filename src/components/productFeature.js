import { ArrowRightIcon } from "@heroicons/react/20/solid";
import Link from "next/link";

export default function ProductFeature({ content }){
    if(content?.products && Array.isArray(content?.products) && content?.products?.length > 0) {
        content.products = content?.products?.[0];
    }
    
    return(
        <div className="max-w-8xl mx-auto px-8 py-24">
            <h2 className="normal-case" {...content?.$?.title}>{content?.title}</h2>
            <p {...content?.$?.description}>{content?.description}</p>

            {content?.products?.data?.length === 0 &&
                <div className="h-[800px] visual-builder__empty-block-parent" {...content?.$?.products} >
                </div>
            }
            {(content?.products?.items && content?.products?.items?.length > 0) &&
                <div className="grid grid-cols-1 lg:grid-cols-4 md:grid-cols-3 mt-8 gap-6" {...content?.$?.products}>
                    {content?.products?.items?.map((item, index) => (
                        <Link href={'/pdp/' + (item?.url ? item?.url : "#")} key={index} >
                            <img className={(content?.large_cards ? "h-[600px] " : "h-[300px] ") + " object-cover object-center w-full"} src={item?.image} />
                            <p className="mt-5">{item?.name}</p>
                            <span>{item.price && <div className="mb-2"> {item.currency_symbol} {parseFloat(item.price).toFixed(2)}</div>}</span>
                        </Link>
                    ))}
                </div>
            }

            {content?.plp && (
                <Link href={(content?.plp?.length > 0 && content?.plp?.[0]?.url) ? content?.plp?.[0]?.url : "#"} className="flex mt-5 items-center text-cyan-600 hover:text-[#D1A261]" {...content?.$?.plp}>
                    <p href={(content?.plp?.length > 0 && content?.plp?.[0]?.url) ? content?.plp?.[0]?.url : "#"} className="inline-block" {...content?.$?.plp_link_text}>{content?.plp_link_text}</p>
                    <ArrowRightIcon className="h-5 w-5 ml-2" />
                </Link>
            )}
        </div>
    )
}