import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import App from "./App.tsx";
import "./index.css";
import { LanguageProvider } from "./lib/i18n";

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
    // Skip controller to activate new SW immediately, then reload once
    updateSW(true);
    // Small delay to let the new SW activate before reload
    setTimeout(() => window.location.reload(), 300);
  },
  onRegisteredSW(_, registration) {
    if (!registration) return;
    // Check for updates every 5 minutes (not every minute — reduces load)
    setInterval(() => registration.update(), 5 * 60_000);
  },
});

createRoot(document.getElementById("root")!).render(
  <LanguageProvider>
    <App />
  </LanguageProvider>
);
