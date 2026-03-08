import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import App from "./App.tsx";
import "./index.css";

// Capture beforeinstallprompt globally so it's never missed
window.__pwaInstallPrompt = null;
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  window.__pwaInstallPrompt = e;
  window.dispatchEvent(new CustomEvent("pwa-prompt-ready"));
});

// Clear all stale caches on startup to prevent UI inconsistencies
async function clearStaleCaches() {
  if ('caches' in window) {
    const cacheNames = await caches.keys();
    const staleCaches = cacheNames.filter(
      name => name.startsWith('workbox-') || name.startsWith('sw-')
    );
    await Promise.all(staleCaches.map(name => caches.delete(name)));
  }
}

clearStaleCaches();

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
