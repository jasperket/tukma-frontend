"use server";

import { cookies } from "next/headers";
import * as WavEncoder from "wav-encoder"; // Use ES6 import syntax

const BASE_URL = "http://localhost:5000/";

interface ResponseData {
  status: string;
  message: string;
  audio_data: string; // Assuming audio_base64 is a base64 encoded string
  audio_mimetype: string;
}

export async function startInterview(accessKey: string) {
  try {
    const jobTitle = "Software Engineer - Front End"; // Replace with the job title
    const jobDescription = "Design and implement user interfaces using modern frameworks, ensuring responsive design and optimal performance."; // Replace with the job description
    const jobKeywords = ["JavaScript", "React", "Node.js"]; // Replace with the job keywords

    const requestBody = {
      access_key: accessKey,
      job_title: jobTitle,
      job_description: jobDescription,
      job_keywords: jobKeywords,
    };

    console.log("Starting interview");

    const cookieStore = await cookies();
    const cookie = cookieStore.get("jwt");
    const response = await fetch(`${BASE_URL}start_interview`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    // Check if the response is successful
    if (!response.ok) {
      console.log(response);
      throw new Error("Failed to start interview");
    }

    // Parse the JSON response
    const json = (await response.json()) as ResponseData;
    console.log(json);

    return { success: true, data: json };
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
      return { success: false, error: error.message };
    }
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function uploadAudio(audio: Float32Array) {
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
    // const result = await response.json() as UploadResult;

    // if (response.ok) {
    //   console.log(`Success: ${result.message}. File saved at: ${result.file_path}`);
    //   return { success: true, message: result.message, file_path: result.file_path };
    // } else {
    //   console.log(`Error: ${result.error}`);
    //   return { success: false, error: result.error };
    // }
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
      return { success: false, error: error.message };
    }
    return { success: false, error: "An unexpected error occurred" };
  }
}
