/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#3B82F6',
                secondary: '#10B981',
                accent: '#F59E0B',
                neutral: '#1F2937',
            },
        },
    },
    plugins: [require('daisyui')],
    daisyui: {
        themes: [
            {
                light: {
                    ...require("daisyui/src/theming/themes")["light"],
                    primary: "#3B82F6",
                    secondary: "#10B981",
                    accent: "#F59E0B",
                },
                dark: {
                    ...require("daisyui/src/theming/themes")["dark"],
                    primary: "#3B82F6",
                    secondary: "#10B981",
                    accent: "#F59E0B",
                },
            },
        ],
        darkTheme: "dark",
        base: true,
        styled: true,
        utils: true,
    },
}
