// Capture the beforeinstallprompt event for later use
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  (window as any).__pwaInstallPrompt = e;
});
