/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/**/*.{js,jsx,ts,tsx}",
        "./node_modules/react-tailwindcss-datepicker/dist/index.esm.{js,ts}",
    ],
    darkMode: 'false',
    theme: {
        extend: {
            fontFamily: {
                poppins: ['var(--font-poppins)'],
                cinzel: ['var(--font-cinzel)'],
                monteserrat: ['var(--font-monteserrat)'],
                roboto: ['var(--font-roboto)'],
                playfair: ['var(--font-playfair)'],
                raleway: ['var(--font-raleway)'],
                opensans: ['var(--font-opensans)'],
                spectral: ['var(--font-spectral)'],
                rokkitt: ['var(--font-rokkitt)'],
                cormorant: ['var(--font-cormorant)'],
                lexend: ['var(--font-lexend)'],
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-conic":
                    "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
            },
            maxWidth: {
                '8xl': '1440px'
            },
            animation: {
                fadeIn: 'fadeIn 1s ease-in-out',
                'infinite-scroll': 'infinite-scroll 60s linear infinite',
            },
            keyframes: theme => ({
                fadeIn: {
                    'from': { opacity: '0' },
                    'to': { opacity: '1' }
                },
                'infinite-scroll': {
                    '0%': { transform: 'translateX(0%)' },
                    '100%': { transform: 'translateX(-100%)' },
                },
                bounce: {
                    '0%, 100%': {
                        transform: 'translateY(-50%)', // Increased bounce height
                        animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)',
                    },
                    '50%': {
                        transform: 'none',
                        animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)',
                    },
                },
            })
        },
    },
    plugins: [

    ],
};
