import Image from 'next/image';
import Link from 'next/link';
import parse from "html-react-parser";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import { useState, useEffect } from 'react';
import RPCommerce from '@/lib/rpcommerce';

export default function CategoryBanner({ content, locale }) {
  if(content?.categories && Array.isArray(content?.categories) && content?.categories?.length > 0) {
    content.categories = content?.categories?.[0];
  }
  
  const [category, setCategory] = useState(null);
  
  useEffect(() => {
    const getCategory = async () => {
      const category = await RPCommerce.getCategoryByURL((content?.categories?.items?.[0]?.url) ? (content?.categories?.items?.[0]?.url) : ('/' + (content?.title?.toLowerCase?.() ?? '')), locale, true, 2) || content?.categories?.items?.[0];
      const categoryData = {
        ...(category || {}),
        name: content.title || category?.name,
        description: (content.description && content.description != "<p></p>" && content.description != "") ? content.description : category?.description,
        image: content.image?.url || category?.image,
        video: content.video?.url || null,
        $: content?.$,
        plp: content.plp,
        plp_link_text: content.plp_link_text,
      };
      return categoryData;
    }
    
    
    getCategory().then(setCategory);
  }, [content, locale]);
  
  if (!content || !category || !category.name) return null;

  return (
    <div className="flex flex-col md:flex-row w-full mx-auto md:gap-15 gap-8 items-start bg-white mb-8 md:h-[400px] overflow-hidden">
      <div className="overflow-hidden md:h-[400px]  w-full md:w-[55%] aspect-square relative" {...(category.video ? category?.$?.video : category?.$?.image)}>
        {category.video ? (
          <video
            src={category.video}
            className="w-full h-full object-cover"
            autoPlay
            loop
            muted
            playsInline
          />
        ) : category.image ? (
          <Image
            src={category.image}
            alt={category.name}
            fill
            className="object-cover h-full w-full"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
            No Media
          </div>
        )}
      </div>

      <div className="w-full md:w-[45%] flex flex-col gap-4 md:mt-6 ml-8 md:ml-0 mr-10">
        {category.children && category.children.length > 0 && (
          <div className="flex flex-nowrap gap-8 uppercase font-medium tracking-widest text-md text-gray-800 mb-6 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent pb-2" {...category?.$?.categories}>
            {category.children.map((item, index) => (
              <Link
                key={item.id}
                href={item.url ? `/plp${item.url}` : '#'}
                className={`hover:underline hover:text-cyan-600 whitespace-nowrap text-gray-800 ${index === 0 ? 'underline' : ''}`}
              >
                {item.name}
              </Link>
            ))}
          </div>
        )}

        <h1 className="font-medium! text-4xl! text-black !font-sans !tracking-[0.05em] line-clamp-1" {...category?.$?.title}>
          {category.name}
        </h1>

        <div className="text-md plp-description leading-relaxed line-clamp-5 h-[150px] overflow-hidden" {...content?.$?.description}>
          {category.description && typeof category.description === 'string' ? parse(category.description) : ''}
        </div>

        {category?.plp?.length > 0 && category?.plp?.[0]?.url && (
          <Link
            href={category?.plp?.[0]?.url}
            className="inline-flex items-center mt-4 px-6 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition-colors font-medium text-sm uppercase tracking-wider w-fit"
            {...content?.$?.plp}
          >
            <span {...content?.$?.plp_link_text}>{content?.plp_link_text || 'Learn More'}</span>
            <ArrowRightIcon className="h-4 w-4 ml-2" />
          </Link>
        )}
      </div>
    </div>
  );
}