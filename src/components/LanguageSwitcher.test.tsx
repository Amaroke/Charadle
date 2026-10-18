import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

const pathname = vi.hoisted(() => ({ current: "/en" }));

vi.mock("next/navigation", () => ({
  usePathname: () => pathname.current,
}));

const labels = { label: "Language", names: { en: "English", fr: "Français" } };

afterEach(() => {
  document.cookie = "NEXT_LOCALE=; max-age=0; path=/";
});

describe("LanguageSwitcher", () => {
  it("links every language to the current page", () => {
    pathname.current = "/en/daily";
    render(<LanguageSwitcher locale="en" labels={labels} />);
    expect(screen.getByRole("link", { name: "Français" })).toHaveAttribute("href", "/fr/daily");
    expect(screen.getByRole("link", { name: "English" })).toHaveAttribute("href", "/en/daily");
  });

  it("marks the current language", () => {
    pathname.current = "/fr";
    render(<LanguageSwitcher locale="fr" labels={labels} />);
    expect(screen.getByRole("link", { name: "Français" })).toHaveAttribute("aria-current", "true");
    expect(screen.getByRole("link", { name: "English" })).not.toHaveAttribute("aria-current");
  });

  it("is labelled for assistive technologies", () => {
    render(<LanguageSwitcher locale="en" labels={labels} />);
    expect(screen.getByRole("navigation", { name: "Language" })).toBeInTheDocument();
  });

  it("remembers the chosen language", () => {
    pathname.current = "/en";
    render(<LanguageSwitcher locale="en" labels={labels} />);
    fireEvent.click(screen.getByRole("link", { name: "Français" }));
    expect(document.cookie).toContain("NEXT_LOCALE=fr");
  });
});
