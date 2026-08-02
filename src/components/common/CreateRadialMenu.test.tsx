import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CreateRadialMenu } from "./CreateRadialMenu";

describe("CreateRadialMenu", () => {
  it("shows exactly 3 action buttons when open", () => {
    render(<CreateRadialMenu isOpen={true} onClose={() => {}} />);

    // Exactly 3 action buttons and 1 close button
    expect(screen.getByLabelText("Create note")).toBeInTheDocument();
    expect(screen.getByLabelText("Create voice post")).toBeInTheDocument();
    expect(screen.getByLabelText("Create story")).toBeInTheDocument();

    // Should NOT show other things
    expect(screen.queryByText(/room/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/event/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/ask/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/live/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/question/i)).not.toBeInTheDocument();
  });

  it("clicking an action calls onSelect with the correct action and calls onClose", () => {
    const onClose = vi.fn();
    const onSelect = vi.fn();
    render(<CreateRadialMenu isOpen={true} onClose={onClose} onSelect={onSelect} />);

    fireEvent.click(screen.getByLabelText("Create note"));
    expect(onSelect).toHaveBeenCalledWith("note");
    expect(onClose).toHaveBeenCalled();

    fireEvent.click(screen.getByLabelText("Create voice post"));
    expect(onSelect).toHaveBeenCalledWith("voice");
    expect(onClose).toHaveBeenCalledTimes(2);

    fireEvent.click(screen.getByLabelText("Create story"));
    expect(onSelect).toHaveBeenCalledWith("story");
    expect(onClose).toHaveBeenCalledTimes(3);
  });

  it('close button has aria-label "Close create menu"', () => {
    render(<CreateRadialMenu isOpen={true} onClose={() => {}} />);
    expect(screen.getByLabelText("Close create menu")).toBeInTheDocument();
  });

  it("renders nothing when isOpen is false", () => {
    const { container } = render(<CreateRadialMenu isOpen={false} onClose={() => {}} />);
    expect(container.firstChild).toBeNull();
  });
});
