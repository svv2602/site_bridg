import { describe, it, expect } from "vitest";
import {
  formatSize,
  formatSizes,
  seasonLabels,
  seasonLabelsShort,
  vehicleTypeLabels,
  brandLabels,
  groupBySeason,
  formatVehicleTypes,
} from "./tyres";
import type { TyreModel } from "@/lib/data";

describe("formatSize", () => {
  it("formats basic tyre size", () => {
    expect(formatSize({ width: 205, aspectRatio: 55, diameter: 16 })).toBe("205/55 R16");
  });

  it("formats full size with load and speed index", () => {
    expect(
      formatSize(
        { width: 225, aspectRatio: 45, diameter: 17, loadIndex: 91, speedIndex: "H" },
        true,
      ),
    ).toBe("225/45 R17 91H");
  });

  it("returns dash for null input", () => {
    expect(formatSize(null)).toBe("\u2014");
  });

  it("returns dash for undefined input", () => {
    expect(formatSize(undefined)).toBe("\u2014");
  });

  it("formats without full flag (no load/speed)", () => {
    expect(
      formatSize({ width: 195, aspectRatio: 65, diameter: 15, loadIndex: 91, speedIndex: "T" }),
    ).toBe("195/65 R15");
  });
});

describe("formatSizes", () => {
  it("formats array of sizes", () => {
    const sizes = [
      { width: 205, aspectRatio: 55, diameter: 16 },
      { width: 225, aspectRatio: 45, diameter: 17 },
    ];
    expect(formatSizes(sizes)).toEqual(["205/55 R16", "225/45 R17"]);
  });

  it("returns empty array for empty input", () => {
    expect(formatSizes([])).toEqual([]);
  });
});

describe("seasonLabels", () => {
  it("has all three seasons", () => {
    expect(seasonLabels.summer).toBe("Літні шини");
    expect(seasonLabels.winter).toBe("Зимові шини");
    expect(seasonLabels.allseason).toBe("Всесезонні шини");
  });
});

describe("seasonLabelsShort", () => {
  it("has short forms for all seasons", () => {
    expect(seasonLabelsShort.summer).toBe("Літня");
    expect(seasonLabelsShort.winter).toBe("Зимова");
    expect(seasonLabelsShort.allseason).toBe("Всесезонна");
  });
});

describe("vehicleTypeLabels", () => {
  it("has labels for all vehicle types", () => {
    expect(vehicleTypeLabels.passenger).toBe("Легкові");
    expect(vehicleTypeLabels.suv).toBe("SUV / 4x4");
    expect(vehicleTypeLabels.lcv).toBe("Легкі вантажні");
    expect(vehicleTypeLabels.sport).toBe("Спортивні");
    expect(vehicleTypeLabels.van).toBe("Van/LCV");
  });
});

describe("brandLabels", () => {
  it("has labels for all brands", () => {
    expect(brandLabels.bridgestone).toBe("Bridgestone");
    expect(brandLabels.firestone).toBe("Firestone");
  });
});

describe("groupBySeason", () => {
  it("groups tyres by season", () => {
    const models = [
      { season: "summer", slug: "t1" },
      { season: "winter", slug: "t2" },
      { season: "summer", slug: "t3" },
      { season: "allseason", slug: "t4" },
    ] as TyreModel[];

    const result = groupBySeason(models);
    expect(result.summer).toHaveLength(2);
    expect(result.winter).toHaveLength(1);
    expect(result.allseason).toHaveLength(1);
  });

  it("handles empty array", () => {
    const result = groupBySeason([]);
    expect(result.summer).toHaveLength(0);
    expect(result.winter).toHaveLength(0);
    expect(result.allseason).toHaveLength(0);
  });
});

describe("formatVehicleTypes", () => {
  it("formats single vehicle type", () => {
    const model = { vehicleTypes: ["passenger"] } as TyreModel;
    expect(formatVehicleTypes(model)).toBe("Легкові авто");
  });

  it("formats multiple vehicle types", () => {
    const model = { vehicleTypes: ["passenger", "suv"] } as TyreModel;
    expect(formatVehicleTypes(model)).toBe("Легкові авто, SUV");
  });

  it("returns default for empty array", () => {
    const model = { vehicleTypes: [] } as unknown as TyreModel;
    expect(formatVehicleTypes(model)).toBe("Універсальні");
  });
});
