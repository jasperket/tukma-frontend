"use client";

import React, { ReactNode, useEffect, useRef, useState } from "react";
import MicButton from "../../components/MicButton";
import {
  CheckStatus,
  getMessages,
  getQuestions,
  Message,
  Question,
  startInterview,
} from "~/app/actions/interview";
import { io } from "socket.io-client";
import wavEncoder from "wav-encoder";
import { checkStatus } from "~/app/actions/interview";
import { getJobDetails, JobWithKeywords } from "~/app/actions/recruiter";

const socket = io("https://tukma-backend-copy-production.up.railway.app");

interface Props {
  children: ReactNode;
  role: string;
}

const UserThinking: React.FC<Props> = ({ children, role }) => {
  return (
    <>
      <div className="flex items-start justify-end">
        <div className="max-w-[80%] rounded-lg bg-[#8b5d3f] p-3 text-white">
          <div className="flex items-center">
            <span className="mr-2">{children}</span>
            <span className="flex space-x-1">
              <span
                className="h-2 w-2 animate-bounce rounded-full bg-white"
                style={{ animationDelay: "0ms" }}
              ></span>
              <span
                className="h-2 w-2 animate-bounce rounded-full bg-white"
                style={{ animationDelay: "150ms" }}
              ></span>
              <span
                className="h-2 w-2 animate-bounce rounded-full bg-white"
                style={{ animationDelay: "300ms" }}
              ></span>
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

const SystemThinking: React.FC<Props> = ({
  children = "Thinking",
  role = "def",
}) => {
  return (
    <>
      {/* System Thinking Message */}
      <div className="flex items-start">
        <div className="max-w-[80%] rounded-lg bg-[#e6e2d9] p-3 text-[#3c3c3c]">
          <div className="flex items-center">
            <span className="mr-2">{children}</span>
            <span className="flex space-x-1">
              <span
                className="h-2 w-2 animate-bounce rounded-full bg-[#8b5d3f]"
                style={{ animationDelay: "0ms" }}
              ></span>
              <span
                className="h-2 w-2 animate-bounce rounded-full bg-[#8b5d3f]"
                style={{ animationDelay: "150ms" }}
              ></span>
              <span
                className="h-2 w-2 animate-bounce rounded-full bg-[#8b5d3f]"
                style={{ animationDelay: "300ms" }}
              ></span>
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

const MessageBubble: React.FC<Props> = ({ children, role }) => {
  function getStyleContainer(role: string) {
    if (role === "system") {
      return "flex items-start";
    }
    return "flex items-start justify-end";
  }

  function getStyleInner(role: string) {
    if (role === "system") {
      return "bg-[#e6e2d9] text-[#3c3c3c] rounded-lg p-3 max-w-[80%]";
    }
    return "bg-[#8b5d3f] text-white rounded-lg p-3 max-w-[80%]";
  }

  return (
    <>
      <div className={getStyleContainer(role)}>
        <div className={getStyleInner(role)}>
          <p>{children}</p>
        </div>
      </div>
    </>
  );
};

export default function InterviewPage() {
  const [loading, setLoading] = useState<boolean>(true);
  const [thinking, setThinking] = useState<boolean>(false);
  const [processing, setProcessing] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>();
  const [key, setKey] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  let audioChunks: Uint8Array<ArrayBuffer>[] = [];

  useEffect(() => {
    const accessKey = window.location.href.split("/").pop();
    setKey(accessKey!);
    async function init() {
      const status = await checkStatus(accessKey!);
      const job = await getJobDetails(accessKey!);
      const question = await getQuestions(accessKey!);

      setLoading(false);
      setThinking(true);

      const title = job.job?.job.title;
      const description = job.job?.job.description;
      const keys = job.job?.keywords;
      const keywords = keys?.join(", ");
      const questions = question.data;

      const interview = await startInterview(
        accessKey!,
        title!,
        description!,
        keywords!,
        questions!,
      );

      const messages = await getMessages(accessKey!);
      if (messages?.success) {
        setMessages(messages.data?.messages);
      }
      setThinking(false);
    }

    init();

    socket.on("open", (event) => {
      console.log("WebSocket connection opened:", event.message);
    });

    socket.on("message", (event: MessageEvent) => {
      console.log(event.data);
    });

    // Listen for the 'audio_chunk' event and push the data into audioChunks.
    socket.on("audio_chunk", (data: string) => {
      // Convert the received latin-1 string back into a Uint8Array.
      const chunk = latin1ToUint8Array(data);
      audioChunks.push(chunk);
    });

    socket.on("user_message", (data: Message[]) => {
      setProcessing(false);
      setMessages(data);
      setThinking(true);
    });

    socket.on("system_message", (data: Message[]) => {
      setThinking(false);
      setMessages(data);
    });

    // Optionally, if you have a separate event to mark the end of the stream.
    socket.on("audio_end", () => {
      // Combine all chunks into one Uint8Array.
      const totalLength = audioChunks.reduce(
        (acc, curr) => acc + curr.length,
        0,
      );
      const combined = new Uint8Array(totalLength);
      let offset = 0;
      audioChunks.forEach((chunk) => {
        combined.set(chunk, offset);
        offset += chunk.length;
      });

      // Create a Blob from the combined data (adjust the MIME type if necessary).
      const audioBlob = new Blob([combined], { type: "audio/mp3" });
      const audioUrl = URL.createObjectURL(audioBlob);

      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current
          .play()
          .catch((error) => console.error("Playback failed:", error));
      }
      // Reset chunks for future use.
      audioChunks = [];
      setThinking(false);
    });

    socket.emit("join_room", { room: accessKey });

    socket.on("audio_error", (error: Error) => {
      handleAudioError(error.message);
    });

    function handleAudioError(message: string) {
      console.error("Audio error:", message);
      // Show error message to user
    }

    return () => {
      socket.disconnect();
    };
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages, thinking, processing]);

  function sendAudio(audio: Float32Array<ArrayBufferLike>) {
    if (socket) {
      setProcessing(true);
      async function init() {
        const wavData = await wavEncoder.encode({
          sampleRate: 16000,
          channelData: [audio],
        });

        const chunkSize = 8192; // Adjust as needed
        const uint8Array = new Uint8Array(wavData);

        for (let i = 0; i < uint8Array.length; i += chunkSize) {
          const chunk = uint8Array.slice(i, i + chunkSize);
          socket.emit("room_message_chunk", { room: key, audio: chunk });
        }
        socket.emit("room_message_end", { room: key });
      }

      init();
    }
  }

  return (
    <>
      {/* Hidden audio element */}
      <audio ref={audioRef} controls className="hidden" />
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center p-6">
        <div className="w-full rounded-xl bg-white p-6 shadow-sm md:p-8">
          <h1 className="mb-6 text-2xl font-bold text-[#3c3c3c] md:text-3xl">
            Interview
          </h1>

          <div className="mb-8 rounded-lg bg-[#f8f7f4] md:p-8">
            {/* Conversation Area */}
            <div
              className="mb-6 min-h-[350] max-h-[350px] space-y-6 overflow-y-auto scroll-smooth pr-2"
              ref={chatContainerRef}
              style={{ scrollBehavior: "smooth" }}
            >
              {messages?.map((message) => (
                <MessageBubble key={message.id} role={message.role}>
                  {message.content}
                </MessageBubble>
              ))}

              {loading && (
                <SystemThinking role={"test"}>Loading</SystemThinking>
              )}
              {thinking && (
                <SystemThinking role={"test"}>Thinking</SystemThinking>
              )}
              {processing && (
                <UserThinking role={"test"}>Processing</UserThinking>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="mb-8 grid gap-6 md:grid-cols-3">
            <div className="rounded-lg bg-[#f8f7f4] p-4 text-center">
              <div className="mb-2 font-medium text-[#8a7e6d]">Step 1</div>
              <p className="text-sm text-[#3c3c3c]">
                Click the microphone button to begin
              </p>
            </div>
            <div className="rounded-lg bg-[#f8f7f4] p-4 text-center">
              <div className="mb-2 font-medium text-[#8a7e6d]">Step 2</div>
              <p className="text-sm text-[#3c3c3c]">
                Speak clearly into your microphone
              </p>
            </div>
            <div className="rounded-lg bg-[#f8f7f4] p-4 text-center">
              <div className="mb-2 font-medium text-[#8a7e6d]">Step 3</div>
              <p className="text-sm text-[#3c3c3c]">
                Review your transcript when complete
              </p>
            </div>
          </div>

          {/* Mic Button */}
          <div className="mt-6 flex justify-center">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-full bg-[#8b5d3f] text-white shadow-md transition-all hover:bg-[#7a4e33] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#8b5d3f] focus:ring-opacity-50"
              aria-label="Start recording"
            >
              <MicButton uploadAudio={sendAudio} />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

function latin1ToUint8Array(str: string) {
  const array = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) {
    array[i] = str.charCodeAt(i);
  }
  return array;
}
