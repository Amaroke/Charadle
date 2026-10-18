import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SakuraPetals } from "@/components/SakuraPetals";

describe("SakuraPetals", () => {
  it("renders the requested number of petals", () => {
    render(<SakuraPetals count={12} />);
    expect(screen.getByTestId("sakura-petals").children).toHaveLength(12);
  });

  it("is hidden from assistive technologies", () => {
    render(<SakuraPetals count={3} />);
    expect(screen.getByTestId("sakura-petals")).toHaveAttribute("aria-hidden", "true");
  });

  it("shows only half of the petals on small screens", () => {
    render(<SakuraPetals count={10} />);
    const petals = Array.from(screen.getByTestId("sakura-petals").children);
    expect(petals.filter((petal) => petal.classList.contains("hidden"))).toHaveLength(5);
  });
});
