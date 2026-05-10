import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/theme";
import { envOwmApiKey, envAemetApiKey } from "@/env";
import { configureAEMET, isAEMETConfigured } from "@shared/services/aemet";
import Home from "@/routes/Home";
import Search from "@/routes/Search";

if (envAemetApiKey && !isAEMETConfigured()) {
  configureAEMET(envAemetApiKey);
}

const envSettings: Partial<{ openWeatherMapApiKey: string; aemetApiKey: string }> = {};
if (envOwmApiKey) envSettings.openWeatherMapApiKey = envOwmApiKey;
if (envAemetApiKey) envSettings.aemetApiKey = envAemetApiKey;
if (Object.keys(envSettings).length > 0) {
  const stored = localStorage.getItem("tiempo-settings");
  const current = stored ? JSON.parse(stored) : {};
  const merged = { ...current, ...envSettings };
  localStorage.setItem("tiempo-settings", JSON.stringify(merged));
}

const Tides = lazy(() => import("@/routes/Tides"));
const MapRoute = lazy(() => import("@/routes/Map"));
const Settings = lazy(() => import("@/routes/Settings"));
const AlertDetail = lazy(() => import("@/routes/AlertDetail"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function LoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/search" element={<Search />} />
              <Route path="/tides" element={<Tides />} />
              <Route path="/map" element={<MapRoute />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/alert/:id" element={<AlertDetail />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
