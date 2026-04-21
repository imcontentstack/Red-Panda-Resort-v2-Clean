"use client"
import Link from "next/link";
import Header from "./header";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
export default function Hero({ content, locale, withHeader, cslp }) {
  const pathname = usePathname();
  if (!content || content?.length === 0) return <div></div>;

  let positionClass = "";
  let headlineClass = "";
  let bodyClass = "";
  let buttonClass = "";

 
  if (content && content?.length > 0){
    const c0 = content?.[0];
    if (c0?.text_position === "Top Left") {
    positionClass = "top-16 left-16";
    } else if (c0?.text_position === "Top Center") {
      positionClass = "top-16 left-1/2 transform -translate-x-1/2 ";
    } else if (c0?.text_position === "Top Right") {
      positionClass = "top-16 right-16";
    } else if (c0?.text_position === "Left") {
      positionClass = "top-1/2 left-16 transform -translate-y-1/2";
    } else if (c0?.text_position === "Center") {
      positionClass =
        "top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2";
    } else if (c0?.text_position === "Right") {
      positionClass = "top-1/2 right-16 transform -translate-y-1/2";
      headlineClass = "text-right";
      bodyClass = "text-right";
      buttonClass = "justify-end";
    } else if (c0?.text_position === "Bottom Left") {
      positionClass = "bottom-16 left-16";
    } else if (c0?.text_position === "Bottom Center") {
      positionClass = "bottom-16 left-1/2 transform -translate-x-1/2";
    } else if (c0?.text_position === "Bottom Right") {
      positionClass = "bottom-16 right-16";
    }
  }

  if (content && content?.length > 0){  
    const c0 = content?.[0];
    if (c0?.alignment === "Left") {
      headlineClass = "text-left";
      bodyClass = "text-left";
      buttonClass = "justify-start";
    } else if (c0?.alignment === "Center") {
      headlineClass = "text-center";
      bodyClass = "";
      buttonClass = "justify-center";
    } else if (c0?.alignment === "Right") {
      headlineClass = "text-right";
      bodyClass = "text-right";
      buttonClass = "justify-end";
    }
  }

  if(content && content?.length) {  
    if (content?.[0]?.header_overlay !== true) {
      withHeader = false
    }
  }

  return (
    <>
      {(!withHeader && pathname === `/${locale}`) && <Header locale={locale} /> }
      <motion.div
        inital="offscreen"
        whileInView="onscreen"
        viewport={{ once: true }}
      >
        <div className=" ">
          
          {content?.map((hero, index) => {
            // Get aspect ratio class based on contentstack field
            let aspectRatioClass = "aspect-video"; // Default to 16:9
            if (hero?.aspect_ratio === "16:9") {
              aspectRatioClass = "aspect-video"; // 16:9
            } else if (hero?.aspect_ratio === "3:2") {
              aspectRatioClass = "aspect-[3/2]";
            } else if (hero?.aspect_ratio === "2:1") {
              aspectRatioClass = "aspect-[2/1]";
            } else if (hero?.aspect_ratio === "21:9") {
              aspectRatioClass = "aspect-[21/9]";
            }

            const mediaOpacity = hero?.media_overlay || "75%";
            const imageFile = hero?.image_options?.image?.url || null;
            const imageHeight = hero?.image_options?.image_height || "h-auto";
            const isScreenHeight = imageHeight === "h-screen";

            const videoFile = hero?.video_options?.video?.url || null;
            const videoControls = hero?.video_options?.video_controls;
            const videoLoop = hero?.video_options?.in_loop;

            const containerHeightClass = videoFile
              ? aspectRatioClass
              : isScreenHeight
                ? "h-screen w-full"
                : aspectRatioClass;

            return (
              <div
                key={index}
                className={`bg-black relative isolate overflow-hidden flex ${containerHeightClass}`}
              >

                {videoFile ? (
                  <video
                    className="absolute inset-0 -z-10 min-h-full min-w-full h-full w-full object-cover"
                    style={{ opacity: mediaOpacity }}
                    autoPlay={videoControls === "Autoplay"}
                    controls={videoControls === "Show Controls"}
                    muted={videoControls === "Autoplay"}
                    loop={videoControls === "Autoplay"
                            ? true
                            : videoControls === "Show Controls"
                            ? videoLoop
                            : false
                          }
                  >
                    <source src={videoFile} />
                  </video>
                ) : imageFile ? (
                  <img
                    className="absolute inset-0 -z-10 min-h-full min-w-full h-full w-full object-cover"
                    style={{
                      opacity: mediaOpacity
                    }}
                    src={imageFile}
                    {...hero?.$?.image_options?.image}
                  />
                ) : null}

                {withHeader ? <Header color="white" locale={locale} /> : <></>}
                <div className={"absolute max-w-2xl " + positionClass}>
                  <div className=" md:w-[42rem]">
                    <motion.div
                      variants={{
                        hidden: {
                          y: 300,
                        },
                        visible: {
                          y: 0,
                          transition: {
                            type: "spring",
                            stiffness: 170,
                            damping: 30,
                          },
                        },
                      }}
                      initial="hidden"
                      animate="visible"
                      {...hero?.$?.text_position}
                    >
                      <h1
                        className={"mt-8 text-white " + headlineClass}
                        {...hero?.$?.header}
                      >
                        {hero?.header}
                      </h1>

                      <p
                        className={"mt-8 text-left text-white " + bodyClass}
                        style={{fontSize: hero?.body_text_size ? hero?.body_text_size : "16px"}}
                        {...hero?.$?.body}
                      >
                        {hero?.body}
                      </p>

                      {
                        hero?.button_text !== "" && (
                          <div
                            className={
                              "mt-10 flex items-center gap-x-6 " + buttonClass
                            }
                          >
                            {hero?.page && (
                                <Link
                                href={
                                  (hero?.page?.length > 0 && hero?.page?.[0]?.url) ? hero?.page?.[0]?.url : "#"
                                }
                                className="rounded-md button px-8 py-4 text-md tracking-widest uppercase font-bold text-white shadow-sm ring-2 ring-inset ring-gray-300 hover:text-neutral-700 hover:bg-gray-50"
                                {...hero?.$?.button_text}
                              >
                                {hero?.button_text}
                              </Link>
                            )}
                          </div>
                        )
                      }
                    </motion.div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </>
  );
}
