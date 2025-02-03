const WavEncoder = require("wav-encoder");
const BASE_URL = "http://localhost:5000";

export async function uploadAudio(audio: any) {
  try {
    const wav_data = await WavEncoder.encode({
      sampleRate: 16000,
      channelData: [audio],
    });

    const blob = new Blob([wav_data], {type: "audio/wav"});
    const formData = new FormData();
    formData.append("file", blob, "audio.wav");

    console.log(blob);
    const response = await fetch(`${BASE_URL}/upload`, {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (response.ok) {
      console.log(
        `Success: ${result.message}. File saved at: ${result.file_path}`,
      );
    } else {
      console.log(`Error: ${result.error}`);
    }
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
      return { success: false, error: error.message };
    }
    return { success: false, error: "An unexpected error occurred" };
  }
}
