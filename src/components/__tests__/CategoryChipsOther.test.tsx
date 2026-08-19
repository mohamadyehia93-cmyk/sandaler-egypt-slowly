import { render, screen, fireEvent } from "@testing-library/react";
import { useState } from "react";
import { describe, it, expect } from "vitest";
import CategoryChips from "../CategoryChips";

const Harness = () => {
  const [v, setV] = useState("");
  return (
    <>
      <CategoryChips options={[{ value: "Nature", label: "Nature" }]} value={v} onChange={setV} />
      <span data-testid="stored">{v}</span>
    </>
  );
};

describe("CategoryChips Other input", () => {
  it("keeps typed text that collides with a known option value", () => {
    render(<Harness />);
    fireEvent.click(screen.getByText("Other (specify)"));
    const input = screen.getByPlaceholderText("Type the category…") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "Nature" } });
    expect(input.value).toBe("Nature");
    expect(screen.getByTestId("stored").textContent).toBe("Nature");
    fireEvent.change(input, { target: { value: "Nature walks" } });
    expect((screen.getByPlaceholderText("Type the category…") as HTMLInputElement).value).toBe("Nature walks");
    expect(screen.getByTestId("stored").textContent).toBe("Nature walks");
  });
});
