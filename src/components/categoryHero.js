import Image from 'next/image';
import Link from 'next/link';
import parse from "html-react-parser";

export default function CategoryHero({ category, locale }) {
  if (!category || !category.name) return null;

  return (
    <div className="flex flex-col md:flex-row w-full mx-auto md:gap-15 gap-8 items-start bg-white mb-8 md:h-[400px] overflow-hidden">
      <div className="overflow-hidden md:h-[400px] w-full md:w-[55%] aspect-square relative" {...(category.video ? category?.$?.video : category?.$?.image)}>
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
          <div className="flex flex-nowrap gap-8 uppercase font-medium tracking-widest text-md text-gray-800 mb-6 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent pb-2" {...category?.$?.product_category}>
            {category.children.map((child, index) => (
              <Link 
                key={child.id} 
                href={child.url ? `/${locale}/plp${child.url}` : '#'}
                className={`hover:underline hover:text-cyan-600 whitespace-nowrap ${child.url === category.url ? 'text-cyan-600' : 'text-gray-800'} ${index === 0 ? 'underline' : ''}`}
              >
                {child.name}
              </Link>
            ))}
          </div>
        )}

        <h1 className="font-medium! text-4xl! text-black !font-sans !tracking-[0.05em] line-clamp-1" {...category?.$?.headline}>
          {category.name}
        </h1>

        <div className="text-md plp-description leading-relaxed line-clamp-9" {...category?.$?.description}>
          {parse(category.description) || `Explore our exclusive ${category.name} collection.`}
        </div>
      </div>
    </div>
  );
}

