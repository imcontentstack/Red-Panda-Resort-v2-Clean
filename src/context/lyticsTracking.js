"use client";
import { useEffect, useState } from "react";
import { useParams, usePathname } from "next/navigation";

const snippet = `!function(){"use strict";var c=window.jstag||(window.jstag={}),a=[];function n(o){c[o]=function(){for(var n=arguments.length,t=new Array(n),r=0;r<n;r++)t[r]=arguments[r];return a.push([o,t]),c}}function t(i){c[i]=function(){for(var n=!1,t=function(){n=!0},r=arguments.length,o=new Array(r),e=0;e<r;e++)o[e]=arguments[e];return a.push([i,o,function(){return n},function(n){t=function(){n()}}]),t}}n("send"),n("mock"),n("identify"),n("pageView"),n("unblock"),n("getid"),n("setid"),n("call"),t("on"),t("once"),c.asyncVersion="3.0.37",c.loadScript=function(n,t,r){var o=document.createElement("script");o.async=!0,o.src=n,o.onload=t,o.onerror=r;var e=document.getElementsByTagName("script")[0],i=e&&e.parentNode||document.head||document.body,c=e||i.lastChild;return null!=c?i.insertBefore(o,c):i.appendChild(o),this},c.init=function n(t){return c.config=t,c.loadScript(t.src,function(){if(c.init===n)throw new Error("Load error!");c.init(c.config),function(){for(var n=0;n<a.length;n++){var t=a[n][0],r=a[n][1],o=a[n][2],e=a[n][3];if(!o||!o()){var i=c[t].apply(c,r);e&&e(i)}}a=void 0}()}),c}}();`;

// ---------------------------------------------------------------------------
// Cookie helpers
// ---------------------------------------------------------------------------

function invalidatePersonalizeManifest() {
  if (typeof document === "undefined") return;
  document.cookie =
    "cs-personalize-manifest=; path=/; max-age=0; SameSite=Lax";
}

// ---------------------------------------------------------------------------
// jstag initialisation
// ---------------------------------------------------------------------------

export const useJstag = () => {
  if (typeof jstag === "undefined" && typeof window !== "undefined") {
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.text = snippet;
    document.head.appendChild(script);

    jstag.init({
      src: `https://c.lytics.io/api/tag/${process.env.LYTICS_TAG || "your-lytics-tag"}/latest.min.js`,
      audit: { level: "carp" },
      contentstack: {
        entityPush: {
          poll: {
            disabled: false,
          },
        },
      },
    });
  }
  if (typeof jstag !== "undefined") {
    return jstag;
  }
  return undefined;
};

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

export const useRecommendations = () => {
  const jstag = useJstag();
  const [recommendations, setRecommendations] = useState({});
  const [cstackRecs, setCstackRecs] = useState({});
  const [queryRefresher, setQueryRefresher] = useState(1);
  const [queryTrigger, setQueryTrigger] = useState(1);
  const params = useParams();

  useEffect(() => {
    setQueryRefresher(queryRefresher + 1);
    if (queryRefresher % 3 === 0) {
      setQueryTrigger(queryTrigger + 1);
    }
  }, [params]);

  const fetchRecommendations = async (id) => {
    if (process.env.LYTICS_COLLECTION_ID) {
      try {
        const res = await fetch(`/api/recommendations/${id}`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        setRecommendations(data);
        console.log("recommendations from d&i api", data);
        return data;
      } catch (error) {
        console.error("Failed to fetch recommendations:", error);
      }
    }
  };

  async function getElementsByUrls(urls, locale, references = []) {
    console.log("ran contentstack query");
    const promises = urls.map((url) => {
      return Stack.getElementByUrlWithRefs(
        "article",
        `/${url?.path}`,
        locale,
        references
      );
    });

    try {
      const results = await Promise.all(promises);
      setCstackRecs(results);
      return results;
    } catch (error) {
      console.error("Error fetching one or more entries:", error);
      throw error;
    }
  }

  useEffect(() => {
    if (jstag) {
      jstag.getid(function (id) {
        console.log("setting cookie");
        fetchRecommendations(id);
      });
    }
  }, [queryTrigger]);

  useEffect(() => {
    if (recommendations?.data) {
      const items = Object.values(recommendations.data).map((item) => {
        const urlParts = item.url.split("/");
        const path = urlParts.slice(2).join("/");
        const aspect = item?.aspects?.[0] || null;
        return { path, aspect };
      });
      getElementsByUrls(items, params?.locales, []);
    }
  }, [recommendations]);

  return cstackRecs;
};

export const useEntity = () => {
  const jstag = useJstag();
  const [entity, setEntity] = useState(null);

  useEffect(() => {
    const off = jstag.on("entity.loaded", (_, entity) => {
      setEntity(entity);
    });
    return () => {
      off();
    };
  }, []);

  return entity;
};

// ---------------------------------------------------------------------------
// useTopUnpurchasedProduct  ← NEW
// ---------------------------------------------------------------------------
//
// Reads the current Lytics profile on homepage load, finds the product with
// the highest view count the user has not yet purchased, and sends it back
// to Lytics as `top_unpurchased_product`.
//
// Depends on two profile fields built by Conductor:
//   - product_view_counts     map[string]int  (Pipeline 1)
//   - purchased_product_ids   []string        (from purchase events)
//
// Writes to:
//   - top_unpurchased_product  string  (Pipeline 2, mergeop: latest)
//
// ⚠️  If your purchase events write to a different field name, update
//     `purchased_product_ids` below to match.
//
export const useTopUnpurchasedProduct = () => {
  const jstag = useJstag();

  useEffect(() => {
    console.log("useTopUnpurchasedProduct fired, jstag:", jstag); // ← debug
    if (!jstag) return;

    jstag.call("profile", function (profile) {
      console.log("profile callback fired, profile:", profile); // ← debug
      if (!profile || !profile.data) return;

      const viewCounts = profile.data.product_view_counts || {};
      const purchased = profile.data.purchased_skus || [];

      const topProduct =
        Object.keys(viewCounts)
          .filter((productId) => !purchased.includes(productId))
          .sort((a, b) => viewCounts[b] - viewCounts[a])[0] || null;

      if (topProduct) {
        console.log("Lytics: top unpurchased product →", topProduct);
        jstag.send({ top_unpurchased_product: topProduct });
      } else {
        console.log(
          "Lytics: no unpurchased viewed products on profile — skipping send"
        );
      }
    });
  }, [jstag]);
};

// ---------------------------------------------------------------------------
// LyticsTracking component
// ---------------------------------------------------------------------------

export function LyticsTracking() {
  const jstag = useJstag();
  const pathname = usePathname();

  useEffect(() => {
    if (!jstag) return;
    jstag.pageView();
  }, [pathname, jstag]);

  useEffect(() => {
    if (!jstag) return;
    if (typeof window === "undefined") return;

    const attemptReinitialize = () => {
      if (window.pathfora?.clearAll && window.pathfora?.triggerWidgets) {
        window.pathfora.clearAll();
        window.pathfora.triggerWidgets();
      }
    };

    const timer = setTimeout(attemptReinitialize, 300);
    return () => clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    if (!jstag) return;

    const off = jstag.on("audience.change", (_, audienceData) => {
      console.log(
        "Lytics audience changed — invalidating Personalize manifest and reloading",
        audienceData
      );
      invalidatePersonalizeManifest();
      window.location.reload();
    });

    return () => {
      off();
    };
  }, [jstag]);

  return <></>;
}