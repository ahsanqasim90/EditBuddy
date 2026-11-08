const root = document.documentElement;
const isLocalPreview = location.hostname === "127.0.0.1" || location.hostname === "localhost";

if (isLocalPreview) {
  window.__XENVORA_USER__ = { displayName: "Preview Creator", email: "preview@xenvora.local" };
  root.classList.remove("auth-pending");
  root.classList.add("auth-ready");
} else try {
  const response = await fetch("/api/auth/me", { cache: "no-store", credentials: "same-origin" });
  if (!response.ok) {
    window.top?.location.replace("/account?reason=signin-required");
  } else {
    const state = await response.json();
    window.__XENVORA_USER__ = state.user;
    root.classList.remove("auth-pending");
    root.classList.add("auth-ready");
  }
} catch {
  window.top?.location.replace("/account?reason=signin-required");
}
