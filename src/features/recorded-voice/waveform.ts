// src/features/recorded-voice/waveform.ts

/**
 * Normalizes raw amplitude values array into a fixed length target array (64 to 96 values).
 * All returned values are integers between 10 and 100.
 */
export function normalizeWaveform(rawAmplitudes: number[], targetLength: number = 64): number[] {
  if (!rawAmplitudes || rawAmplitudes.length === 0) {
    // Deterministic fallback waveform if no raw samples collected
    return Array.from({ length: targetLength }, (_, i) =>
      Math.round(20 + Math.abs(Math.sin(i * 0.4)) * 60),
    );
  }

  const result: number[] = [];
  const maxVal = Math.max(...rawAmplitudes, 1);

  if (rawAmplitudes.length <= targetLength) {
    // Interpolate up to targetLength
    for (let i = 0; i < targetLength; i++) {
      const index = (i / (targetLength - 1)) * (rawAmplitudes.length - 1);
      const lowIndex = Math.floor(index);
      const highIndex = Math.ceil(index);
      const fraction = index - lowIndex;
      const val =
        (rawAmplitudes[lowIndex] || 0) * (1 - fraction) +
        (rawAmplitudes[highIndex] || 0) * fraction;
      const normalized = Math.min(100, Math.max(10, Math.round((val / maxVal) * 100)));
      result.push(normalized);
    }
  } else {
    // Downsample down to targetLength by averaging chunks
    const chunkSize = rawAmplitudes.length / targetLength;
    for (let i = 0; i < targetLength; i++) {
      const start = Math.floor(i * chunkSize);
      const end = Math.floor((i + 1) * chunkSize);
      const chunk = rawAmplitudes.slice(start, Math.max(start + 1, end));
      const avg = chunk.reduce((sum, v) => sum + v, 0) / chunk.length;
      const normalized = Math.min(100, Math.max(10, Math.round((avg / maxVal) * 100)));
      result.push(normalized);
    }
  }

  return result;
}
