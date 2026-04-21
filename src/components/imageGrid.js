import { cslp } from "@/lib/cstack";
import Link from "next/link";

export default function ImageGrid({ content }) {
  return (
    <div className="max-w-8xl mx-auto mt-32 mb-32 px-8">
      {(content?.image && content?.image?.length === 0) && (
        <div
          className="h-[800px] visual-builder__empty-block-parent"
          {...content?.$?.image}
        ></div>
      )}
      {(content?.image && content?.image?.length === 1) && (
        <div
          className="grid grid-cols-4 h-[800px] gap-6"
          {...content?.$?.image}
        >
          {!content?.image?.[0]?.image?.url && (
            <div
              className="col-span-4 row-span-2 h-full bg-gray-400 flex items-center justify-center"
              {...content?.image?.[0]?.$?.image}
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
          {(content?.image && content?.image?.length > 0 && content?.image?.[0]?.image?.url) && (
            <div
              className="relative col-span-4 row-span-2 w-full "
              {...content?.$?.image__0}
            >
              <Link
                href={
                  (content?.image?.[0]?.page?.length > 0 && content?.image?.[0]?.page?.[0]?.url)
                    ? content?.image?.[0]?.page?.[0]?.url
                    : "#"
                }
              >
                <div
                  className="w-full h-full overflow-hidden group"
                  {...content?.image?.[0]?.$?.image}
                >
                  <div
                    className="bg-center bg-cover group w-full h-full group-hover:scale-110 transition-all duration-500"
                    style={{
                      backgroundImage: `url(${content?.image?.[0]?.image?.url})`,
                    }}
                  ></div>
                  <div className="absolute left-0 top-0 w-full h-full flex bg-black opacity-20 transition-opacity duration-300"></div>
                  <p
                    className="absolute bottom-5 left-5 text-white text-3xl "
                    {...content?.image?.[0]?.$?.text}
                  >
                    {content?.image?.[0]?.text}
                  </p>
                </div>
              </Link>
            </div>
          )}
        </div>
      )}
      {content?.image?.length === 2 && (
        <div
          className="grid grid-cols-4 h-[800px] gap-6"
          {...content?.$?.image}
        >
          {[0, 1].map((item, index) => {
            if (!content?.image?.[index]?.image?.url)
              return (
                <div
                  key={index}
                  className="col-span-2 row-span-2 "
                  {...content?.$?.["image__" + index]}
                >
                  <div
                    key={index}
                    className="bg-gray-400 flex items-center justify-center w-full h-full"
                    {...content?.image?.[index]?.$?.image}
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
                </div>
              );
            else {
              return (
                <div
                  key={index}
                  className="relative col-span-2 row-span-2 w-full "
                  {...cslp(content, "image__", index)}
                >
                  {(content?.image && content?.image?.length > 0 && content?.image?.[index]?.page) && (
                    <Link
                    href={
                      (content?.image?.[index]?.page?.length > 0 && content?.image?.[index]?.page?.[0]?.url)
                        ? content?.image?.[index]?.page?.[0]?.url
                        : "#"
                    }
                  >
                    <div
                      className="w-full h-full overflow-hidden group"
                      {...content?.image?.[index]?.$?.image}
                    >
                      <div
                        className="bg-center bg-cover group w-full h-full group-hover:scale-110 transition-all duration-500"
                        style={{
                          backgroundImage: `url(${content?.image?.[index]?.image?.url})`,
                        }}
                      ></div>

                      <div className="absolute left-0 top-0 w-full h-full flex bg-black opacity-20 transition-opacity duration-300"></div>
                      <p
                        className="absolute bottom-5 left-5 text-white text-3xl "
                        {...content?.image?.[index]?.$?.text}
                      >
                        {content?.image?.[index]?.text}
                      </p>
                    </div>
                  </Link>
                  )}
                </div>
              );
            }
          })}
        </div>
      )}
      {content?.image?.length === 3 && (
        <div
          className="grid grid-cols-4 h-[800px] gap-6"
          {...content?.$?.image}
        >
          {[0, 1, 2].map((item, index) => {
            if (!content?.image?.[index]?.image?.url) {
              return (
                <div
                  key={index}
                  className={
                    index === 0 ? "col-span-2 row-span-2" : "col-span-2"
                  }
                  {...content?.$?.["image__" + index]}
                >
                  <div
                    key={index}
                    className="bg-gray-400 flex items-center justify-center w-full h-full"
                    {...content?.image?.[index]?.$?.image}
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
                </div>
              );
            } else {
              return (
                <div
                  key={index}
                  className={
                    "relative  w-full " +
                    (index === 0 ? "col-span-2 row-span-2" : "col-span-2")
                  }
                  {...cslp(content, "image__", index)}
                >
                  {(content?.image && content?.image?.length > 0 && content?.image?.[index]?.page) && (  
                    <Link
                      href={
                        (content?.image?.[index]?.page?.length > 0 && content?.image?.[index]?.page?.[0]?.url)
                          ? content?.image?.[index]?.page?.[0]?.url
                          : "#"
                      }
                    >
                      <div
                        className="w-full h-full overflow-hidden group"
                        {...content?.image?.[index]?.$?.image}
                      >
                        <div
                          className="bg-center bg-cover group w-full h-full group-hover:scale-110 transition-all duration-500"
                          style={{
                            backgroundImage: `url(${content?.image?.[index]?.image?.url})`,
                          }}
                        ></div>

                        <div className="absolute left-0 top-0 w-full h-full flex bg-black opacity-20 transition-opacity duration-300"></div>
                        <p
                          className="absolute bottom-5 left-5 text-white text-3xl "
                          {...content?.image?.[index]?.$?.text}
                        >
                          {content?.image?.[index]?.text}
                        </p>
                      </div>
                    </Link>
                    )}
                </div>
              );
            }
          })}
        </div>
      )}
      {content?.image?.length >= 4 && (
        <div
          className="grid grid-cols-4 h-[800px] gap-6"
          {...content?.$?.image}
        >
          {[0, 1, 2, 4].map((item, index) => {
            if (!content?.image?.[index]?.image?.url) {
              return (
                <div
                  key={index}
                  className={
                    index === 0
                      ? "col-span-2 row-span-2"
                      : index === 3
                      ? "col-span-2"
                      : ""
                  }
                  {...content?.$?.["image__" + index]}
                >
                  <div
                    key={index}
                    className="bg-gray-400 flex items-center justify-center w-full h-full"
                    {...content?.image?.[index]?.$?.image}
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
                </div>
              );
            } else {
              return (
                <div
                  key={index}
                  className={
                    "relative  w-full " +
                    (index === 0
                      ? "max-lg:col-span-4 lg:col-span-2 lg:row-span-2"
                      : index === 3
                      ? "max-lg:col-span-4 lg:col-span-2"
                      : "max-lg:col-span-4")
                  }
                  {...cslp(content, "image__", index)}
                >
                  {(content?.image && content?.image?.length > 0 && content?.image?.[index]?.page) && (  
                    <Link
                      href={
                        (content?.image?.[index]?.page?.length > 0 && content?.image?.[index]?.page?.[0]?.url)
                          ? content?.image?.[index]?.page?.[0]?.url
                          : "#"
                      }
                    >
                      <div
                        className="w-full h-full overflow-hidden group"
                        {...content?.image?.[index]?.$?.image}
                      >
                        <div
                          className="bg-center bg-cover group w-full h-full group-hover:scale-110 transition-all duration-500"
                          style={{
                            backgroundImage: `url(${content?.image?.[index]?.image?.url})`,
                          }}
                        ></div>

                        <div className="absolute left-0 top-0 w-full h-full flex bg-black opacity-20 transition-opacity duration-300"></div>
                        <p
                          className="absolute bottom-5 left-5 text-white text-3xl "
                          {...content?.image?.[index]?.$?.text}
                        >
                          {content?.image?.[index]?.text}
                        </p>
                      </div>
                    </Link>
                    )}
                </div>
              );
            }
          })}
        </div>
      )}
    </div>
  );
}
