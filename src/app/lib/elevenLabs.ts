// src/app/lib/elevenLabs.ts

import { ElevenLabsClient } from "elevenlabs";

export class ElevenLabsService {
  private client: ElevenLabsClient;

  constructor() {
    this.client = new ElevenLabsClient({
      apiKey: process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY
    });
  }

  async convertTextToSpeech(text: string): Promise<Uint8Array> {
    try {
      const audioStream = await this.client.textToSpeech.convert("21m00Tcm4TlvDq8ikWAM", {
        model_id: "eleven_multilingual_v2",
        text: text,
      });

      // Convert the stream to a Uint8Array
      const chunks: Uint8Array[] = [];
      for await (const chunk of audioStream) {
        chunks.push(chunk);
      }

      // Combine all chunks into a single Uint8Array
      const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
      const result = new Uint8Array(totalLength);
      let offset = 0;
      for (const chunk of chunks) {
        result.set(chunk, offset);
        offset += chunk.length;
      }

      return result;
    } catch (error) {
      console.error('ElevenLabs conversion error:', error);
      throw error;
    }
  }
}