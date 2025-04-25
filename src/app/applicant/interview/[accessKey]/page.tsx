"use client";

import React, { ReactNode, useEffect, useRef, useState } from "react";
import { CheckCircle, ChevronRight, Mic, MicOff } from "lucide-react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import {
  generateAudio,
  getMessages,
  getQuestions,
  interviewStatus,
  Message,
  MessageToSubmit,
  Question,
  reply,
  startInterview,
  submitInterviewMessages,
} from "~/app/actions/interview";
import { getJobDetails, JobWithKeywords } from "~/app/actions/recruiter";
import { getUserInfo } from "~/app/actions/auth";
import { Label } from "@radix-ui/react-label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { useRouter } from "next/navigation";
import {
  getAllQuestions,
  submitSurvey,
  Question as SurveyQuestion,
} from "~/app/actions/survey";
import InvisibleAudioPlayer from "./components/AudioPlayer";
import { getResumeText } from "~/app/actions/resume";

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
  const [messagesSubmitted, setMessagesSubmitted] = useState<boolean>(false);
  const [submittingMessages, setSubmittingMessages] = useState<boolean>(false);
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [user_agent, setUserAgent] = useState<string>("");

  const [showSurvey, setShowSurvey] = useState<boolean>(false);
  const [surveySubmitted, setSurveySubmitted] = useState<boolean>(false);
  const [responses, setResponses] = useState<Record<number, number>>({});
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [submittingSurvey, setSubmittingSurvey] = useState<boolean>(false);
  const [surveyQuestions, setSurveyQuestions] = useState<SurveyQuestion[]>([]);

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
  const resumeText = useRef<string | null>(null);

  useEffect(() => {
    const ua = navigator.userAgent;
    if (ua.includes("Firefox")) {
      console.log(ua);
      setUserAgent(
        "Please use a Chrome-based browser, such as Google Chrome or Brave, or a WebKit browser, to proceed with this interview.",
      );
      setLoading(false);
      return;
    }

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
        // Get survey questions if interview is finished
        const surveyResponse = await getAllQuestions();
        if (surveyResponse.success && surveyResponse.data) {
          setSurveyQuestions(surveyResponse.data);
        }

        // Submit the messages to the backend if not already submitted
        if (messages && messages.length > 0 && !messagesSubmitted) {
          await submitMessagesToBackend();
        }

        setLoading(false);
        return;
      }

      const job = await getJobDetails(accessKey!);
      const question = await getQuestions(accessKey!);
      const resumeTextRes = await getResumeText(accessKey!, emailRef.current);
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
      resumeText.current = resumeTextRes.data?.content ?? "";

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

      if (!currentTranscript) {
        return;
      }

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

        if (response2.success) {
          modifyMessage(response2.data!.messages);

          // Check if the interview status has changed
          const statusResponse = await interviewStatus(
            getKey(),
            nameRef.current!,
            emailRef.current!,
          );

          if (statusResponse.success) {
            const newStatus = statusResponse.data!.status;
            setInterviewStatus(newStatus);

            // If the interview just finished, submit the messages
            if (
              newStatus === "finished" &&
              !messagesSubmitted &&
              !submittingMessages
            ) {
              await submitMessagesToBackend();
            }
          }
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
  }, [messages, thinking, transcript, messagesSubmitted, loading]);

  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  // Effect to monitor interview status changes and submit messages when finished
  useEffect(() => {
    // If the interview just finished and we have messages that aren't submitted yet
    if (
      interview_status === "finished" &&
      messages &&
      messages.length > 0 &&
      !messagesSubmitted
    ) {
      submitMessagesToBackend();
    }
  }, [interview_status, messages, messagesSubmitted]);

  // Effect to redirect to results page when survey is submitted
  useEffect(() => {
    if (surveySubmitted && interview_status === "finished") {
      // Use a small delay to allow the UI to update before redirecting
      const redirectTimer = setTimeout(() => {
        router.push(`/applicant/interview/${getKey()}/results`);
      }, 1500); // 1.5 second delay

      return () => clearTimeout(redirectTimer);
    }
  }, [surveySubmitted, interview_status, router]);

  function modifyMessage(message: Message[]) {
    if (message.length < 2) {
      return;
    }

    const current_message = message[message.length - 1];

    async function getAudio() {
      const audioRes = await generateAudio(current_message!.content);

      if (!audioRes.success) {
        return;
      }

      setAudioUrl(audioRes.data!.audio_url);
    }

    getAudio();

    const messages = message.slice(1);
    setTimeout(() => {
      setThinking(false);
      setMessages(messages);
      setTranscript("");
    }, 2000);
  }

  // Submit interview messages to the backend
  async function submitMessagesToBackend() {
    if (
      !messages ||
      messages.length === 0 ||
      messagesSubmitted ||
      submittingMessages
    ) {
      return;
    }

    try {
      setSubmittingMessages(true);
      console.log("Preparing to submit interview messages");

      // Convert messages to the format expected by the backend
      const messagesToSubmit: MessageToSubmit[] = messages.map((msg) => ({
        id: msg.id,
        content: msg.content,
        timestamp: msg.timestamp,
        role: msg.role,
      }));

      // Submit the messages
      const result = await submitInterviewMessages(getKey(), messagesToSubmit);

      if (result.success) {
        console.log("Successfully submitted interview messages");
        setMessagesSubmitted(true);
      } else {
        console.error("Failed to submit interview messages:", result.error);
      }
    } catch (error) {
      console.error("Error submitting interview messages:", error);
    } finally {
      setSubmittingMessages(false);
    }
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

  const handleSubmitSurvey = async () => {
    setSubmittingSurvey(true);

    try {
      // Convert responses object to array format expected by the API
      const answersArray = Object.entries(responses).map(
        ([questionIndex, score]) => {
          // Using SUS questions from the array if we don't have actual survey questions from the API
          const parsedIndex = parseInt(questionIndex);
          const questionId =
            surveyQuestions &&
            surveyQuestions.length > parsedIndex &&
            surveyQuestions[parsedIndex] // Check bounds and existence first
              ? surveyQuestions[parsedIndex].id // Safe to access .id here (added non-null assertion !)
              : parseInt(questionIndex) + 1; // Fallback to using index + 1 if we don't have actual question IDs

          return {
            questionId: questionId,
            score: score,
          };
        },
      );

      // Submit survey answers to the API
      const result = await submitSurvey(answersArray);

      if (result.success) {
        setSurveySubmitted(true);
        setShowSurvey(false);

        // Redirect to results page after successful survey submission
        router.push(`/applicant/interview/${getKey()}/results`);
      } else {
        console.error("Error submitting survey:", result.error);
        // Show error message to user
        alert("There was an error submitting your survey. Please try again.");
      }
    } catch (error) {
      console.error("Error in survey submission:", error);
      alert("An unexpected error occurred. Please try again.");
    } finally {
      setSubmittingSurvey(false);
    }
  };

  const handleFinish = () => {
    // Redirect to results page instead of job view
    router.push(`/applicant/interview/${getKey()}/results`);
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
      resumeText.current!,
    );

    const messages = await getMessages(
      getKey(),
      nameRef.current!,
      emailRef.current!,
    );
    if (messages?.success) {
      modifyMessage(messages.data!.messages);
    }
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
      <InvisibleAudioPlayer audioUrl={audioUrl} />

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center p-6">
        <div className="w-full rounded-xl bg-white p-6 shadow-sm md:p-8">
          <h1 className="mb-6 text-2xl font-bold text-[#3c3c3c] md:text-3xl">
            Interview
          </h1>

          <div className="mb-8 rounded-lg bg-[#f8f7f4] md:p-8">
            {/* Conversation Area */}
            <div
              className="mb-6 max-h-[450px] min-h-[450px] space-y-6 overflow-y-auto scroll-smooth pr-2"
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
              {user_agent && <p className="text-red-500">{user_agent}</p>}
              {transcript && (
                <UserThinking role="test">{transcript}</UserThinking>
              )}
              {loading && (
                <SystemThinking role={"test"}>Loading</SystemThinking>
              )}
              {thinking && (
                <SystemThinking role={"test"}>Thinking</SystemThinking>
              )}
              {interview_status === "uninitiated" &&
                !user_agent &&
                !loading && (
                  <UserThinking role={"test"}>
                    Press the &quot;Start Interview&quot; button to begin
                  </UserThinking>
                )}
            </div>
          </div>

          {!showSurvey &&
            !surveySubmitted &&
            interview_status === "finished" && (
              <div className="mb-8 space-y-6">
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <h3 className="mb-2 font-medium text-amber-800">
                    Interview Complete
                  </h3>
                  {submittingMessages ? (
                    <p className="flex items-center text-sm text-amber-700">
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-amber-700 border-t-transparent"></span>
                      Submitting interview data...
                    </p>
                  ) : (
                    <p className="text-sm text-amber-700">
                      {messagesSubmitted
                        ? "Interview data submitted successfully. "
                        : ""}
                      Please complete a short System Usability Scale (SUS)
                      survey to help us evaluate the system.
                    </p>
                  )}
                </div>

                <Button
                  onClick={() => setShowSurvey(true)}
                  className="w-full bg-[#b78467] hover:bg-[#a07358]"
                  disabled={submittingMessages}
                >
                  Start System Usability Survey{" "}
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}

          {showSurvey &&
            !surveySubmitted &&
            interview_status === "finished" && (
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
                      disabled={
                        responses[currentQuestion] === undefined ||
                        submittingSurvey
                      }
                    >
                      {submittingSurvey ? (
                        <div className="flex items-center gap-2">
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                          <span>Submitting...</span>
                        </div>
                      ) : (
                        "Submit Survey"
                      )}
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
              <p className="mb-2 text-gray-600">
                Thank you for completing the System Usability Scale survey. Your
                feedback is valuable to us.
              </p>
              <p className="mb-6 text-sm text-primary-500">
                Redirecting to your results page...
              </p>
              <Button
                className="w-full bg-[#b78467] hover:bg-[#a07358]"
                onClick={() => handleFinish()}
              >
                View Your Results <ChevronRight className="ml-2 h-4 w-4" />
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
                  disabled={loading || user_agent.length > 0}
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
