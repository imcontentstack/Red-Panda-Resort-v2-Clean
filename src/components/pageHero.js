"use client";

export default function PageHero({ content }) {
  // Get image URL and check if it's valid
  const imageUrl = content?.image?.url?.trim();
  const hasValidImageUrl = imageUrl && imageUrl.length > 0;

  // ✅ NEW: Video support
  const videoUrl = content?.video_options?.video?.url?.trim();
  const hasValidVideoUrl = videoUrl && videoUrl.length > 0;
  const videoControls = content?.video_options?.video_controls;
  const videoLoop = content?.video_options?.in_loop;
  const mediaOverlay = 1 - parseInt(content?.overlay ?? "75%") / 100;

  return (
    <div>
      <div>
        {content?.media_style === "Full" && (
          <div
            className={`${
              content?.text_color === "Light"
                ? "text-white"
                : "text-neutral-700"
            } relative flex h-[800px]`}
          >
            {/* ✅ Media Priority: Video > Image */}
            {hasValidVideoUrl ? (
              <video
                className="absolute inset-0 w-full h-full object-cover z-0"
                autoPlay={videoControls === "Autoplay"}
                controls={videoControls === "Show Controls"}
                muted={videoControls === "Autoplay"}
                loop={
                  videoControls === "Autoplay" 
                    ? true
                    : videoControls === "Show Controls"
                      ? videoLoop
                      : false
                }
              >
                <source src={videoUrl}/>
              </video>
            ) : hasValidImageUrl ? (
              <img
                src={imageUrl}
                className="absolute inset-0 w-full h-full object-cover -z-10"
                {...content?.$?.image}
              />
            ) : (
              <div
                className="absolute inset-0 bg-gray-500 -z-10"
                {...content?.$?.image}
              />
            )}

            {/* ✅ Overlay using style opacity */}
            {content?.overlay && (
              <div
                className="absolute inset-0 bg-black z-10 pointer-events-none"
                style={{ opacity: mediaOverlay }}
              />
            )}

            {/* Layouts */}
            {content?.layout === "Text Right" && (
              <div className="relative z-20 pointer-events-none flex px-8 gap-8 my-auto max-w-7xl w-full text-right mx-auto justify-right ">
                <div className="pointer-events-auto font-paragraph ml-auto">
                  <p
                    className={`text-[60px] leading-tight ${
                      content?.text_color === "Light"
                        ? "text-white"
                        : "text-[#005D94]"
                    } tracking-wider font-paragraph`}
                    {...content?.$?.headline}
                  >
                    {content?.headline}
                  </p>
                  <p
                    className="mt-4 whitespace-pre-wrap text-xl"
                    {...content?.$?.details}
                  >
                    {content?.details}
                  </p>
                </div>
              </div>
            )}

            {content?.layout === "Text Left" && (
              <div className="relative pointer-events-none flex px-8 gap-8 mx-auto z-20 max-w-7xl w-full my-auto">
                <div className="pointer-events-auto font-paragraph">
                  <p
                    className={`text-[60px] leading-tight ${
                      content?.text_color === "Light"
                        ? "text-white"
                        : "text-[#005D94]"
                    } tracking-wider font-paragraph`}
                    {...content?.$?.headline}
                  >
                    {content?.headline}
                  </p>
                  <p
                    className="mt-4 whitespace-pre-wrap text-xl"
                    {...content?.$?.details}
                  >
                    {content?.details}
                  </p>
                </div>
              </div>
            )}

            {content?.layout === "Center" && (
              <div className="relative z-20 pointer-events-none flex px-24 gap-8 my-auto mx-auto text-center" >
                <div className="pointer-events-auto font-paragraph">
                  <p
                    className={`text-[60px] leading-tight ${
                      content?.text_color === "Light"
                        ? "text-white"
                        : "text-[#005D94]"
                    } tracking-wider font-paragraph`}
                    {...content?.$?.headline}
                  >
                    {content?.headline}
                  </p>
                  <p
                    className="mt-4 whitespace-pre-wrap text-xl"
                    {...content?.$?.details}
                  >
                    {content?.details}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* HALF STYLE */}
        {content?.media_style !== "Full" && (
          <div
            className={`hidden ${
              content?.media_style === "Full" ? "hidden" : "md:block"
            } mx-auto px-8`}
          >
            {(content?.layout === "Text Right" ||
              content?.layout === "Center") && (
              <div className="flex gap-8 items-center">
                <div className="w-1/2 flex">
                  {hasValidVideoUrl ? (
                    <video
                      className="w-full h-full object-cover"
                      autoPlay={videoControls === "Autoplay"}
                      controls={videoControls === "Show Controls"}
                      muted={videoControls === "Autoplay"}
                      loop={
                        videoControls === "Autoplay"
                          ? true
                          : videoControls === "Show Controls"
                            ? videoLoop
                            : false
                      }
                    >
                      <source src={videoUrl} />
                    </video>
                  ) : hasValidImageUrl ? (
                    <img
                      className="w-full h-full object-cover"
                      src={imageUrl}
                      {...content?.$?.image}
                    />
                  ) : (
                    <div
                      className="w-full h-[800px] bg-gray-300"
                      {...content?.$?.image}
                    />
                  )}
                </div>

                <div className="font-paragraph mx-auto max-w-lg">
                  <p
                    className="text-[60px] leading-tight text-[#005D94] tracking-wider font-paragraph"
                    {...content?.$?.headline}
                  >
                    {content?.headline}
                  </p>
                  <p
                    className="mt-4 whitespace-pre-wrap text-lg"
                    {...content?.$?.details}
                  >
                    {content?.details}
                  </p>
                </div>
              </div>
            )}

            {content?.layout === "Text Left" && (
              <div className="flex gap-8 items-center">
                <div className="w-1/2 flex">
                  <div className="font-paragraph mx-auto max-w-lg">
                    <p
                      className="text-[60px] leading-tight text-[#005D94] tracking-wider font-paragraph"
                      {...content?.$?.headline}
                    >
                      {content?.headline}
                    </p>
                    <p
                      className="mt-4 whitespace-pre-wrap text-lg"
                      {...content?.$?.details}
                    >
                      {content?.details}
                    </p>
                  </div>
                </div>

                <div className="w-1/2">
                  {hasValidVideoUrl ? (
                    <video
                      className="w-full h-full object-cover"
                      autoPlay={videoControls === "Autoplay"}
                      controls={videoControls === "Show Controls"}
                      muted={videoControls === "Autoplay"}
                      loop={
                        videoControls === "Autoplay"
                          ? true
                          : videoControls === "Show Controls"
                            ? videoLoop
                            : false
                      }
                    >
                      <source src={videoUrl} />
                    </video>
                  ) : hasValidImageUrl ? (
                    <img
                      className="w-full h-full object-cover"
                      src={imageUrl}
                      {...content?.$?.image}
                    />
                  ) : (
                    <div
                      className="w-full h-[800px] bg-gray-300"
                      {...content?.$?.image}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <div
          className={`md:hidden ${
            content?.media_style === "Full" ? "hidden" : ""
          } max-w-7xl mx-auto px-8 `}
        >
          {/* ✅ Media Priority: Video > Image */}
          {hasValidVideoUrl ? (
            <video
              className="w-full object-cover"
              autoPlay={videoControls === "Autoplay"}
              controls={videoControls === "Show Controls"}
              muted={videoControls === "Autoplay"}
              loop={
                videoControls === "Autoplay"
                  ? true
                  : videoControls === "Show Controls"
                    ? videoLoop
                    : false
              }
              {...content?.$?.video}
            >
              <source src={videoUrl} />
            </video>
          ) : hasValidImageUrl ? (
            <img
              className="w-full object-cover"
              src={imageUrl}
              {...content?.$?.image}
            />
          ) : (
            <div className="w-full h-[800px]" {...content?.$?.image}>
              <div className="bg-gray-300 flex items-center justify-center h-full">
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
          )}

          <div className="font-paragraph mt-8">
            <p
              className="text-[60px] leading-tight text-[#005D94] tracking-wider font-paragraph"
              {...content?.$?.headline}
            >
              {content?.headline}
            </p>
            <p className="mt-4 whitespace-pre-wrap" {...content?.$?.details}>
              {content?.details}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
