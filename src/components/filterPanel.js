"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";

export default function FilterPanel({
  isOpen,
  onClose,
  sortBy,
  setSortBy,
  selectedFilters,
  onFilterChange,
  onResetAll,
  categoryFilters
}) {
  const [expandedSections, setExpandedSections] = useState({
    sort: true // Start with Sort By section open by default
  });

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed right-0 top-0 h-full w-full md:w-[500px] bg-white z-50 shadow-2xl flex flex-col"
          >
            <div className="pt-6 pr-6 text-right">
              <button
                onClick={onClose}
                className="p-0 hover:opacity-60 transition-opacity"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-12 py-0">
            <div className="text-3xl font-medium mb-10">Filters and Sorting</div>
              
              <div className="mb-2 border-b border-gray-200 pb-6">
                <button
                  onClick={() => toggleSection('sort')}
                  className="w-full flex items-center justify-between text-left mb-3"
                >
                  <span className="text-[0.7rem] font-semibold uppercase tracking-wider">Sort By</span>
                  <FontAwesomeIcon 
                    icon={expandedSections['sort'] ? faChevronUp : faChevronDown} 
                    className="w-3 h-3"
                  />
                </button>
                
                {expandedSections['sort'] && (
                  <div className="space-y-3">
                    {[
                      { value: "top_sellers", label: "Top Sellers" },
                      { value: "newest", label: "Newest" },
                      { value: "price_low_high", label: "Price low to high" },
                      { value: "price_high_low", label: "Price high to low" }
                    ].map((option) => (
                      <label key={option.value} className="flex items-center cursor-pointer group">
                          <input
                            type="radio"
                            name="sort"
                            value={option.value}
                            checked={sortBy === option.value}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="w-3.5 h-3.5 text-black border-gray-300 focus:ring-black accent-black"
                          />
                        <span className="ml-3 text-[0.8rem] group-hover:text-gray-600 transition-colors">
                          {option.label}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {categoryFilters?.filters && (
                <div className="mb-8">
                  {categoryFilters.filters.attributes?.map((attribute) => (
                    <div key={attribute.id} className="mb-2 border-b border-gray-200 pb-6">
                      <button
                        onClick={() => toggleSection(`attr_${attribute.id}`)}
                        className="w-full flex items-center justify-between text-left mb-3"
                      >
                        <span className="text-base font-normal">{attribute.name}</span>
                        <FontAwesomeIcon 
                          icon={expandedSections[`attr_${attribute.id}`] ? faChevronUp : faChevronDown} 
                          className="w-3 h-3"
                        />
                      </button>
                      
                      {expandedSections[`attr_${attribute.id}`] && (
                        <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                          {attribute.values?.map((value) => (
                            <label key={value.id} className="flex items-center cursor-pointer group">
                              <input
                                type="checkbox"
                                checked={selectedFilters.includes(`attr_${value.id}`)}
                                onChange={(e) =>
                                  onFilterChange(`attr_${value.id}`, e.target.checked)
                                }
                                className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black accent-black"
                              />
                              <span className="ml-3 text-[0.8rem] group-hover:text-gray-600 transition-colors flex items-center gap-2">
                                {attribute.name === 'Color' && value.custom_info && (
                                  <span
                                    className="w-4 h-4 rounded-full border border-gray-300"
                                    style={{ backgroundColor: value.custom_info }}
                                  />
                                )}
                                {value.value}
                                <span className="text-gray-400 text-xs">({value.usage_count})</span>
                              </span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {categoryFilters.filters.tags?.map((tagCategory) => (
                    tagCategory.tags?.length > 0 && (
                      <div key={tagCategory.id} className="mb-2 border-b border-gray-200 pb-6">
                        <button
                          onClick={() => toggleSection(`tags_${tagCategory.id}`)}
                          className="w-full flex items-center justify-between text-left mb-3"
                        >
                          <span className="text-base font-normal">Tags</span>
                          <FontAwesomeIcon 
                            icon={expandedSections[`tags_${tagCategory.id}`] ? faChevronUp : faChevronDown} 
                            className="w-3 h-3"
                          />
                        </button>
                        
                        {expandedSections[`tags_${tagCategory.id}`] && (
                          <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                            {tagCategory.tags.map((tag) => (
                              <label key={tag.id} className="flex items-center cursor-pointer group">
                                <input
                                  type="checkbox"
                                  checked={selectedFilters.includes(`tag_${tag.id}`)}
                                  onChange={(e) =>
                                    onFilterChange(`tag_${tag.id}`, e.target.checked)
                                  }
                                  className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black accent-black"
                                />
                                <span className="ml-3 text-[0.8rem] group-hover:text-gray-600 transition-colors">
                                  {tag.name}
                                  <span className="text-gray-400 text-xs ml-1">({tag.product_count})</span>
                                </span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  ))}

                  {categoryFilters.filters.brands?.length > 0 && (
                    <div className="mb-2 border-b border-gray-200 pb-6">
                      <button
                        onClick={() => toggleSection('brands')}
                        className="w-full flex items-center justify-between text-left mb-3"
                      >
                        <span className="text-base font-normal">Brands</span>
                        <FontAwesomeIcon 
                          icon={expandedSections['brands'] ? faChevronUp : faChevronDown} 
                          className="w-3 h-3"
                        />
                      </button>
                      
                      {expandedSections['brands'] && (
                        <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                          {categoryFilters.filters.brands.map((brand, index) => (
                            <label key={index} className="flex items-center cursor-pointer group">
                              <input
                                type="checkbox"
                                checked={selectedFilters.includes(`brand_${brand.name}`)}
                                onChange={(e) =>
                                  onFilterChange(`brand_${brand.name}`, e.target.checked)
                                }
                                className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black accent-black"
                              />
                              <span className="ml-3 text-[0.8rem] group-hover:text-gray-600 transition-colors">
                                {brand.name}
                                <span className="text-gray-400 text-xs ml-1">({brand.product_count})</span>
                              </span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-6 border-t space-y-3">
              <button
                onClick={onClose}
                className="w-full bg-black text-white py-4 px-6 rounded-full font-medium uppercase tracking-wider hover:bg-gray-800 transition-colors text-sm"
              >
                Show Products
              </button>
              <button
                onClick={onResetAll}
                className="w-full bg-white text-black py-4 px-6 rounded-full font-medium uppercase tracking-wider border-2 border-black hover:bg-gray-50 transition-colors text-sm"
              >
                Reset All
              </button>
          </div>
        </motion.div>
      </>
      )}
    </AnimatePresence>
  );
}

