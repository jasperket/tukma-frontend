"use client";

import React, { ReactNode, useEffect, useRef, useState } from "react";
import { Mic, MicOff } from "lucide-react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import {
  CheckStatus,
  getMessages,
  getQuestions,
  Message,
  Question,
  reply,
  startInterview,
} from "~/app/actions/interview";
import { getJobDetails, JobWithKeywords } from "~/app/actions/recruiter";
import { getUserInfo, UserDetailsWrapper } from "~/app/actions/auth";

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
            <span>{children}</span>
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
  const [error, setError] = useState<boolean>(false);
  const [mic, setMic] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [start, setStart] = useState<boolean>(false);

  const [messages, setMessages] = useState<Message[]>();
  const [transcript, setTranscript] = useState<string>();

  const [job, setJob] = useState<JobWithKeywords>();
  const [question, setQuestion] = useState<Question[]>();

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const transcriptRef = useRef(transcript);
  const nameRef = useRef<string | null>(null);
  const emailRef = useRef<string | null>(null);

  useEffect(() => {
    const accessKey = window.location.href.split("/").pop();

    // Check for browser support (and vendor prefixes)
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = SpeechRecognition ? new SpeechRecognition() : null;
    const synth = window.speechSynthesis;

    if (recognition) {
      recognition.continuous = true; // Keep listening even after pauses
      recognition.lang = "en-US"; // Set the language
      recognition.interimResults = true; // Set the language
      recognitionRef.current = recognition;
    }

    if (synth) {
      synthRef.current = synth;
      if (synthRef.current.speaking) {
        synthRef.current.cancel();
      }
    }

    if (!recognition) {
      console.log("Speech Recognition API is not supported in this browser.");
      setError(true);
      return;
    }

    async function init() {
      const userInfo = await getUserInfo();
      const job = await getJobDetails(accessKey!);
      const question = await getQuestions(accessKey!);

      if (!userInfo.success) {
        setError(true);
        return;
      }
      if (!job.success) {
        setError(true);
        return;
      }
      if (!question.success) {
        setError(true);
        return;
      }

      nameRef.current =
        userInfo.data!.userDetails.firstName +
        " " +
        userInfo.data!.userDetails.lastName;
      emailRef.current = userInfo.data!.userDetails.username;
      setJob(job.job);
      setQuestion(question.data);

      setLoading(false);
    }

    init();

    // Handle speech recognition start
    recognition.onstart = () => {
      console.log("Speech recognition started");
      setMic(true);
    };

    // Handle when speech is detected
    recognition.onspeechstart = () => {
      console.log("Speech detected");
      setIsSpeaking(true);
    };

    // Handle when speech ends
    recognition.onspeechend = () => {
      console.log("Speech ended");
      setIsSpeaking(false);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const combinedTranscript = Array.from(event.results)
        .map((result) => result[0]?.transcript) // Get transcript of the first alternative
        .join(" ") // Concatenate them
        .trim();

      if (combinedTranscript === undefined || combinedTranscript === null) {
        return;
      }

      setTranscript(combinedTranscript);
    };

    recognition.onend = () => {
      console.log("Speech recognition ended");
      setMic(false);
      // Make sure speaking is also set to false when recognition ends
      setIsSpeaking(false);
      const currentTranscript = transcriptRef.current;
      setTranscript(currentTranscript);

      async function sendReply() {
        setThinking(true);

        const response = await reply(
          getKey(),
          nameRef.current!,
          emailRef.current!,
          transcriptRef.current!,
        );

        const response2 = await getMessages(
          getKey(),
          nameRef.current!,
          emailRef.current!,
        );
        setThinking(false);
        if (response2.success) {
          setTranscript("");
          modifyMessage(response2.data!.messages);
        }
        if (response.success) {
          speech(response.data!.system);
        }
      }

      sendReply();
    };
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages, thinking, transcript]);

  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  function modifyMessage(message: Message[]) {
    const messages = message.slice(1);
    setMessages(messages);
  }

  function getKey(): string {
    return window.location.href.split("/").pop()!;
  }

  function handleMic() {
    if (!mic) {
      // Start speech recognition
      try {
        recognitionRef.current?.start();
        // We don't set mic state here - it will be set in the onstart handler
      } catch (error) {
        console.error("Error starting speech recognition:", error);
      }
    } else {
      // Stop speech recognition
      try {
        recognitionRef.current?.stop();
        // We don't set mic state here - it will be set in the onend handler
      } catch (error) {
        console.error("Error stopping speech recognition:", error);
      }
    }
  }

  function handleStop() {
    if (synthRef.current?.speaking) {
      synthRef.current.cancel();
    }
  }

  function speech(text: string) {
    if (!synthRef.current || !text) {
      console.log("Synth not ready or no text to speak.");
      console.log(text);
      return;
    }
    handleStop();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.pitch = 1;
    utterance.rate = 1;

    utterance.onstart = () => {
      console.log("Speech started.");
    };
    utterance.onend = () => {
      console.log("Speech finished.");
    };
    utterance.onerror = (event) => {
      console.log("Speech synthesis error:", event.error);
    };

    synthRef.current?.speak(utterance);
  }

  async function handleStartInterview() {
    setStart(true);

    const title = job?.job.title;
    const description = job?.job.description;
    const keys = job?.keywords;
    const keywords = keys?.join(", ");
    const questions = question;

    setThinking(true);

    const interview = await startInterview(
      getKey(),
      title!,
      description!,
      keywords!,
      questions!,
      nameRef.current!,
      emailRef.current!,
    );
    if (interview.success) {
      speech(interview.data!.system);
    }

    const messages = await getMessages(
      getKey(),
      nameRef.current!,
      emailRef.current!,
    );
    if (messages?.success) {
      modifyMessage(messages.data!.messages);
    }

    setThinking(false);
  }

  return (
    <>
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center p-6">
        <div className="w-full rounded-xl bg-white p-6 shadow-sm md:p-8">
          <h1 className="mb-6 text-2xl font-bold text-[#3c3c3c] md:text-3xl">
            Interview
          </h1>

          <div className="mb-8 rounded-lg bg-[#f8f7f4] md:p-8">
            {/* Conversation Area */}
            <div
              className="mb-6 max-h-[350px] min-h-[350] space-y-6 overflow-y-auto scroll-smooth pr-2"
              ref={chatContainerRef}
              style={{ scrollBehavior: "smooth" }}
            >
              {messages?.map((message) => (
                <MessageBubble key={message.id} role={message.role}>
                  {message.content}
                </MessageBubble>
              ))}
              {error && (
                <p className="text-red-500">
                  An error occured, please refresh the page
                </p>
              )}
              {transcript && (
                <UserThinking role="test">{transcript}</UserThinking>
              )}
              {loading && (
                <SystemThinking role={"test"}>Loading</SystemThinking>
              )}
              {thinking && (
                <SystemThinking role={"test"}>Thinking</SystemThinking>
              )}
              {!start && !loading && (
                <UserThinking role={"test"}>
                  Press the &quot;Start Interview&quot; button to begin
                </UserThinking>
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
                Mute the microphone to send a reply
              </p>
            </div>
          </div>

          {/* Mic Button */}
          <div className="mt-6 flex justify-center items-center gap-4">
            {/* Left Waveform */}
            <div className={cn("flex h-16 items-center transition-opacity duration-300", isSpeaking ? "opacity-100" : "opacity-0 invisible")}>
              <div id="wave" className="mr-2">
                <div className="wave0"></div>
                <div className="wave1"></div>
                <div className="wave2"></div>
                <div className="wave3"></div>
                <div className="wave4"></div>
              </div>
            </div>

            <div
              className={cn(
                "flex h-16 w-16 items-center justify-center",
                start &&
                  "rounded-full bg-[#8b5d3f] text-white shadow-md transition-all hover:bg-[#7a4e33] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#8b5d3f] focus:ring-opacity-50",
              )}
              aria-label="Start recording"
            >
              <Button
                className={cn(
                  "flex-1 border-[#8b6e4e] bg-[#8b6e4e] text-white hover:bg-[#6d563d]",
                  start && "hidden",
                )}
                disabled={loading}
                onClick={() => handleStartInterview()}
              >
                Start Interview
              </Button>
              <Button
                size="lg"
                variant={mic ? "destructive" : "default"}
                className={cn(
                  "h-16 w-16 rounded-full p-0",
                  !mic && "bg-primary-400 hover:bg-primary-500",
                  !start && "hidden",
                )}
                onClick={() => handleMic()}
              >
                {mic ? (
                  <Mic className="h-6 w-6" />
                ) : (
                  <MicOff className="h-6 w-6" />
                )}
              </Button>
            </div>
            
            {/* Right Waveform */}
            <div className={cn("flex h-16 items-center transition-opacity duration-300", isSpeaking ? "opacity-100" : "opacity-0 invisible")}>
              <div id="wave" className="ml-2">
                <div className="wave4"></div>
                <div className="wave3"></div>
                <div className="wave2"></div>
                <div className="wave1"></div>
                <div className="wave0"></div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
