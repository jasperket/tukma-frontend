import * as WavEncoder from "wav-encoder"; // Use ES6 import syntax

const BASE_URL = "http://localhost:5000";

interface UploadResult {
  success: boolean;
  message?: string;
  file_path?: string;
  error?: string;
}

export async function uploadAudio(audio: Float32Array): Promise<UploadResult> {
  try {
    // Encode audio to WAV format
    const wavData = await WavEncoder.encode({
      sampleRate: 16000,
      channelData: [audio],
    });

    // Create a Blob from the encoded WAV data
    const blob = new Blob([wavData], { type: "audio/wav" });
    const formData = new FormData();
    formData.append("file", blob, "audio.wav");

    // Send the file to the server
    const response = await fetch(`${BASE_URL}/upload`, {
      method: "POST",
      body: formData,
    });

    // Parse the response
    const result: UploadResult = await response.json();

    if (response.ok) {
      console.log(`Success: ${result.message}. File saved at: ${result.file_path}`);
      return { success: true, message: result.message, file_path: result.file_path };
    } else {
      console.log(`Error: ${result.error}`);
      return { success: false, error: result.error };
    }
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
      return { success: false, error: error.message };
    }
    return { success: false, error: "An unexpected error occurred" };
  }
}