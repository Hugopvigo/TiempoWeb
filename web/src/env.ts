export const envOwmApiKey: string = typeof __VITE_OWM_API_KEY__ !== "undefined" ? __VITE_OWM_API_KEY__ : "";
export const envAemetApiKey: string = typeof __VITE_AEMET_API_KEY__ !== "undefined" ? __VITE_AEMET_API_KEY__ : "";

declare const __VITE_OWM_API_KEY__: string;
declare const __VITE_AEMET_API_KEY__: string;
