const root = document.documentElement;

try {
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
