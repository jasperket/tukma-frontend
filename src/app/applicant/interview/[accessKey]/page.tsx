"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import MicButton from "../../components/MicButton";
import { startInterview } from "~/app/actions/applicant";
import { io } from "socket.io-client";
import wavEncoder from "wav-encoder";

const socket = io("http://127.0.0.1:5000");

export default function ApplicantPage() {
  const [audioReady, setAudioReady] = useState(false);
  const [key, setKey] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const accessKey = window.location.href.split("/").pop();
    setKey(accessKey!);
    async function init() {
      const response = await startInterview(accessKey!);

      const base64WithoutPrefix = response.data?.audio_data
        .split(";base64,")
        .pop();

      // Decode the base64 string into binary data
      const binaryData = atob(base64WithoutPrefix!);
      const byteArray = new Uint8Array(binaryData.length);

      for (let i = 0; i < binaryData.length; i++) {
        byteArray[i] = binaryData.charCodeAt(i);
      }

      // Create a Blob from the binary data
      const blob = new Blob([byteArray], { type: "audio/mpeg" });

      // Create an object URL for the Blob
      const url = URL.createObjectURL(blob);

      // Create an Audio object and play the sound
      const mySound = new Audio(url);
      mySound.play();
    }

    init();

    socket.on("open", (event) => {
      console.log("WebSocket connection opened:", event.message);
    });

    socket.on("message", (event: MessageEvent) => {
      console.log(event.data);
    });

    socket.on("full_audio", async (encodedAudio: string) => {
      const byteArray = new Uint8Array(encodedAudio.length);
      for (let i = 0; i < encodedAudio.length; i++) {
        byteArray[i] = encodedAudio.charCodeAt(i);
      }

      const blob = new Blob([byteArray], { type: 'audio/mp3' });
      const url = URL.createObjectURL(blob);

      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play()
          .catch(error => console.error('Playback failed:', error));
      }
    });

    socket.emit("join_room", { room: accessKey });

    return () => {
      socket.disconnect();
    };
  }, []);

  function sendAudio(audio: Float32Array<ArrayBufferLike>) {
    if (socket) {
      async function init() {
        const wavData = await wavEncoder.encode({
          sampleRate: 16000,
          channelData: [audio],
        });

        // Create a Blob from the encoded WAV data
        // const blob = new Blob([wavData], { type: "audio/wav" });
        socket.emit("room_message", { room: key, audio: wavData });
      }

      init();
    }
  }

  // User gesture handler
  const handleUserInteraction = async () => {
    try {
      // Required for audio autoplay
      if (audioRef.current) {
        await audioRef.current.play();
      }
      setAudioReady(true);
      // Trigger any additional logic for starting the interview
    } catch (error) {
      console.error("Audio initialization failed:", error);
    }
  };

  return (
    <>
      {/* Hidden audio element */}
      <audio ref={audioRef} controls style={{ display: "none" }} />
      <main className="grid grid-cols-2 gap-6 p-4">
        {/* Right Column */}
        <div className="flex items-center space-y-6">
          {/* Interview Transcript Card */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-xl text-text-100">Interview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] rounded-lg border border-background-800 bg-background-950 p-4">
                <p className="text-sm text-text-400">
                  Start the interview to see the transcript
                </p>
              </div>
              <div className="flex items-center justify-center pt-4">
                <MicButton uploadAudio={sendAudio} />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
