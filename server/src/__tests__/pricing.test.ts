import { computeMinSellPrice } from "../utils/pricing";

describe("computeMinSellPrice", () => {
  it("calculates correctly with 25% margin", () => {
    // 80 * (1 + 25/100) = 80 * 1.25 = 100
    expect(computeMinSellPrice(80, 25)).toBe(100);
  });

  it("calculates correctly with 20% margin", () => {
    // 30 * (1 + 20/100) = 30 * 1.2 = 36
    expect(computeMinSellPrice(30, 20)).toBe(36);
  });

  it("calculates correctly with 15% margin", () => {
    // 45 * (1 + 15/100) = 45 * 1.15 = 51.75
    expect(computeMinSellPrice(45, 15)).toBe(51.75);
  });

  it("returns cost price when margin is 0%", () => {
    expect(computeMinSellPrice(100, 0)).toBe(100);
  });

  it("returns 0 when cost price is 0", () => {
    expect(computeMinSellPrice(0, 50)).toBe(0);
  });

  it("handles decimal cost prices", () => {
    // 99.99 * (1 + 10/100) = 99.99 * 1.1 = 109.989 → rounded to 109.99
    expect(computeMinSellPrice(99.99, 10)).toBe(109.99);
  });

  it("handles large margin percentages", () => {
    // 50 * (1 + 200/100) = 50 * 3 = 150
    expect(computeMinSellPrice(50, 200)).toBe(150);
  });
});
