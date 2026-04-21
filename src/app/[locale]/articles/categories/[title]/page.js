"use client";
import Header from "@/components/header";
import { useState, useEffect } from "react";
import Footer from "@/components/footer";
import { ContentstackClient } from "@/lib/contentstack-client";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function ArticleCategory({ }) {
  const [entries, setEntries] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const params = useParams();

  const getContent = async () => {
    const entries = await ContentstackClient.getElementByTypeByTaxonomy(
      "article",
      params.locale,
      [params.title]
    );
    setEntries(entries);
    setIsLoading(false);
  };

  useEffect(() => {
    ContentstackClient.onEntryChange(getContent);
  }, []);

  if (isLoading) return;

  return (
    <>
      <Header locale={params.locale} />
      <div className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-8xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-medium text-3xl text-center tracking-widest text-neutral-700 uppercase">
              {params.title}
            </h2>
            <p className="mt-2 font-paragraph font-light text-md whitespace-pre-wrap leading-8 text-neutral-700 italic">
              All articles with {params.title} tag
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-3xl grid-cols-1 gap-x-8 gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            {Array.isArray(entries) && entries.length > 0 && entries.map((article) => (
              <article
                key={article.uid}
                className="flex flex-col items-start"
              >
                <Link href={(article.url ? article.url : "#")}>
                <div className="relative w-full">
                  {article?.video_options?.video?.url ? (
                    <>
                      <video
                        className="aspect-[16/9] w-full bg-gray-100 object-cover sm:aspect-[2/1] lg:aspect-[3/2]"
                        preload="metadata"
                        style={{ pointerEvents: 'none' }}
                      >
                        <source src={article?.video_options?.video?.url}/>
                      </video>
                      <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                        <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 84 84" xmlns="http://www.w3.org/2000/svg"><circle cx="42" cy="42" r="42" opacity="0.5"/><path d="M33 28L56 42L33 56V28Z"/></svg>
                      </div>
                    </>
                  ) : article.banner_image?.url ? (
                    <img
                      src={article.banner_image.url}
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
                  <div className="mt-8 flex items-center gap-x-4 text-xs">
                    <time className="text-gray-500">
                      Editorial Staff
                    </time>

                    {article?.taxonomies?.map((tax, tdx) => {
                      return (
                        <a
                          href={"/articles/categories/" + tax.term_uid}
                          key={tdx + tax.term_uid}
                          className="relative z-10 bg-gray-50 px-3 py-1.5 font-medium text-gray-600 hover:bg-gray-100 capitalize"
                        >
                          {tax.term_uid}
                        </a>
                      );
                    })}
                  </div>
                  <div className="group relative">
                    <h3 className="mt-3 text-lg font-paragraph font-medium leading-6 text-gray-900 group-hover:text-gray-600">
                      <Link href={(article.url ? article.url : "#")}>
                        <span className="absolute inset-0" />
                        {article.title}
                      </Link>
                    </h3>
                    <p className="mt-5 line-clamp-3 text-sm font-light font-paragraph tracking-wide leading-6 text-neutral-700 whitespace-break-spaces">
                      {article.teaser}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
