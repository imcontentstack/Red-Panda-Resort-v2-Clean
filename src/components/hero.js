"use client";

import Link from "next/link";
import Header from "./header";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const demoHeroExperiences = {
  "uk-individual-retirement": {
    header: "Plan your retirement with confidence",
    body: "Explore retirement-focused investment solutions tailored to UK individual investors.",
    button_text: "Explore Retirement Solutions",
    image: "https://images.contentstack.io/v3/assets/blt336c04d12909ff8e/blte6432826c6c7cc49/6a2961d5da7c0ddbe6e1f9d4/retirement-Nightingale-Hall-Schroders-Senior-Housing-716x465.jpg",
  },
  "france-individual-retirement": {
    header: "Préparez votre retraite en toute confiance",
    body: "Découvrez des solutions d'investissement adaptées aux investisseurs particuliers en France.",
    button_text: "Explorer les solutions retraite",
    image: "https://images.contentstack.io/v3/assets/blt336c04d12909ff8e/blt58b2d68423e474da/6a2967dd19783ab1b4e0b1e9/fr-retirement-Senior-Living-in-France-Better-Choices-for-a-Happy-Life.jpg",
  },
  "spain-individual-retirement": {
    header: "Planifica tu jubilación con confianza",
    body: "Descubre soluciones de inversión para inversores particulares en España.",
    button_text: "Explorar soluciones de jubilación",
    image: "https://images.contentstack.io/v3/assets/blt336c04d12909ff8e/blt2884211e12948759/6a29954bab9a66d583c45670/es-retirement.jpg",
  },
  "uk-institutional-private_assets": {
    header: "Access global private market opportunities",
    body: "Institutional strategies across infrastructure, private equity and real assets.",
    button_text: "Explore Institutional Strategies",
    image: "https://images.contentstack.io/v3/assets/blt336c04d12909ff8e/bltbfcb35eeb5df4b48/6a26e66066413cd331f85dbf/Institutional.jpg",
  },
  "france-institutional-private_assets": {
    header: "Accédez aux opportunités des marchés privés mondiaux",
    body: "Des stratégies institutionnelles couvrant les infrastructures, le private equity et les actifs réels.",
    button_text: "Explorer les stratégies institutionnelles",
    image: "https://images.contentstack.io/v3/assets/blt336c04d12909ff8e/bltbfcb35eeb5df4b48/6a26e66066413cd331f85dbf/Institutional.jpg",
  },
  "spain-institutional-private_assets": {
    header: "Acceda a oportunidades globales en mercados privados",
    body: "Estrategias institucionales en infraestructuras, capital privado y activos reales.",
    button_text: "Explorar estrategias institucionales",
    image: "https://images.contentstack.io/v3/assets/blt336c04d12909ff8e/bltbfcb35eeb5df4b48/6a26e66066413cd331f85dbf/Institutional.jpg",
  },
  "uk-intermediary-model_portfolios": {
    header: "Scalable investment solutions for advisers",
    body: "Model portfolio solutions and market insights designed for UK intermediaries.",
    button_text: "Explore Adviser Solutions",
    image: "https://images.contentstack.io/v3/assets/YOUR_ASSET_ID/YOUR_ENV/YOUR_IMAGE.jpg",
  },
  "france-intermediary-model_portfolios": {
    header: "Des solutions d'investissement évolutives pour les conseillers",
    body: "Portefeuilles modèles et analyses de marché conçus pour les intermédiaires en France.",
    button_text: "Explorer les solutions conseiller",
    image: "https://images.contentstack.io/v3/assets/YOUR_ASSET_ID/YOUR_ENV/YOUR_IMAGE.jpg",
  },
  "spain-intermediary-model_portfolios": {
    header: "Soluciones de inversión escalables para asesores",
    body: "Carteras modelo e información de mercado para intermediarios en España.",
    button_text: "Explorar soluciones para asesores",
    image: "https://images.contentstack.io/v3/assets/blt336c04d12909ff8e/blta9299274a3982de0/6a2aaa68e75dac10a05140ee/Gemini_Generated_Image_zckf8bzckf8bzckf.png",
  },
};

export default function Hero({ content, locale, withHeader, cslp }) {
  const pathname = usePathname();
  const [demoContext, setDemoContext] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("demo_context");

    if (saved) {
      try {
        setDemoContext(JSON.parse(saved));
      } catch (error) {
        console.warn("Invalid demo_context in localStorage", error);
      }
    }

    function handleContextChange(event) {
      setDemoContext(event.detail);
    }

    window.addEventListener("demo_context_changed", handleContextChange);

    return () => {
      window.removeEventListener("demo_context_changed", handleContextChange);
    };
  }, []);

  if (!content || content?.length === 0) return <div></div>;

  let positionClass = "";
  let headlineClass = "";
  let bodyClass = "";
  let buttonClass = "";

  const demoKey = demoContext
    ? `${demoContext.country}-${demoContext.audience}-${demoContext.interest}`
    : null;

  const demoHero = demoKey ? demoHeroExperiences[demoKey] : null;

  if (content && content?.length > 0) {
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

  if (content && content?.length > 0) {
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

  if (content && content?.length) {
    if (content?.[0]?.header_overlay !== true) {
      withHeader = false;
    }
  }

  return (
    <>
      {!withHeader && pathname === `/${locale}` && <Header locale={locale} />}

      <motion.div
        inital="offscreen"
        whileInView="onscreen"
        viewport={{ once: true }}
      >
        <div>
          {content?.map((hero, index) => {
            let aspectRatioClass = "aspect-video";

            if (hero?.aspect_ratio === "16:9") {
              aspectRatioClass = "aspect-video";
            } else if (hero?.aspect_ratio === "3:2") {
              aspectRatioClass = "aspect-[3/2]";
            } else if (hero?.aspect_ratio === "2:1") {
              aspectRatioClass = "aspect-[2/1]";
            } else if (hero?.aspect_ratio === "21:9") {
              aspectRatioClass = "aspect-[21/9]";
            }

            const mediaOpacity = hero?.media_overlay || "75%";
            const imageFile = demoHero?.image || hero?.image_options?.image?.url || null;
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

            const heroHeader = demoHero?.header || hero?.header;
            const heroBody = demoHero?.body || hero?.body;
            const heroButtonText = demoHero?.button_text || hero?.button_text;

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
                    loop={
                      videoControls === "Autoplay"
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
                    style={{ opacity: mediaOpacity }}
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
                        {heroHeader}
                      </h1>

                      <p
                        className={"mt-8 text-left text-white " + bodyClass}
                        style={{
                          fontSize: hero?.body_text_size
                            ? hero?.body_text_size
                            : "16px",
                        }}
                        {...hero?.$?.body}
                      >
                        {heroBody}
                      </p>

                      {heroButtonText !== "" && (
                        <div
                          className={
                            "mt-10 flex items-center gap-x-6 " + buttonClass
                          }
                        >
                          {hero?.page && (
                            <Link
                              href={
                                hero?.page?.length > 0 && hero?.page?.[0]?.url
                                  ? hero?.page?.[0]?.url
                                  : "#"
                              }
                              className="rounded-md button px-8 py-4 text-md tracking-widest uppercase font-bold text-white shadow-sm ring-2 ring-inset ring-gray-300 hover:text-neutral-700 hover:bg-gray-50"
                              {...hero?.$?.button_text}
                            >
                              {heroButtonText}
                            </Link>
                          )}
                        </div>
                      )}
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