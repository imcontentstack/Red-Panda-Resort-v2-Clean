import StarRating from "@/helpers/StarRating";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Reviews({ content }) {
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        if (content?.testimonials && content?.testimonials?.length > 0){
            const timer = setTimeout(() => {
            activeIndex === (content?.testimonials?.[0]?.reviews?.length ?? 0) - 1 ? setActiveIndex(0) : setActiveIndex(activeIndex + 1);
        }, 10000);
        return () => {
            clearTimeout(timer);
        }}
    }, [activeIndex])

    if (content == null) {
        return <></>;
    }

    return (
        <div className="mx-auto px-8 bg-[#F0F9FF] py-24 font-paragraph">
            <div className="max-w-8xl flex items-center gap-4 mx-auto">
                {(content?.testimonials && content?.testimonials?.length === 0)&&
                    <div className="h-[400px] visual-builder__empty-block-parent mx-auto" {...content?.$?.testimonials}></div>
                }
                {(content?.testimonials && content?.testimonials?.length > 0) &&
                    <div className="max-w-8xl flex items-center gap-4 mx-auto">
                        <div className="w-1/2 flex">
                            <div className="mx-auto max-w-[400px]">
                                <h1 className="text-[#D1A261]" {...content?.testimonials?.[0]?.$?.headline}>{content?.testimonials?.[0]?.headline}</h1>
                                <p className="text-sm" {...content?.testimonials?.[0]?.$?.body}>{content?.testimonials?.[0]?.body}</p>
                                <div className="border-b border-[#D1A261] w-48 my-4 -ml-6"></div>
                                {(content?.testimonials?.[0]?.ratings && content?.testimonials?.[0]?.ratings?.length > 0) && (
                                    content?.testimonials?.[0]?.ratings?.map((rating, index) => (
                                        <div key={index} className="flex">
                                            <StarRating rating={rating.star_rating} color={"#D1A261"} size={17} {...rating?.$?.star_rating} />
                                            <p className="uppercase text-sm font-normal ml-1 mb-2" {...rating?.$?.category}>{rating?.category}</p>
                                        </div>
                                )))}
                            </div>
                        </div>
                        <div className="w-1/3 relative">
                            <p className="mb-5 text-sm font-normal uppercase w-fit" {...content?.testimonials?.[0]?.$?.review_title}>{content?.testimonials?.[0]?.review_title}</p>
                            <Image
                                src="https://images.contentstack.io/v3/assets/blt48306f59988eafb6/blt4e9af4e67c3d6bca/66521f6d76a5b5287c31ed72/iconmonstr-quote-1.svg"
                                width={72}
                                height={72}
                                alt=""
                                className="opacity-[.08] absolute top-3 -left-6"
                            />
                            {content?.testimonials?.[0]?.reviews?.map((review, index) => (
                                <div key={index} className={`${activeIndex === index ? "block transition-opacity transistion-all duration-1000 ease-in-out animate-fadeIn" : "hidden"}`}>
                                    <p className="line-clamp-5" dangerouslySetInnerHTML={{ __html: review?.review?.[0]?.review }} {...review?.review?.[0]?.$?.review}></p>
                                    <div className="border-b border-[#D1A261] w-48 mt-4 -ml-6"></div>
                                    <p className="mt-4 font-normal w-fit" {...review?.review?.[0]?.$?.reviewer_name}>{review?.review?.[0]?.reviewer_name}</p>
                                    <p className="text-sm uppercase w-fit" {...review?.review?.[0]?.$?.reviewer_city}>{review?.review?.[0]?.reviewer_city}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                }
            </div>
        </div>
    );
}
