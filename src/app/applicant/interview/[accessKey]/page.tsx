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

const socket = io("http://127.0.0.1:5000");

interface Props {
  children: ReactNode;
  role: string;
}

const SystemThinking: React.FC = () => {
  return (
    <>
      {/* System Thinking Message */}
      <div className="flex items-start">
        <div className="max-w-[80%] rounded-lg bg-[#e6e2d9] p-3 text-[#3c3c3c]">
          <div className="flex items-center">
            <span className="mr-2">Thinking</span>
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
  const [status, setStatus] = useState<CheckStatus>();
  const [job, setJob] = useState<JobWithKeywords>();
  const [messages, setMessages] = useState<Message[]>();
  const [key, setKey] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const accessKey = window.location.href.split("/").pop();
    setKey(accessKey!);
    async function init() {
      const status = await checkStatus(accessKey!);
      const job = await getJobDetails(accessKey!);
      const question = await getQuestions(accessKey!);
      const messages = await getMessages(accessKey!);
      let interview;

      console.log(status);
      console.log(job);
      console.log(question);
      console.log(messages);

      if (status.success === false) {
        console.log(job);
        console.log(question);

        const title = job.job?.job.title;
        const description = job.job?.job.description;
        const keys = job.job?.keywords;
        const keywords = keys?.join(", ");
        const questions = question.data;

        interview = await startInterview(
          accessKey!,
          title!,
          description!,
          keywords!,
          questions!,
        );

        console.log(interview);
      }

      if (messages?.success) {
        setMessages(messages.data?.messages);
      }
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

      const blob = new Blob([byteArray], { type: "audio/mp3" });
      const url = URL.createObjectURL(blob);

      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current
          .play()
          .catch((error) => console.error("Playback failed:", error));
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

        const chunkSize = 1024; // Adjust as needed
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
            <div className="mb-6 space-y-6">
              {/* System Message */}
              <div className="flex items-start">
                <div className="max-w-[80%] rounded-lg bg-[#e6e2d9] p-3 text-[#3c3c3c]">
                  <p>
                    Hello! Im ready to start your interview. Please tell me
                    about your experience with project management.
                  </p>
                </div>
              </div>

              {/* User Message */}
              <div className="flex items-start justify-end">
                <div className="max-w-[80%] rounded-lg bg-[#8b5d3f] p-3 text-white">
                  <p>
                    Ive been working as a project manager for about 5 years now,
                    primarily in software development.
                  </p>
                </div>
              </div>

              {/* System Message */}
              <div className="flex items-start">
                <div className="max-w-[80%] rounded-lg bg-[#e6e2d9] p-3 text-[#3c3c3c]">
                  <p>
                    Thats great! Could you describe a challenging project youve
                    managed and how you handled it?
                  </p>
                </div>
              </div>

              {/* User Message */}
              <div className="flex items-start justify-end">
                <div className="max-w-[80%] rounded-lg bg-[#8b5d3f] p-3 text-white">
                  <p>
                    Sure. Last year, I led a team of 12 developers on a
                    healthcare application with a tight deadline. We faced
                    several technical challenges...
                  </p>
                </div>
              </div>
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
