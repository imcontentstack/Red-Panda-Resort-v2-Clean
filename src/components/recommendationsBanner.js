import { useRecommendations } from "@/context/lyticsTracking";
import Link from "next/link";

export default function RecommendationsBanner({ content }) {
    const recommendations = useRecommendations();
    console.log("contentstack q's",recommendations)
    console.log(content);
    
    return (
        <div className="max-w-8xl mx-auto px-8 my-24">
            <p className="text-center text-3xl" {...content?.$?.heading}>{content?.headline}</p>
            <div className="mx-auto mt-16 grid max-w-3xl grid-cols-1 gap-x-8 gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
                {(recommendations && recommendations?.length > 0) && (
                    recommendations?.map((article, index) => (
                    <article
                        key={article?.uid}
                        className="flex flex-col items-start justify-between"
                    >
                        <Link href={((article?.url && article?.url?.length > 0) ? article.url : "#")}>
                        {article?.banner_image && (
                            <div className="relative w-full">
                                <img
                                    src={article.banner_image?.url}
                                    alt=""
                                    className="aspect-[16/9] w-full bg-gray-100 object-cover sm:aspect-[2/1] lg:aspect-[3/2]"
                                    
                                />

                                <div className="absolute inset-0" />
                            </div>
                        )}
                        </Link>
                        <div className="max-w-xl">
                            <div className="mt-8 flex items-center gap-x-4 text-xs">
                                <time className="text-gray-500">Editorial Staff</time>

                                {(article?.taxonomies && article?.taxonomies?.length > 0) && (
                                    article?.taxonomies?.map((tax, tdx) => {
                                        return (
                                            <Link
                                                href={"/articles/categories/" + (tax?.term_uid ? tax?.term_uid : "#")}
                                                key={tdx + tax?.term_uid}
                                                className="relative z-10 bg-gray-50 px-3 py-1.5 font-medium text-gray-600 hover:bg-gray-100 capitalize"
                                            >
                                                {tax?.term_uid}
                                            </Link>
                                        );
                                }))}
                            </div>
                            <div className="group relative">
                                {article?.title && (
                                    <h3 className="mt-3 text-lg font-paragraph font-medium leading-6 text-gray-900 group-hover:text-gray-600">
                                    <Link href={((article && article?.url) ? article?.url : "#")}>
                                       
                                        {article?.title}
                                    </Link>
                                </h3>
                                )}
                                {article?.teaser && (
                                <p className="mt-5 line-clamp-3 text-sm font-light font-paragraph tracking-wide leading-6 text-neutral-700 whitespace-break-spaces">
                                    {article?.teaser}
                                </p>
                                )
                                }
                            </div>
                        </div>
                    </article>
                ))
)}
            </div>
        </div>
    )
}