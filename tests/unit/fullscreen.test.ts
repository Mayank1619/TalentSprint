import { afterEach, describe, expect, it, vi } from "vitest";
import { exitFullscreenIfActive } from "@/lib/fullscreen";

const originalDocument = globalThis.document;

afterEach(() => {
  vi.restoreAllMocks();
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: originalDocument,
  });
});

describe("fullscreen helpers", () => {
  it("does nothing when fullscreen is not active", async () => {
    const exitFullscreen = vi.fn();
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: {
        fullscreenElement: null,
        exitFullscreen,
      },
    });

    await exitFullscreenIfActive();

    expect(exitFullscreen).not.toHaveBeenCalled();
  });

  it("exits fullscreen when the document is fullscreen", async () => {
    const exitFullscreen = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: {
        fullscreenElement: {},
        exitFullscreen,
      },
    });

    await exitFullscreenIfActive();

    expect(exitFullscreen).toHaveBeenCalledTimes(1);
  });
});
