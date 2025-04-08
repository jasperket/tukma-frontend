"use client";

import React, { ReactNode, useEffect, useRef, useState } from "react";
import { CheckCircle, ChevronRight, Mic, MicOff, XCircle } from "lucide-react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import {
  getMessages,
  getQuestions,
  interviewStatus,
  Message,
  Question,
  reply,
  startInterview,
} from "~/app/actions/interview";
import { getJobDetails, JobWithKeywords } from "~/app/actions/recruiter";
import { getUserInfo } from "~/app/actions/auth";
import { Label } from "@radix-ui/react-label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { useRouter } from "next/navigation";

interface Props {
  children: ReactNode;
  role: string;
}

const susQuestions = [
  "I think that I would like to use this system frequently.",
  "I found the system unnecessarily complex.",
  "I thought the system was easy to use.",
  "I think that I would need the support of a technical person to be able to use this system.",
  "I found the various functions in this system were well integrated.",
  "I thought there was too much inconsistency in this system.",
  "I would imagine that most people would learn to use this system very quickly.",
  "I found the system very cumbersome to use.",
  "I felt very confident using the system.",
  "I needed to learn a lot of things before I could get going with this system.",
];

const Survey: React.FC = () => {
  return <></>;
};

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
  const router = useRouter();

  const [loading, setLoading] = useState<boolean>(true);
  const [thinking, setThinking] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [mic, setMic] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [interview_status, setInterviewStatus] =
    useState<string>("uninitiated");

  const [showSurvey, setShowSurvey] = useState<boolean>(false);
  const [surveySubmitted, setSurveySubmitted] = useState<boolean>(false);
  const [responses, setResponses] = useState<Record<number, number>>({});
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);

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
      if (!userInfo.success) {
        setError(true);
        return;
      }

      nameRef.current =
        userInfo.data!.userDetails.firstName +
        " " +
        userInfo.data!.userDetails.lastName;
      emailRef.current = userInfo.data!.userDetails.username;

      const in_stats = await interviewStatus(
        accessKey!,
        nameRef.current,
        emailRef.current,
      );
      if (!in_stats.success) {
        setError(true);
        return;
      }
      setInterviewStatus(in_stats.data!.status);

      const msg_response = await getMessages(
        accessKey!,
        nameRef.current,
        emailRef.current,
      );
      if (!msg_response.success) {
        setError(true);
        return;
      }
      modifyMessage(msg_response.data!.messages);

      if (in_stats.data?.status === "finished") {
        setLoading(false);
        return;
      }

      const job = await getJobDetails(accessKey!);
      const question = await getQuestions(accessKey!);
      if (!job.success) {
        setError(true);
        return;
      }
      if (!question.success) {
        setError(true);
        return;
      }

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

    async function init() {
      const interview_status = await interviewStatus(
        getKey(),
        nameRef.current!,
        emailRef.current!,
      );
      if (!interview_status.success) {
        setError(true);
        return;
      }
      setInterviewStatus(interview_status.data!.status);
    }

    init();
  }

  const handleSubmitSurvey = () => {
    setSurveySubmitted(true);
    setShowSurvey(false);
  };
  
  const handleFinish = () => {
    router.push(`/applicant/view/${getKey()}`);
  };

  async function handleStartInterview() {
    setInterviewStatus("started");

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

  const handleNextQuestion = () => {
    if (currentQuestion < susQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handleResponse = (value: string) => {
    const numValue = Number.parseInt(value);
    setResponses({
      ...responses,
      [currentQuestion]: numValue,
    });
    // Removed auto-advancement to next question
  };

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
              {!loading &&
                messages?.map((message) => (
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
              {interview_status === "uninitiated" && !loading && (
                <UserThinking role={"test"}>
                  Press the &quot;Start Interview&quot; button to begin
                </UserThinking>
              )}
            </div>
          </div>

          {!showSurvey && !surveySubmitted && interview_status === "finished" && (
            <div className="mb-8 space-y-6">
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <h3 className="mb-2 font-medium text-amber-800">
                  Interview Complete
                </h3>
                <p className="text-sm text-amber-700">
                  Thank you for participating in our interview. Please complete
                  a short System Usability Scale (SUS) survey to help us
                  evaluate the system.
                </p>
              </div>

              <Button
                onClick={() => setShowSurvey(true)}
                className="w-full bg-[#b78467] hover:bg-[#a07358]"
              >
                Start System Usability Survey{" "}
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          {showSurvey && !surveySubmitted && interview_status === "finished" && (
            <div className="mb-8 space-y-6">
              <h2 className="text-xl font-medium">
                System Usability Scale (SUS)
              </h2>

              <div className="mb-6">
                <h3 className="mb-4 text-lg font-medium">
                  Question {currentQuestion + 1} of {susQuestions.length}
                </h3>
                <p className="mb-4 text-gray-700">
                  {susQuestions[currentQuestion]}
                </p>
              </div>

              <RadioGroup
                value={responses[currentQuestion]?.toString() ?? ""}
                onValueChange={handleResponse}
                className="space-y-3"
              >
                <div className="mb-2 flex justify-between text-sm text-gray-500">
                  <span>Strongly Disagree</span>
                  <span>Strongly Agree</span>
                </div>
                <div className="flex justify-between gap-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <div key={value} className="flex flex-col items-center">
                      <RadioGroupItem
                        value={value.toString()}
                        id={`q${currentQuestion}-${value}`}
                        className="mb-1"
                      />
                      <Label
                        htmlFor={`q${currentQuestion}-${value}`}
                        className="text-sm"
                      >
                        {value}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() =>
                    currentQuestion > 0 &&
                    setCurrentQuestion(currentQuestion - 1)
                  }
                  disabled={currentQuestion === 0}
                >
                  Previous
                </Button>

                {currentQuestion < susQuestions.length - 1 ? (
                  <Button
                    className="bg-[#b78467] hover:bg-[#a07358]"
                    onClick={handleNextQuestion}
                    disabled={responses[currentQuestion] === undefined}
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    className="bg-[#b78467] hover:bg-[#a07358]"
                    onClick={handleSubmitSurvey}
                    disabled={responses[currentQuestion] === undefined}
                  >
                    Submit Survey
                  </Button>
                )}
              </div>
            </div>
          )}

          {surveySubmitted && interview_status === "finished" && (
            <div className="mb-8 text-center">
              <div className="mb-4 inline-flex rounded-full bg-green-100 p-3">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              <h2 className="mb-2 text-xl font-bold">Survey Submitted</h2>
              <p className="mb-6 text-gray-600">
                Thank you for completing the System Usability Scale survey. Your
                feedback is valuable to us.
              </p>
              <Button className="w-full bg-[#b78467] hover:bg-[#a07358]" onClick={() => handleFinish()}>
                Finish
              </Button>
            </div>
          )}

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
              {interview_status === "uninitiated" && (
                <Button
                  className="border-[#8b6e4e] bg-[#8b6e4e] text-white hover:bg-[#6d563d]"
                  disabled={loading}
                  onClick={() => handleStartInterview()}
                >
                  Start Interview
                </Button>
              )}
              {interview_status === "started" && (
                <Button
                  size="lg"
                  disabled={loading}
                  variant={mic ? "destructive" : "default"}
                  className={cn(
                    "h-16 w-16 rounded-full p-0",
                    !mic && "bg-primary-400 hover:bg-primary-500",
                  )}
                  onClick={() => handleMic()}
                >
                  {mic ? (
                    <Mic className="h-6 w-6" />
                  ) : (
                    <MicOff className="h-6 w-6" />
                  )}
                </Button>
              )}
              {interview_status === "finished" && (
                <Button
                  size="lg"
                  disabled={true}
                  variant={mic ? "destructive" : "default"}
                  className={cn(
                    "h-16 w-16 rounded-full p-0",
                    !mic && "bg-primary-400 hover:bg-primary-500",
                  )}
                  onClick={() => handleMic()}
                >
                  {mic ? (
                    <Mic className="h-6 w-6" />
                  ) : (
                    <MicOff className="h-6 w-6" />
                  )}
                </Button>
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

function splitTextIntoChunks(text: string, maxLength = 200): string[] {
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
