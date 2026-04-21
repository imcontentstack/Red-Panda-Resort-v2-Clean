import { cslp } from "@/lib/cstack";
import Link from "next/link";

export default function ArticleBanner({ content }) {
    return (
        <div className="max-w-8xl mx-auto px-8 my-32">
            <h3 className="text-center text-3xl" {...content?.$?.heading}>{content?.heading}</h3>
            {content?.articles?.length === 0 &&
                <div className="grid grid-cols-3 w-full gap-8 mt-16" {...content?.$?.articles}>
                    <div className="h-[292px]">
                        <div className="bg-gray-300 flex items-center justify-center h-full">
                            <svg className="w-10 h-10 text-gray-200 dark:text-gray-600" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 18">
                                <path d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z" />
                            </svg>
                        </div>
                    </div>
                    <div className="h-[292px]">
                        <div className="bg-gray-300 flex items-center justify-center h-full">
                            <svg className="w-10 h-10 text-gray-200 dark:text-gray-600" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 18">
                                <path d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z" />
                            </svg>
                        </div>
                    </div>
                    <div className="h-[292px]">
                        <div className="bg-gray-300 flex items-center justify-center h-full">
                            <svg className="w-10 h-10 text-gray-200 dark:text-gray-600" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 18">
                                <path d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z" />
                            </svg>
                        </div>
                    </div>
                </div>
            }
            <div className="mx-auto mt-16 grid max-w-3xl grid-cols-1 gap-x-8 gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3" {...content?.$?.articles}>
                {content?.articles?.map((article, index) => (
                    <article
                        key={article?.uid}
                        className="flex flex-col items-start "
                        {...cslp(content, 'articles__', index)}
                    >
                        <Link href={(article?.url ? article?.url : "#")}>
                            <div className="relative w-full" {...article.$?.banner_image}>
                                {article?.video_options?.video?.url ? (
                                  <>
                                    <video
                                      className="aspect-[16/9] w-full bg-gray-100 object-cover sm:aspect-[2/1] lg:aspect-[3/2]"
                                      preload="metadata"
                                      style={{ pointerEvents: 'none' }}
                                    >
                                      <source src={article?.video_options?.video?.url} />
                                    </video>
                                    <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                                      <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 84 84" xmlns="http://www.w3.org/2000/svg"><circle cx="42" cy="42" r="42" opacity="0.5"/><path d="M33 28L56 42L33 56V28Z"/></svg>
                                    </div>
                                  </>
                                ) : article?.banner_image?.url ? (
                                  <img
                                    src={article?.banner_image?.url}
                                    alt=""
                                    className="aspect-[16/9] w-full bg-gray-100 object-cover sm:aspect-[2/1] lg:aspect-[3/2]"
                                  />
                                ) : (
                                  <div className="aspect-[16/9] w-full bg-gray-300 flex items-center justify-center">
                                    <svg className="w-10 h-10 text-gray-200 dark:text-gray-600" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 18"><path d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z" /></svg>
                                  </div>
                                )}

                                <div className="absolute inset-0" />
                            </div>
                        </Link>
                        <div className="max-w-xl">
                            <div className="mt-4 flex items-center gap-x-4 text-xs">
                                <time className="text-gray-500">Editorial Staff</time>

                                {article?.taxonomies?.map((tax, tdx) => {
                                    return (
                                        <Link
                                            href={"/articles/categories/" + tax?.term_uid}
                                            key={tdx + tax?.term_uid}
                                            className="relative z-10 bg-gray-50 px-3 py-1.5 font-medium text-gray-600 hover:bg-gray-100 capitalize"
                                        >
                                            {tax?.term_uid}
                                        </Link>
                                    );
                                })}
                            </div>
                            <div className="group relative">
                                <div className="mt-3 text-lg font-paragraph font-medium leading-6 text-gray-900 group-hover:text-gray-600 h-[50px]" {...article.$?.title}>
                                    <Link href={(article?.url ? article.url : "#")}>
                                       
                                        {article?.title}
                                    </Link>
                                </div>
                                <p className="mt-auto line-clamp-3 text-sm font-light font-paragraph tracking-wide leading-6 text-neutral-700 whitespace-break-spaces" {...article.$?.teaser}>
                                    {article?.teaser}
                                </p>
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </div>
    )
}