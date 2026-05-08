"use client";

import { useEffect } from "react";
import { useTopUnpurchasedProduct } from "@/context/lyticsTracking";

export default function LyticsHomepageSync() {
  useEffect(() => {
    console.log("LyticsHomepageSync mounted"); // ← add this
  }, []);
  
  useTopUnpurchasedProduct();
  return null;
}