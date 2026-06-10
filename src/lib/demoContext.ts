// lib/demoContext.ts

export type DemoContext = {
  country: "uk" | "france" | "spain";
  audience: "individual" | "institutional" | "intermediary";
  interest: "retirement" | "private_assets" | "model_portfolios";
};

export const defaultDemoContext: DemoContext = {
  country: "uk",
  audience: "individual",
  interest: "retirement",
};