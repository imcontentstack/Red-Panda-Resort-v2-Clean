"use client";

import { useEffect, useRef } from "react";

function flattenObject(obj, prefix = "", result = {}) {
 if (!obj || typeof obj !== "object") return result;

 for (const [key, value] of Object.entries(obj)) {
   const safeKey = prefix ? `${prefix}_${key}` : key;

   if (value === undefined || value === null) continue;

   if (Array.isArray(value)) {
     if (value.length === 0) {
       result[safeKey] = "";
     } else if (value.every((item) => typeof item !== "object")) {
       result[safeKey] = value.join("|");
     } else {
       value.forEach((item, index) => {
         if (typeof item === "object" && item !== null) {
           flattenObject(item, `${safeKey}_${index}`, result);
         } else {
           result[`${safeKey}_${index}`] = item;
         }
       });
     }
   } else if (typeof value === "object") {
     flattenObject(value, safeKey, result);
   } else {
     result[safeKey] = value;
   }
 }

 return result;
}

export default function TrackingEventEmitter({ entry }) {
 const sentRef = useRef(false);

 useEffect(() => {
   if (!entry?.uid) return;
   if (sentRef.current) return;

   const campaignSection = entry?.campaigns_section || {};
   const contextSection = entry?._context || {};

   const dataLayerPayload = {
     event: "campaign_context",
     page_title: entry?.title || "",
     page_uid: entry?.uid || "",
     url: entry?.url || "",
     locale: entry?.locale || "",
     campaigns_section: campaignSection,
     _context: contextSection,
   };

   window.dataLayer = window.dataLayer || [];
   window.dataLayer.push(dataLayerPayload);
   console.log("DATA LAYER PUSH:", dataLayerPayload);

   const lyticsPayload = {
     event: "campaign_context",
     page_title: entry?.title || "",
     page_uid: entry?.uid || "",
     url: entry?.url || "",
     locale: entry?.locale || "",
     ...flattenObject(campaignSection),
     ...flattenObject(contextSection, "context"),
   };

   console.log("LYTICS PAYLOAD:", lyticsPayload);

   const trySend = (attempt = 1) => {
     if (typeof window !== "undefined" && window.jstag?.send) {
       window.jstag.send(lyticsPayload);
       console.log("LYTICS SEND:", lyticsPayload);
       sentRef.current = true;
       return;
     }

     if (attempt < 10) {
       setTimeout(() => trySend(attempt + 1), 500);
     } else {
       console.warn("LYTICS jstag not available after retries");
     }
   };

   trySend();
 }, [entry]);

 return null;
}