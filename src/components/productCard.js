"use client";
import { useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft, faAngleRight } from "@fortawesome/free-solid-svg-icons";

export default function ProductCard({ item }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Get all images from media array, fallback to single image
  const allImages = item?.media && item.media.length > 0
    ? item.media.map(m => m?.path).filter(Boolean)
    : [item?.image || item?.image_path];

  const handlePrevImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  const handleNextImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <Link
      href={item?.url ? "/pdp/" + item.url : "#"}
      className="block group cursor-pointer"
    >
      <div className="relative bg-[#e8e8e8] aspect-square mb-4 overflow-hidden rounded-[1px] shadow-sm">
        {allImages.map((imagePath, index) => (
          <img
            key={index}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              index === currentImageIndex ? "opacity-100" : "opacity-0 absolute inset-0"
            }`}
            src={imagePath}
            alt={`${item?.name ?? "Product"} - Image ${index + 1}`}
          />
        ))}

        {allImages.length > 1 && (
          <>
            <button
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full transition-all opacity-0 group-hover:opacity-75"
              onClick={handlePrevImage}
              aria-label="Previous image"
            >
              <FontAwesomeIcon icon={faAngleLeft} size="2xl" className="text-black w-4 h-4 opacity-65" />
            </button>
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full transition-all opacity-0 group-hover:opacity-75"
              onClick={handleNextImage}
              aria-label="Next image"
            >
              <FontAwesomeIcon icon={faAngleRight} size="2xl" className="text-black w-4 h-4 opacity-65" />
            </button>
          </>
        )}
      </div>

      <div className="space-y-1 px-4">
          {item?.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {item.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-0.5 bg-gray-100 text-xs font-medium text-gray-700 rounded-sm"
              >
                {tag?.name}
              </span>
            ))}
          </div>
        )}

        <h3 className="text-black !font-semibold !text-sm uppercase leading-tight line-clamp-1 mb-2 !font-sans !tracking-[0.05em]">
          {item?.name}
        </h3>
        {item?.price != null && item?.price !== "" && <div className="text-black font-bold text-sm mb-2"> {item?.currency_symbol} {parseFloat(item.price).toFixed(2)}</div>}

        <div className="flex justify-start items-center text-[0.7rem] text-black font-normal pt-1">
          {item?.attributes?.find(attribute => attribute?.attribute_name?.toLowerCase() === "color")?.value && (
            <div className="text-black mr-4">
              {item.attributes.find(attribute => attribute?.attribute_name?.toLowerCase() === "color")?.value}
            </div>
          )}
          {item.variants?.length > 0 && <div className="text-black">+ {item.variants?.length} models</div>}
        </div>
      </div>
    </Link>
  );
}

