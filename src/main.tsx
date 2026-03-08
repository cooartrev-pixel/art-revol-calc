import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import App from "./App.tsx";
import "./index.css";

// Capture beforeinstallprompt globally so it's never missed
(window as any).__pwaInstallPrompt = null;
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  (window as any).__pwaInstallPrompt = e;
  window.dispatchEvent(new CustomEvent("pwa-prompt-ready"));
});

// Clear ALL caches on startup to prevent stale UI
async function clearAllCaches() {
  if ('caches' in window) {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(name => caches.delete(name)));
  }
  // Unregister stale service workers
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map(r => r.unregister()));
  }
}

clearAllCaches();

const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    updateSW(true);
    setTimeout(() => window.location.reload(), 300);
  },
  onRegisteredSW(_, registration) {
    if (!registration) return;
    setInterval(() => registration.update(), 5 * 60_000);
  },
});

createRoot(document.getElementById("root")!).render(
  <App />
);
