"use client";

export async function exitFullscreenIfActive() {
  if (typeof document === "undefined" || !document.fullscreenElement) return;

  try {
    await document.exitFullscreen();
  } catch {
    // Browser fullscreen exit can reject if the document changes state mid-transition.
  }
}
