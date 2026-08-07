// src/components/voice/VoiceWaveform.test.tsx
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { VoiceWaveform } from "./VoiceWaveform";

describe("VoiceWaveform", () => {
  it("renders waveform container with slider role", () => {
    render(<VoiceWaveform peaks={[0.1, 0.5, 0.9, 0.2]} progress={0.5} />);
    const slider = screen.getByRole("slider");
    expect(slider).toBeInTheDocument();
    expect(slider).toHaveAttribute("aria-valuenow", "50");
  });

  it("triggers onSeek callback when clicked", () => {
    const handleSeek = vi.fn();
    render(<VoiceWaveform peaks={[0.1, 0.5, 0.9, 0.2]} progress={0} onSeek={handleSeek} />);
    const slider = screen.getByRole("slider");

    // Mock getBoundingClientRect
    vi.spyOn(slider, "getBoundingClientRect").mockReturnValue({
      left: 0,
      width: 100,
      top: 0,
      bottom: 30,
      right: 100,
      height: 30,
      x: 0,
      y: 0,
      toJSON: () => {},
    });

    fireEvent.click(slider, { clientX: 50 });
    expect(handleSeek).toHaveBeenCalledWith(0.5);
  });
});
