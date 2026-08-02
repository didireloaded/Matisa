import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { PrimaryNavigation } from "./PrimaryNavigation";

describe("PrimaryNavigation", () => {
  it("renders exactly 4 links and 1 button", () => {
    const handleCreate = vi.fn();
    render(
      <MemoryRouter>
        <PrimaryNavigation onCreate={handleCreate} />
      </MemoryRouter>,
    );

    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(4);

    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(1);
  });

  it("has correct href attributes for all navigation links", () => {
    const handleCreate = vi.fn();
    render(
      <MemoryRouter>
        <PrimaryNavigation onCreate={handleCreate} />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: /home/i })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: /explore/i })).toHaveAttribute("href", "/explore");
    expect(screen.getByRole("link", { name: /inbox/i })).toHaveAttribute("href", "/inbox");
    expect(screen.getByRole("link", { name: /profile/i })).toHaveAttribute("href", "/profile");
  });

  it("calls onCreate when the create button is clicked", () => {
    const handleCreate = vi.fn();
    render(
      <MemoryRouter>
        <PrimaryNavigation onCreate={handleCreate} />
      </MemoryRouter>,
    );

    const createBtn = screen.getByRole("button", { name: /create/i });
    fireEvent.click(createBtn);
    expect(handleCreate).toHaveBeenCalledTimes(1);
  });

  it("does not render karaoke, events, or music in primary nav", () => {
    const handleCreate = vi.fn();
    render(
      <MemoryRouter>
        <PrimaryNavigation onCreate={handleCreate} />
      </MemoryRouter>,
    );

    expect(screen.queryByRole("link", { name: /karaoke/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /events/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /music/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /messages/i })).not.toBeInTheDocument();
  });

  it("applies aria-current='page' to active links", () => {
    const handleCreate = vi.fn();
    render(
      <MemoryRouter initialEntries={["/explore"]}>
        <PrimaryNavigation onCreate={handleCreate} />
      </MemoryRouter>,
    );

    const exploreLink = screen.getByRole("link", { name: /explore/i });
    expect(exploreLink).toHaveAttribute("aria-current", "page");

    const homeLink = screen.getByRole("link", { name: /home/i });
    expect(homeLink).not.toHaveAttribute("aria-current");
  });
});
