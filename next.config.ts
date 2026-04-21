import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  reactStrictMode: false,
  devIndicators: false,
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'wtxrbukgejhzplfwzamn.supabase.co',
                pathname: '**',
            },
            {
                protocol: 'https',
                hostname: 'images.contentstack.io',
                pathname: '**',
            },
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
                pathname: '**',
            },
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
                pathname: '**',
            }
        ],
    },
    env:{
        CONTENTSTACK_API_KEY: process.env.CONTENTSTACK_API_KEY,
        CONTENTSTACK_DELIVERY_TOKEN: process.env.CONTENTSTACK_DELIVERY_TOKEN,
        CONTENTSTACK_ENVIRONMENT: process.env.CONTENTSTACK_ENVIRONMENT,
        CONTENTSTACK_BRANCH: process.env.CONTENTSTACK_BRANCH,
        CONTENTSTACK_CDN_HOST: process.env.CONTENTSTACK_CDN_HOST || 'cdn.contentstack.io',
        CONTENTSTACK_APP_HOST: process.env.CONTENTSTACK_APP_HOST || 'app.contentstack.com',

        CONTENTSTACK_REGION: process.env.CONTENTSTACK_REGION,
        CONTENTSTACK_PREVIEW_TOKEN: process.env.CONTENTSTACK_PREVIEW_TOKEN,
        CONTENTSTACK_PREVIEW_HOST: process.env.CONTENTSTACK_PREVIEW_HOST,
        CONTENTSTACK_PERSONALIZATION: process.env.CONTENTSTACK_PERSONALIZATION,
        CONTENTSTACK_PERSONALIZE_EDGE_API_URL: typeof process.env.CONTENTSTACK_PERSONALIZE_EDGE_API_URL === 'string' ? (!process.env.CONTENTSTACK_PERSONALIZE_EDGE_API_URL.includes('https://') ? `https://${process.env.CONTENTSTACK_PERSONALIZE_EDGE_API_URL}` : process.env.CONTENTSTACK_PERSONALIZE_EDGE_API_URL) : 'https://personalize-edge.contentstack.com',   
        LYTICS_TAG: process.env.LYTICS_TAG,
        LIVE_PREVIEW_ENABLED: process.env.LIVE_PREVIEW_ENABLED,
        HOSTING: process.env.HOSTING,
        CONTENTSTACK_AUTOMATIONS_API_URL: process.env.CONTENTSTACK_AUTOMATIONS_API_URL,
        LYTICS_API_KEY: process.env.LYTICS_API_KEY,
        LYTICS_COLLECTION_ID: process.env.LYTICS_COLLECTION_ID,
        CONTENTSTACK_TERM: process.env.CONTENTSTACK_TERM,

        NEXT_PUBLIC_SUPABASE_URL: typeof process.env.NEXT_PUBLIC_SUPABASE_URL === 'string' && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('https://') ? `https://${process.env.NEXT_PUBLIC_SUPABASE_URL}` : process.env.NEXT_PUBLIC_SUPABASE_URL,

        RED_PANDA_COMMERCE_STORE_ID: process.env.RED_PANDA_COMMERCE_STORE_ID,
        RED_PANDA_COMMERCE_STORE_TOKEN: process.env.RED_PANDA_COMMERCE_STORE_TOKEN,
        RED_PANDA_COMMERCE_API_URL: typeof process.env.RED_PANDA_COMMERCE_API_URL === 'string' && !process.env.RED_PANDA_COMMERCE_API_URL.includes('https://') ? `https://${process.env.RED_PANDA_COMMERCE_API_URL}` : process.env.RED_PANDA_COMMERCE_API_URL,

        NEXT_PUBLIC_OAUTH_URL: typeof process.env.NEXT_PUBLIC_OAUTH_URL === 'string' && !process.env.NEXT_PUBLIC_OAUTH_URL.includes('https://') ? `https://${process.env.NEXT_PUBLIC_OAUTH_URL}` : process.env.NEXT_PUBLIC_OAUTH_URL,
        NEXT_PUBLIC_OAUTH_CLIENT_ID: process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID,
    }   
};

export default withNextIntl(nextConfig);
