import { GoogleGenAI, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates speech from text using Gemini TTS model.
 * Returns the Base64 encoded raw PCM audio data.
 */
export const generateSpeech = async (text: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }, // Using 'Kore' for a balanced voice
          },
        },
      },
    });

    const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    
    if (!audioData) {
      throw new Error("Ses verisi oluşturulamadı.");
    }

    return audioData;
  } catch (error) {
    console.error("TTS Error:", error);
    throw error;
  }
};

/**
 * Decodes Base64 string to Uint8Array
 */
function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Decodes raw PCM data into an AudioBuffer.
 * Gemini TTS returns raw PCM (1 channel, 24kHz usually).
 */
export const decodeAudioData = async (
  base64Data: string,
  ctx: AudioContext
): Promise<AudioBuffer> => {
  const pcmData = decode(base64Data);
  const sampleRate = 24000; // Gemini TTS standard sample rate
  const numChannels = 1;
  
  const dataInt16 = new Int16Array(pcmData.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      // Convert Int16 to Float32 (-1.0 to 1.0)
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
};
