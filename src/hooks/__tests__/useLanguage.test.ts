import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useLanguage } from "../useLanguage";
// Importing the config initialises i18next globally via initReactI18next,
// allowing useTranslation to work in renderHook without an explicit Provider.
import i18n from "@/i18n/config";

describe("useLanguage", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("en");
  });

  it("returns current language and direction", () => {
    const { result } = renderHook(() => useLanguage());
    expect(result.current.lang).toBe("en");
    expect(result.current.dir).toBe("ltr");
    expect(result.current.isRTL).toBe(false);
  });

  it("toggles from English to Arabic", async () => {
    const { result } = renderHook(() => useLanguage());
    expect(result.current.lang).toBe("en");

    await act(async () => {
      result.current.toggle();
    });

    expect(result.current.lang).toBe("ar");
    expect(result.current.dir).toBe("rtl");
    expect(result.current.isRTL).toBe(true);
  });

  it("toggles back from Arabic to English", async () => {
    await i18n.changeLanguage("ar");
    const { result } = renderHook(() => useLanguage());
    expect(result.current.lang).toBe("ar");

    await act(async () => {
      result.current.toggle();
    });

    expect(result.current.lang).toBe("en");
    expect(result.current.isRTL).toBe(false);
  });

  it("sets lang and dir attributes on document.documentElement", async () => {
    await i18n.changeLanguage("ar");
    renderHook(() => useLanguage());
    expect(document.documentElement.lang).toBe("ar");
    expect(document.documentElement.dir).toBe("rtl");
  });
});
