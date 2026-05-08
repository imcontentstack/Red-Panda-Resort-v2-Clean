"use client";

import { useTopUnpurchasedProduct } from "@/context/lyticsTracking";

export default function LyticsHomepageSync() {
  useTopUnpurchasedProduct();
  return null;
}