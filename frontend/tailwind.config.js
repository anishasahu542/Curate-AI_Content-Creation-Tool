/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./store/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        "surface-bright": "#fbf8ff",
        "surface-tint": "#725858",
        "on-error": "#ffffff",
        "on-error-container": "#93000a",
        "on-tertiary": "#ffffff",
        "surface": "#fbf8ff",
        "on-primary-fixed-variant": "#594141",
        "on-secondary-fixed": "#131e15",
        "on-surface": "#1a1b21",
        "error-container": "#ffdad6",
        "secondary": "#556256",
        "tertiary": "#6c5754",
        "primary-fixed": "#fddada",
        "on-surface-variant": "#4f4444",
        "surface-container-high": "#e9e7ef",
        "error": "#ba1a1a",
        "on-primary-container": "#fffbff",
        "surface-container-lowest": "#ffffff",
        "surface-variant": "#e3e1e9",
        "on-primary": "#ffffff",
        "secondary-container": "#d6e3d4",
        "surface-container-low": "#f4f2fa",
        "on-background": "#1a1b21",
        "surface-container": "#efedf5",
        "primary": "#6f5656",
        "outline-variant": "#d3c3c2",
        "surface-container-highest": "#e3e1e9",
        "tertiary-fixed": "#f9dcd8",
        "secondary-fixed": "#d9e6d7",
        "on-secondary": "#ffffff",
        "primary-container": "#8a6e6e",
        "on-secondary-container": "#59665a",
        "on-tertiary-fixed": "#271816",
        "on-secondary-fixed-variant": "#3e4a3f",
        "surface-dim": "#dbd9e1",
        "inverse-surface": "#2f3036",
        "tertiary-fixed-dim": "#dcc0bc",
        "on-tertiary-fixed-variant": "#56423f",
        "secondary-fixed-dim": "#bdcabc",
        "on-tertiary-container": "#fffbff",
        "primary-fixed-dim": "#e0bfbe",
        "outline": "#817474",
        "tertiary-container": "#866f6c",
        "inverse-primary": "#e0bfbe",
        "on-primary-fixed": "#291617",
        "inverse-on-surface": "#f1f0f8"
      },
      fontFamily: {
        "playfair": ["Playfair Display", "serif"],
        "dm-sans": ["DM Sans", "sans-serif"]
      },
      fontSize: {
        "headline-md": ["28px", { lineHeight: "36px", fontWeight: "500" }],
        "body-md": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "display-lg": ["64px", { lineHeight: "72px", letterSpacing: "-0.02em", fontWeight: "600" }],
        "label-md": ["14px", { lineHeight: "20px", letterSpacing: "0.05em", fontWeight: "500" }],
        "headline-lg": ["40px", { lineHeight: "48px", fontWeight: "500" }],
        "body-lg": ["18px", { lineHeight: "28px", fontWeight: "400" }]
      }
    },
  },
  plugins: [],
}
