"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

const snippet = `!function(){"use strict";var c=window.jstag||(window.jstag={}),a=[];function n(o){c[o]=function(){for(var n=arguments.length,t=new Array(n),r=0;r<n;r++)t[r]=arguments[r];return a.push([o,t]),c}}function t(i){c[i]=function(){for(var n=!1,t=function(){n=!0},r=arguments.length,o=new Array(r),e=0;e<r;e++)o[e]=arguments[e];return a.push([i,o,function(){return n},function(n){t=function(){n()}}]),t}}n("send"),n("mock"),n("identify"),n("pageView"),n("unblock"),n("getid"),n("setid"),n("call"),t("on"),t("once"),c.asyncVersion="3.0.37",c.loadScript=function(n,t,r){var o=document.createElement("script");o.async=!0,o.src=n,o.onload=t,o.onerror=r;var e=document.getElementsByTagName("script")[0],i=e&&e.parentNode||document.head||document.body,c=e||i.lastChild;return null!=c?i.insertBefore(o,c):i.appendChild(o),this},c.init=function n(t){return c.config=t,c.loadScript(t.src,function(){if(c.init===n)throw new Error("Load error!");c.init(c.config),function(){for(var n=0;n<a.length;n++){var t=a[n][0],r=a[n][1],o=a[n][2],e=a[n][3];if(!o||!o()){var i=c[t].apply(c,r);e&&e(i)}}a=void 0}()}),c}}();`;

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
            //initialDelay: 1000,
            //maxAttempts: 10
            //this is the most aggressive version of polling
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

export const useRecommendations = () => {
  const jstag = useJstag();
  const [recommendations, setRecommendations] = useState({});
  const [cstackRecs, setCstackRecs ] = useState({});
  const [queryRefresher, setQueryRefresher] = useState(1);
  const [queryTrigger, setQueryTrigger] = useState(1);
  const params = useParams();

  useEffect(() => {
    setQueryRefresher(queryRefresher + 1);
    if((queryRefresher % 3 === 0)){
      setQueryTrigger(queryTrigger + 1); // tracker to refresh lytics recommendation api query every 3 path changes
    }
  }, [params])

  const fetchRecommendations = async (id) => {
  if (process.env.LYTICS_COLLECTION_ID){try {
    const res = await fetch(`/api/recommendations/${id}`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    //console.log("ran recommendations query")
    setRecommendations(data);
    console.log("recommendations from d&i api", data)
    return data;
  } catch (error) {
    console.error("Failed to fetch recommendations:", error);
  }}
};

  async function getElementsByUrls(urls, locale, references = []) {
    console.log("ran contentstack query")
  const promises = urls.map((url) => {
    return Stack.getElementByUrlWithRefs("article", `/${url?.path}`, locale, references);
  });

  try {
    const results = await Promise.all(promises);
    setCstackRecs(results);
    return results; // array of entries
  } catch (error) {
    console.error('Error fetching one or more entries:', error);
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
    if (recommendations?.data){
      const items = Object.values(recommendations.data).map(item => {
      const urlParts = item.url.split('/');
      const path = urlParts.slice(2).join('/'); // remove first 2 segments
      const aspect = item?.aspects?.[0] || null;

      return {
        path,
        aspect
      };
      });
      //console.log("items", items)
      getElementsByUrls(items, params?.locales, []);
    }
    
  }, [recommendations]);

  return cstackRecs
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

export function LyticsTracking() {
  const jstag = useJstag();

  useEffect(() => {
    jstag.pageView();
  }, [jstag]);

  return <></>;
}