import type { IAIProvider } from "./ai-provider.interface";
import { GeminiProvider } from "./providers/gemini.provider";

export class AIServiceFactory {
  private static instance: IAIProvider | null = null;

  public static getProvider(): IAIProvider {
    if (this.instance) {
      return this.instance;
    }

    const providerType = (process.env.AI_PROVIDER || "gemini").toLowerCase();

    switch (providerType) {
      case "gemini":
        this.instance = new GeminiProvider();
        break;
      // Future providers (e.g. OpenAI, Claude, DeepSeek) can be registered here:
      // case "openai":
      //   this.instance = new OpenAIProvider();
      //   break;
      default:
        this.instance = new GeminiProvider();
        break;
    }

    return this.instance;
  }
}

export const aiService = AIServiceFactory.getProvider();
