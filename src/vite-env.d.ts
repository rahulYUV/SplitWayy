/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_EMAILJS_SERVICE_ID: string
    readonly VITE_EMAILJS_WELCOME_SERVICE_ID: string
    readonly VITE_EMAILJS_TEMPLATE_ID: string
    readonly VITE_EMAILJS_WELCOME_TEMPLATE_ID: string
    readonly VITE_EMAILJS_PUBLIC_KEY: string
    // Add other env vars here if needed
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
