import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { HelmetProvider } from "react-helmet-async";
import { SEO } from "../SEO";

function renderWithHelmet(ui: React.ReactElement) {
  return render(<HelmetProvider>{ui}</HelmetProvider>);
}

describe("SEO", () => {
  it("renders without crashing with no props", () => {
    const { container } = renderWithHelmet(<SEO />);
    expect(container).toBeTruthy();
  });

  it("renders with a title", () => {
    const { container } = renderWithHelmet(<SEO title="Test Page" />);
    expect(container).toBeTruthy();
  });

  it("accepts all optional props without throwing", () => {
    const { container } = renderWithHelmet(
      <SEO
        title="Nile Delta — Discover Rural Egypt"
        description="Flamingos, fishing villages, and the agricultural heartland."
        image="/og-image.png"
        url="/regions/nile-delta"
        type="article"
        noindex={false}
      />
    );
    expect(container).toBeTruthy();
  });

  it("renders noindex variant without throwing", () => {
    const { container } = renderWithHelmet(<SEO noindex />);
    expect(container).toBeTruthy();
  });
});
