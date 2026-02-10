import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "./Button";

describe("Button", () => {
  // ---- Rendering variants ----

  it("renders with default props", () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole("button", { name: "Click me" });
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
  });

  it.each(["primary", "secondary", "ghost", "brand", "outline", "danger"] as const)(
    "renders %s variant without errors",
    (variant) => {
      render(<Button variant={variant}>{variant}</Button>);
      expect(screen.getByRole("button", { name: variant })).toBeInTheDocument();
    },
  );

  it.each(["sm", "md", "lg"] as const)("renders %s size without errors", (size) => {
    render(<Button size={size}>{size}</Button>);
    expect(screen.getByRole("button", { name: size })).toBeInTheDocument();
  });

  // ---- Variant class names ----

  it("applies primary variant classes by default", () => {
    render(<Button>Primary</Button>);
    const button = screen.getByRole("button");
    expect(button.className).toContain("bg-primary");
  });

  it("applies secondary variant classes", () => {
    render(<Button variant="secondary">Secondary</Button>);
    const button = screen.getByRole("button");
    expect(button.className).toContain("border-stone-300");
    expect(button.className).toContain("dark:border-stone-600");
  });

  it("applies ghost variant classes", () => {
    render(<Button variant="ghost">Ghost</Button>);
    const button = screen.getByRole("button");
    expect(button.className).toContain("text-stone-600");
    expect(button.className).toContain("dark:text-stone-400");
  });

  it("applies brand variant classes", () => {
    render(<Button variant="brand">Brand</Button>);
    const button = screen.getByRole("button");
    expect(button.className).toContain("bg-brand");
  });

  it("applies danger variant classes", () => {
    render(<Button variant="danger">Danger</Button>);
    const button = screen.getByRole("button");
    expect(button.className).toContain("bg-red-500");
  });

  // ---- Size class names ----

  it("applies md size classes by default", () => {
    render(<Button>Default Size</Button>);
    const button = screen.getByRole("button");
    expect(button.className).toContain("px-4");
    expect(button.className).toContain("py-2");
    expect(button.className).toContain("text-sm");
  });

  it("applies sm size classes", () => {
    render(<Button size="sm">Small</Button>);
    const button = screen.getByRole("button");
    expect(button.className).toContain("px-3");
    expect(button.className).toContain("text-xs");
  });

  it("applies lg size classes", () => {
    render(<Button size="lg">Large</Button>);
    const button = screen.getByRole("button");
    expect(button.className).toContain("px-6");
    expect(button.className).toContain("text-base");
  });

  // ---- Disabled state ----

  it("is disabled when disabled prop is true", () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("is disabled when loading is true", () => {
    render(<Button loading>Loading</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  // ---- Loading state ----

  it("shows spinner when loading", () => {
    render(<Button loading>Loading</Button>);
    const button = screen.getByRole("button");
    // Loader2 icon has aria-hidden and animate-spin class
    const spinner = button.querySelector(".animate-spin");
    expect(spinner).toBeInTheDocument();
  });

  it("hides left icon when loading", () => {
    const icon = <span data-testid="left-icon">L</span>;
    render(
      <Button loading leftIcon={icon}>
        Text
      </Button>,
    );
    expect(screen.queryByTestId("left-icon")).not.toBeInTheDocument();
  });

  it("hides right icon when loading", () => {
    const icon = <span data-testid="right-icon">R</span>;
    render(
      <Button loading rightIcon={icon}>
        Text
      </Button>,
    );
    expect(screen.queryByTestId("right-icon")).not.toBeInTheDocument();
  });

  // ---- Icons ----

  it("renders left icon", () => {
    const icon = <span data-testid="left-icon">L</span>;
    render(<Button leftIcon={icon}>With Icon</Button>);
    expect(screen.getByTestId("left-icon")).toBeInTheDocument();
  });

  it("renders right icon", () => {
    const icon = <span data-testid="right-icon">R</span>;
    render(<Button rightIcon={icon}>With Icon</Button>);
    expect(screen.getByTestId("right-icon")).toBeInTheDocument();
  });

  // ---- Click handler ----

  it("calls onClick when clicked", async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Clickable</Button>);

    await userEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("does not call onClick when disabled", async () => {
    const handleClick = vi.fn();
    render(
      <Button onClick={handleClick} disabled>
        Disabled
      </Button>,
    );

    await userEvent.click(screen.getByRole("button"));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("does not call onClick when loading", async () => {
    const handleClick = vi.fn();
    render(
      <Button onClick={handleClick} loading>
        Loading
      </Button>,
    );

    await userEvent.click(screen.getByRole("button"));
    expect(handleClick).not.toHaveBeenCalled();
  });

  // ---- Accessibility ----

  it("has button role by default", () => {
    render(<Button>A11y</Button>);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("supports type attribute", () => {
    render(<Button type="submit">Submit</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
  });

  it("supports aria-label", () => {
    render(<Button aria-label="Close dialog">X</Button>);
    expect(screen.getByRole("button", { name: "Close dialog" })).toBeInTheDocument();
  });

  // ---- Custom className ----

  it("merges custom className", () => {
    render(<Button className="mt-4">Custom</Button>);
    const button = screen.getByRole("button");
    expect(button.className).toContain("mt-4");
    // Should still have base classes
    expect(button.className).toContain("rounded-full");
  });

  // ---- Ref forwarding ----

  it("forwards ref to button element", () => {
    const ref = vi.fn();
    render(<Button ref={ref}>Ref</Button>);
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLButtonElement));
  });

  // ---- Design system compliance ----

  it("uses rounded-full for pill shape", () => {
    render(<Button>Pill</Button>);
    expect(screen.getByRole("button").className).toContain("rounded-full");
  });

  it("has focus ring styles", () => {
    render(<Button>Focus</Button>);
    const className = screen.getByRole("button").className;
    expect(className).toContain("focus:ring-2");
    expect(className).toContain("focus:ring-offset-2");
  });

  it("has disabled opacity style", () => {
    render(<Button>Style</Button>);
    expect(screen.getByRole("button").className).toContain("disabled:opacity-50");
  });
});
