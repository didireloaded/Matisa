export type AIProviderName = "gemini" | "openai" | "anthropic";

export interface AIProvider {
  generateText(prompt: string, systemInstruction?: string): Promise<string>;
  generateJSON<T>(prompt: string, systemInstruction?: string): Promise<T>;
}

export class GeminiProvider implements AIProvider {
  private apiKey: string;
  private model: string = "gemini-2.5-flash";

  constructor(apiKey?: string) {
    this.apiKey = apiKey || Deno.env.get("GEMINI_API_KEY") || "";
    if (!this.apiKey) {
      console.warn("GEMINI_API_KEY is not set");
    }
  }

  async generateText(prompt: string, systemInstruction?: string): Promise<string> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;

    const body: any = {
      contents: [{ parts: [{ text: prompt }] }],
    };

    if (systemInstruction) {
      body.systemInstruction = {
        parts: [{ text: systemInstruction }],
      };
    }

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Gemini API Error: ${err}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  }

  async generateJSON<T>(prompt: string, systemInstruction?: string): Promise<T> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;

    const body: any = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
      },
    };

    if (systemInstruction) {
      body.systemInstruction = {
        parts: [{ text: systemInstruction }],
      };
    }

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Gemini API Error: ${err}`);
    }

    const data = await response.json();
    const textData = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    return JSON.parse(textData) as T;
  }
}

export class AIProviderFactory {
  static getProvider(name: AIProviderName = "gemini"): AIProvider {
    switch (name) {
      case "gemini":
        return new GeminiProvider();
      case "openai":
      case "anthropic":
        throw new Error(`Provider ${name} not yet implemented`);
      default:
        return new GeminiProvider();
    }
  }
}
