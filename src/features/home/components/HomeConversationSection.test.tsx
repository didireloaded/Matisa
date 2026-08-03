import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  HomeConversationComposer,
  TrendingConversationEmptyState,
} from "./HomeConversationSection";

describe("HomeConversationComposer", () => {
  it("routes working actions and clearly disables unavailable creation actions", () => {
    const onCreateNote = vi.fn();
    const onOpenEvents = vi.fn();

    render(
      <HomeConversationComposer
        avatar={<span aria-label="Current user">U</span>}
        onCreateNote={onCreateNote}
        onOpenEvents={onOpenEvents}
      />,
    );

    expect(screen.getByText("What's on your mind?")).toBeInTheDocument();
    expect(screen.getByText("Note")).toBeInTheDocument();
    expect(screen.getByText("Voice Note")).toBeInTheDocument();
    expect(screen.getByText("Story")).toBeInTheDocument();
    expect(screen.getByText("Event")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Create a note" }));
    fireEvent.click(screen.getByRole("button", { name: "Send a note" }));
    fireEvent.click(screen.getByRole("button", { name: "Create note" }));
    expect(onCreateNote).toHaveBeenCalledTimes(3);

    fireEvent.click(screen.getByRole("button", { name: "Open events" }));
    expect(onOpenEvents).toHaveBeenCalledTimes(1);

    expect(screen.getByRole("button", { name: "Voice Note unavailable" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Story unavailable" })).toBeDisabled();
  });
});

describe("TrendingConversationEmptyState", () => {
  it("opens note creation from the empty state", () => {
    const onCreateNote = vi.fn();

    render(<TrendingConversationEmptyState onCreateNote={onCreateNote} />);

    expect(screen.getByText("No Conversations Yet")).toBeInTheDocument();
    expect(
      screen.getByText("Start a conversation. Ask a question or share an idea."),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Ask a Question" }));
    expect(onCreateNote).toHaveBeenCalledTimes(1);
  });
});
