"use client";

import React, { ReactNode, useEffect, useRef, useState } from "react";
import { Mic, MicOff, XCircle } from "lucide-react";
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
  const [interviewEnded, setInterviewEnded] = useState<boolean>(false);

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
  const chunksRef = useRef<string[]>([]);
  const numberRef = useRef<number>(0);

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
          
          // Check if the interview has ended
          const lastMessage = response2.data!.messages[response2.data!.messages.length - 1];
          if (
            lastMessage && 
            lastMessage.role === "system" && 
            (lastMessage.content.includes("Thank you for your time and insights") ||
             lastMessage.content.includes("Goodbye"))
          ) {
            setInterviewEnded(true);
          }
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

  function handleEndInterview() {
    console.log("Interview ended");
    // In the future, this could navigate to a summary page or perform other actions
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

  function speech(text: string) {
    if (!synthRef.current || !text || text === undefined) {
      console.log("Synth not ready or no text to speak.");
      console.log(text);
      return;
    }
    const chunks = splitTextIntoChunks(text);
    chunksRef.current = chunks;
    numberRef.current = 0;
    utter(chunksRef.current[0]!);
  }

  function utter(text: string) {
    if (!text) {
      return;
    }
    synthRef.current?.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.pitch = 1;
    utterance.rate = 1;

    utterance.onstart = () => {
      console.log("Speech started.");
    };
    utterance.onend = () => {
      console.log("Speech finished.");
      synthRef.current?.cancel();
      numberRef.current = numberRef.current + 1;
      if (numberRef.current === chunksRef.current.length) {
        numberRef.current = 0;
        chunksRef.current = [];
        return;
      }
      utter(chunksRef.current[numberRef.current]!);
    };
    utterance.onerror = (event) => {
      console.log(error);
      console.log("Speech synthesis error:", event.error);
    };

    console.log(utterance); //IMPORTANT!! Do not remove: Logging the object out fixes some onend firing issues.
    //placing the speak invocation inside a callback fixes ordering and onend issues.
    setTimeout(() => {
      synthRef.current?.speak(utterance);
    }, 0);
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

  function splitTextIntoChunks(
    text: string,
    maxLength = 200,
  ): string[] {
    if (!text) {
      return []; // Return empty array for null, undefined, or empty input
    }

    // Ensure maxLength is at least 1
    if (maxLength < 1) {
      throw new Error("maxLength must be at least 1.");
    }

    const maxChunkLength = maxLength - 1; // Actual max characters per chunk (e.g., 199)
    const chunks: string[] = [];
    let startIndex = 0;

    while (startIndex < text.length) {
      // If the remaining text is within the allowed length, it's the last chunk
      if (text.length - startIndex <= maxChunkLength) {
        chunks.push(text.substring(startIndex));
        break; // Exit the loop
      }

      // Determine the potential end index for the slice (exclusive)
      // We look for a split point *up to* maxChunkLength characters away
      const potentialEndIndex = startIndex + maxChunkLength;

      // Find the last space character at or before the potential end index
      const lastSpaceIndex = text.lastIndexOf(" ", potentialEndIndex);

      let chunkEndIndex: number;

      // Check if a suitable space was found within the current segment's range
      if (lastSpaceIndex > startIndex) {
        // Found a space, split there. The chunk ends *at* the space.
        chunkEndIndex = lastSpaceIndex;
        // The next chunk should start *after* the space
        const chunk = text.substring(startIndex, chunkEndIndex);
        chunks.push(chunk);
        startIndex = chunkEndIndex + 1; // Move past the space
      } else {
        // No suitable space found within the limit [startIndex, potentialEndIndex].
        // Perform a hard cut at maxChunkLength.
        chunkEndIndex = startIndex + maxChunkLength; // End index for substring
        const chunk = text.substring(startIndex, chunkEndIndex);
        chunks.push(chunk);
        startIndex = chunkEndIndex; // Start the next chunk immediately after the cut
      }
    }

    console.log(chunks);
    return chunks;
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
          <div className="mt-6 flex items-center justify-center gap-4">
            {/* Left Waveform */}
            <div
              className={cn(
                "flex h-16 items-center transition-opacity duration-300",
                isSpeaking ? "opacity-100" : "invisible opacity-0",
              )}
            >
              <div id="wave" className="mr-2">
                <div className="wave0"></div>
                <div className="wave1"></div>
                <div className="wave2"></div>
                <div className="wave3"></div>
                <div className="wave4"></div>
              </div>
            </div>

            <div className="flex items-center justify-center">
              {!start ? (
                <Button
                  className="border-[#8b6e4e] bg-[#8b6e4e] text-white hover:bg-[#6d563d]"
                  disabled={loading}
                  onClick={() => handleStartInterview()}
                >
                  Start Interview
                </Button>
              ) : interviewEnded ? (
                <Button
                  className="border-[#8b6e4e] bg-[#8b6e4e] text-white hover:bg-[#6d563d]"
                  onClick={handleEndInterview}
                >
                  End Interview
                </Button>
              ) : (
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-[#8b5d3f] text-white shadow-md transition-all hover:bg-[#7a4e33] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#8b5d3f] focus:ring-opacity-50"
                  aria-label="Start recording"
                >
                  <Button
                    size="lg"
                    variant={mic ? "destructive" : "default"}
                    className={cn(
                      "h-16 w-16 rounded-full p-0",
                      !mic && "bg-primary-400 hover:bg-primary-500"
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
              )}
            </div>

            {/* Right Waveform */}
            <div
              className={cn(
                "flex h-16 items-center transition-opacity duration-300",
                isSpeaking ? "opacity-100" : "invisible opacity-0",
              )}
            >
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
