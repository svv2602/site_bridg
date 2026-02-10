import { describe, it, expect } from "vitest";
import { pluralize, pluralForm } from "./pluralize";

describe("pluralize", () => {
  const forms = ["розмір", "розміри", "розмірів"] as const;

  it("returns form1 for 1", () => {
    expect(pluralize(1, ...forms)).toBe("1 розмір");
  });

  it("returns form2 for 2-4", () => {
    expect(pluralize(2, ...forms)).toBe("2 розміри");
    expect(pluralize(3, ...forms)).toBe("3 розміри");
    expect(pluralize(4, ...forms)).toBe("4 розміри");
  });

  it("returns form5 for 5-20", () => {
    expect(pluralize(5, ...forms)).toBe("5 розмірів");
    expect(pluralize(10, ...forms)).toBe("10 розмірів");
    expect(pluralize(11, ...forms)).toBe("11 розмірів");
    expect(pluralize(15, ...forms)).toBe("15 розмірів");
    expect(pluralize(19, ...forms)).toBe("19 розмірів");
    expect(pluralize(20, ...forms)).toBe("20 розмірів");
  });

  it("returns form1 for 21, 31, etc.", () => {
    expect(pluralize(21, ...forms)).toBe("21 розмір");
    expect(pluralize(31, ...forms)).toBe("31 розмір");
    expect(pluralize(101, ...forms)).toBe("101 розмір");
  });

  it("returns form2 for 22-24, 32-34, etc.", () => {
    expect(pluralize(22, ...forms)).toBe("22 розміри");
    expect(pluralize(33, ...forms)).toBe("33 розміри");
    expect(pluralize(104, ...forms)).toBe("104 розміри");
  });

  it("returns form5 for 0", () => {
    expect(pluralize(0, ...forms)).toBe("0 розмірів");
  });

  it("returns form5 for 100, 111-119", () => {
    expect(pluralize(100, ...forms)).toBe("100 розмірів");
    expect(pluralize(111, ...forms)).toBe("111 розмірів");
    expect(pluralize(112, ...forms)).toBe("112 розмірів");
  });

  it("handles articles forms", () => {
    expect(pluralize(1, "стаття", "статті", "статей")).toBe("1 стаття");
    expect(pluralize(3, "стаття", "статті", "статей")).toBe("3 статті");
    expect(pluralize(5, "стаття", "статті", "статей")).toBe("5 статей");
  });
});

describe("pluralForm", () => {
  it("returns just the form without the number", () => {
    expect(pluralForm(1, "шина", "шини", "шин")).toBe("шина");
    expect(pluralForm(3, "шина", "шини", "шин")).toBe("шини");
    expect(pluralForm(5, "шина", "шини", "шин")).toBe("шин");
    expect(pluralForm(11, "шина", "шини", "шин")).toBe("шин");
    expect(pluralForm(21, "шина", "шини", "шин")).toBe("шина");
  });
});
