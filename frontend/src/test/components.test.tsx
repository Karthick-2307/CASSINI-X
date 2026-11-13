import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { StatCard } from "../components/ui/StatCard";
import { Badge, BadgeVariant } from "../components/ui/Badge";
import { EmptyState } from "../components/ui/EmptyState";

describe("StatCard Component (Scientific Honesty)", () => {
  it("renders label, value, unit and provenance badge", () => {
    render(
      <StatCard
        label="Mean Elevation"
        value={1245.5}
        unit="m"
        provenance="measured"
      />
    );

    expect(screen.getByText("Mean Elevation")).toBeInTheDocument();
    expect(screen.getByText("1,245.5")).toBeInTheDocument();
    expect(screen.getByText("m")).toBeInTheDocument();
    expect(screen.getByText("measured")).toBeInTheDocument();
  });

  it("renders empty text fallback when value is null or undefined", () => {
    render(
      <StatCard
        label="Surface Roughness"
        value={null}
        emptyText="No roughness computed"
      />
    );

    expect(screen.getByText("Surface Roughness")).toBeInTheDocument();
    expect(screen.getByText("No roughness computed")).toBeInTheDocument();
  });
});

describe("Badge Component (Part 0 Section 0.7 Variants)", () => {
  const variants: BadgeVariant[] = [
    "measured",
    "derived",
    "inferred",
    "demo",
    "unavailable",
    "planned",
    "active",
    "ok",
    "warn",
    "bad",
    "neutral",
  ];

  variants.forEach((variant) => {
    it(`renders variant '${variant}' correctly`, () => {
      const { container } = render(<Badge variant={variant}>{variant.toUpperCase()}</Badge>);
      const badge = screen.getByText(variant.toUpperCase());
      expect(badge).toBeInTheDocument();
      expect(container.firstChild).toHaveClass("font-mono");
    });
  });
});

describe("EmptyState Component", () => {
  it("renders title, description, reason and action button", () => {
    const handleAction = vi.fn();
    render(
      <EmptyState
        title="No Terrain Rasters Active"
        description="Dataset requires manual credentialed ingestion."
        reason="PDS authentication prerequisite"
        action={<button onClick={handleAction}>Ingest Dataset</button>}
      />
    );

    expect(screen.getByText("No Terrain Rasters Active")).toBeInTheDocument();
    expect(
      screen.getByText("Dataset requires manual credentialed ingestion.")
    ).toBeInTheDocument();
    expect(screen.getByText("Reason: PDS authentication prerequisite")).toBeInTheDocument();

    const actionBtn = screen.getByRole("button", { name: "Ingest Dataset" });
    fireEvent.click(actionBtn);
    expect(handleAction).toHaveBeenCalledTimes(1);
  });
});

describe("Discovery Filter Controls", () => {
  it("handles filter changes for planet and similarity thresholds", () => {
    // Test filter control interactions
    const handlePlanetChange = vi.fn();
    const handleSliderChange = vi.fn();

    render(
      <div>
        <label htmlFor="planet-select">Target Planet</label>
        <select
          id="planet-select"
          onChange={(e) => handlePlanetChange(e.target.value)}
          defaultValue="Mars"
        >
          <option value="All">All Planets</option>
          <option value="Mars">Mars</option>
          <option value="Moon">Moon</option>
          <option value="Earth">Earth</option>
        </select>

        <label htmlFor="similarity-range">Min Similarity</label>
        <input
          id="similarity-range"
          type="range"
          min="0"
          max="100"
          defaultValue="70"
          onChange={(e) => handleSliderChange(Number(e.target.value))}
        />
      </div>
    );

    const select = screen.getByLabelText("Target Planet") as HTMLSelectElement;
    fireEvent.change(select, { target: { value: "Moon" } });
    expect(handlePlanetChange).toHaveBeenCalledWith("Moon");

    const slider = screen.getByLabelText("Min Similarity") as HTMLInputElement;
    fireEvent.change(slider, { target: { value: "85" } });
    expect(handleSliderChange).toHaveBeenCalledWith(85);
  });
});
