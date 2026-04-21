import { useState } from "react";
import { cslp } from "@/lib/cstack";

export default function Tabs({ content }) {
  const [selectedTab, setSelectedTab] = useState(0);

  function tabClicked(tab) {
    setSelectedTab(tab);
  }

  return (
    <>
      <div className="flex justify-center">
        {content?.tabs?.length === 0 && (
          <div
            className="h-5/6 visual-builder__empty-block-parent py-24"
            {...content?.$?.tabs}
          ></div>
        )}
        {(content?.tabs && content?.tabs.length > 0) && (
          <div
            className="flex max-w-8xl mx-8 mt-16 px-8 mb-2 h-5/6 items-center justify-center"
            {...content?.$?.tabs}
          >
            {content?.tabs?.map((item, index) => (
              <div
                key={index}
                className={
                  selectedTab === index
                    ? "flex flex-row 2xl:w-[92rem] lg:w-[72rem] md:w-[56rem] max-md:flex-wrap items-center justify-center h-full"
                    : "hidden"
                }
                {...cslp(content, "tabs__", index)}
                style={{ backgroundColor: item?.background_color?.hex }}
                {...item?.$?.background_color}
              >

                <div
                  className={
                    "p-6 md:text-m h-[400px] xl:h-[600px] lg:[500px] flex flex-col flex-wrap content-center justify-center w-full " +
                    (item?.text_dark ? "text-neutral-700 " : "text-white ") +
                    (item?.layout === "Text Right" ? "order-2" : "order-0")
                  }
                >
                  <div className="w-full">
                    <h3 className="py-4 px-6 " {...item?.$?.title}>
                      {item?.title}
                    </h3>
                  </div>
                  <div
                    className="lg:text-lg xl:text-xl  px-6 lg:pr-10 xl:pr-20 tracking-[.05rem] leading-7 font-extralight w-full"
                    {...item?.$?.body}
                  >
                    {item?.body}
                  </div>
                </div>

                <div className="flex h-full w-full">
                  {!item.image?.url && (
                    <div
                      className="h-[400px] xl:h-[600px] lg:h-[500px] w-full bg-gray-400 flex items-center justify-center"
                      {...item?.$?.image}
                    >
                      <svg
                        className="w-10 h-10 text-gray-200 dark:text-gray-600"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        viewBox="0 0 20 18"
                      >
                        <path d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z" />
                      </svg>
                    </div>
                  )}
                  {item?.image?.url && (
                    <img
                      className=" h-[400px] object-cover w-full  max-md:h-full xl:h-[600px] lg:h-[500px] order-1"
                      src={item?.image?.url}
                      {...item?.$?.image}
                    ></img>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-center">
        {(content?.tabs && content?.tabs.length > 0) && (
          <div className="flex m-8 md:grid md:grid-cols-4 max-md:gap-8 md:gap-16 auto-rows-fr justify-items-center md:max-w-8xl sm:max-w-4xl">
            {content?.tabs?.map((item, index) => (
              <button
                key={index}
                onClick={() => tabClicked(index)}
                className={
                  selectedTab === index
                    ? "border-b-4 border-black text-2xl max-md:max-w-[25%]"
                    : "border-b-4 border-transparent transition-all hover:border-b-4 hover:border-black text-2xl max-md:max-w-[25%]"
                }
                {...item?.$?.tab_text}
              >
                {item?.tab_text}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
