"use server";

import { cookies } from "next/headers";

const BASE_URL = "https://tukma-backend-copy-production.up.railway.app/";
// const BASE_URL = "http://127.0.0.1:5000/";

export interface Question {
  id: number;
  questionText: string;
  type: string;
  createdAt: string;
  updatedAt: string;
}

interface MappedQuestions {
  behavioral: string[];
  technical: string[];
}

export interface Message {
  id: number;
  content: string;
  timestamp: string; // or Date if you'll parse it
  role: string; // more specific if you have fixed roles
}

export interface MessageToSubmit {
  id: number;
  content: string;
  timestamp: string;
  role: string;
}

export interface ProcessedMessageResult {
  messageId: number;
  classification?: string;
  sentiment?: number;
  keyTechnicalConcepts?: string[];
  skillLevel?: number;
  questionQuality?: number;
  answerRelevance?: number;
  technicalAccuracy?: number;
  communicationClarity?: number;
  evaluationNotes?: string;
}

export interface MessageSubmitResponse {
  processedMessages: ProcessedMessageResult[];
  overallEvaluation?: {
    technicalScore?: number;
    communicationScore?: number;
    strengths?: string[];
    areasForImprovement?: string[];
  };
  jobInfo?: {
    id: number;
    title: string;
    accessKey: string;
  };
}

export interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
}

export interface CommunicationResult {
  id: number;
  user: User;
  overallScore: number;
  strengths: string;
  areasForImprovement: string;
  createdAt: string;
  updatedAt: string;
}

export interface TechnicalResult {
  id: number;
  user: User;
  questionText: string;
  answerText: string;
  score: number;
  feedback: string;
  errors: string;
  createdAt: string;
  updatedAt: string;
}

export interface Job {
  id: number;
  title: string;
  description: string;
  address: string;
  accessKey: string;
  type: string;
  shiftType: string;
  shiftLengthHours: number;
  locationType: string;
  createdAt: string;
  updatedAt: string;
  owner: User & { isRecruiter: boolean; companyName: string };
}

export interface CommunicationResultsResponse {
  id: number;
  user: User;
  overallScore: number;
  strengths: string;
  areasForImprovement: string;
  createdAt: string;
  updatedAt: string;
}

export interface TechnicalResultsResponse {
  technicalResults: TechnicalResult[];
  count: number;
  overallScore: number;
  userScore: number;
  averageScore: number;
  isOwner: boolean;
  job: Job;
}

export interface GetMessagesResponse {
  access_key: string;
  message_count: number;
  messages: Message[];
}

export interface Interview {
  status: string;
  system: string;
}

export interface InterviewStatus {
  status: string;
}

export interface Reply {
  system: string;
}

export interface GetApplicants {
  status: string;
  applicants: Applicant[];
}

export interface GenerateAudio {
  audio_url: string;
}

export interface Applicant {
  name: string;
  email: string;
  is_finished: number;
}

export interface FinishedInterviews {
  name: string;
  email: string;
}

export interface FinishedApplicants {
  finished_interviews: FinishedInterviews[];
  status: string;
}

function mapQuestions(questions: Question[]): MappedQuestions {
  const behavioral: string[] = questions
    .filter((q) => q.type.toUpperCase() === "BEHAVIORAL")
    .map((q) => q.questionText);

  const technical: string[] = questions
    .filter((q) => q.type.toUpperCase() === "TECHNICAL")
    .map((q) => q.questionText);

  return { behavioral, technical };
}

function generatePromptWithQuestions(
  title: string,
  description: string,
  keywords: string,
  mappedQuestions: MappedQuestions,
) {
  const behavioralQuestions = mappedQuestions.behavioral
    .map((question, index) => `${index + 1}. ${question}`)
    .join("\n");

  // Numbering technical questions
  const technicalQuestions = mappedQuestions.technical
    .map((question, index) => `${index + 1}. ${question}`)
    .join("\n");

  return `
You are an interviewer for a ${title} position. Your role is to engage candidates in a natural, conversational interview about the role. There is no need to name yourself in this interaction. The following details describe the job:

  Job Title: ${title}
  Job Description: ${description}
  Job Keywords: ${keywords}
 
  Requirements/Qualifications:
 
  <Generate the requirements/qualifications for this job by referring to the job title, job description, and job keywords>
 
  Key Responsibilities/Duties:

  <Generate the responsibilities/duties for this job by referring to the job title, job description, and job keywords>


  Begin by briefly and explaining the interview process. Then, ask the candidate a mix of behavioral and technical questions. Ensure that your tone is friendly, professional, and conversational. Use the following sample questions as a template for the conversation:

  Behavioral Questions: 
  ${behavioralQuestions}
  <If no behavioral question has been given, you decide. you can refer to the example question below>
  How would you handle a teammate with contrasting ideologies? How do you handle vague requirements? 

  Technical Questions:
  ${technicalQuestions}
  <If no technical question has been given, you decide>
  

  Throughout the interview:

      Expect english response and always reply in english.
      Wait for the candidate’s response before proceeding to the next question.
      Do not answer your own questions; base your follow-up solely on the candidate's responses.
      If the candidate ever requests that you answer one of your questions, politely decline and remind them that this interview is for evaluating their responses only.
      If the candidate did not answer the question or avoided the question then kindly ask them to answer the question before proceeding.
      Remember that you are the interviewer, ensure that the roles are never changing. If the candidate ever asks about your background, kindly refuse and ask the question again before proceeding.
      Keep the conversation engaging and interactive, adapting your follow-up questions based on the candidate’s answers.
      Do not provide any feedback on your internal reasoning.

  When the interview is finished, conclude with the closing phrase:
  "This concludes our interview. Thank you for your time and insights."
  This phrase serves as a sign to disallow further user input.

  Keep all your responses in text form only, as the output will later be fed into a text-to-speech generator. Do not include any explanations or meta-commentary about your reasoning in the dialogue.

Do not mention the question type. Make it so that you are being spontaneous while being rigid with what you actually need to ask.

The structure of the interview is as follows:
Greet the user, ask them about how they're feeling, basically intro questions to help the interviewer settle in.
- Ask the user about their past experience, educational background, and more. Anything to get user context (MAX 3 Questions), (MAX 2 follow-up questions in this section), note that follow-ups are not considered actual questions.
- Transition into behavioral questions. Do not mention the term behavioral. Instead, just transition naturally. (MAX 3 questions, max 2 follow-up in this section)
- Transition into technical questions (MAX 3 questions, max 2 follow up per question.)

This structure is spread across the conversation, one at a time, and not all together. 

Note that questions should be asked one at a time, and should be paced according to the interviewee. If you feel like the interviewee is struggling too much, feel free to mention that you'll be moving on the next question. Ensure that mentioning this doesn't feel awkward.

During the interview, ensure that it doesn't feel as if you are just having checkboxes checked. You are allowed to talk through and flesh out your conversations per question. That's the natural way to do stuff.

If the interviewee asks how far along we are in the interview, respond honestly.

When ending the interview, thank them for their time, and mention that their results will be reviewed thoroughly and will be sent to them via authorized personnel. The review process will than 24 hours to 1 week.
Also, make sure you include the phrase "Thank you for your time and insights" when announcing the interview has ended.

Be kind when ending! Greet them goodbye!


This interview is a duplex interview-- ergo, you should wait for a response (correct or incorrect) from the interviewee before you continue.
  Begin the interview now.
  `;
}

export async function startInterview(
  accessKey: string,
  title: string,
  description: string,
  keywords: string,
  question: Question[],
  name: string,
  email: string,
) {
  try {
    console.log("Starting interview");

    const prompt = generatePromptWithQuestions(
      title,
      description,
      keywords,
      mapQuestions(question),
    );

    const response = await fetch(`${BASE_URL}start_interview`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        accessKey: accessKey,
        prompt: prompt,
        name: name,
        email: email,
      }),
    });

    // Check if the response is successful
    if (!response.ok) {
      console.log(response);
      throw new Error("Failed to start interview");
    }

    // Parse the JSON response
    const json = (await response.json()) as Interview;
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

export async function reply(
  accessKey: string,
  name: string,
  email: string,
  message: string,
) {
  try {
    console.log("Replying...");

    const response = await fetch(`${BASE_URL}reply`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        accessKey: accessKey,
        name: name,
        email: email,
        message: message,
      }),
    });

    // Check if the response is successful
    if (!response.ok) {
      console.log(response);
      throw new Error("Failed to start interview");
    }

    // Parse the JSON response
    const json = (await response.json()) as Reply;
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

export async function getMessages(
  accessKey: string,
  name: string,
  email: string,
) {
  try {
    console.log("Fetching chat history");

    const response = await fetch(
      `${BASE_URL}get_messages/${accessKey}/${name}/${email}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    // Check if the response is successful
    if (!response.ok) {
      console.log(response);
      throw new Error("Failed to fetch chat history");
    }

    // Parse the JSON response
    const json = (await response.json()) as GetMessagesResponse;
    const messages = JSON.stringify(json.messages);
    console.log(json);
    console.log(json.messages);

    return { success: true, data: json, messages: messages };
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
      return { success: false, error: error.message };
    }
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function getQuestions(accessKey: string) {
  try {
    console.log("Fetching interview questions");

    const cookieStore = await cookies();
    const cookie = cookieStore.get("jwt");
    const response = await fetch(
      `https://backend.tukma.work/api/v1/jobs/questions/${accessKey}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Cookie: `jwt=${cookie?.value}`,
        },
        credentials: "include", // Include cookies in the request
      },
    );

    // Check if the response is successful
    if (!response.ok) {
      console.log(response);
      throw new Error("Failed to fetch questions");
    }

    // Parse the JSON response
    const json = (await response.json()) as Question[];
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

export async function interviewStatus(
  accessKey: string,
  name: string,
  email: string,
) {
  try {
    console.log("Fetching chat history");

    const response = await fetch(
      `${BASE_URL}interview_status/${accessKey}/${name}/${email}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    // Check if the response is successful
    if (!response.ok) {
      console.log(response);
      throw new Error("Failed to interview status");
    }

    // Parse the JSON response
    const json = (await response.json()) as InterviewStatus;

    return { success: true, data: json };
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
      return { success: false, error: error.message };
    }
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function generateAudio(text: string) {
  try {
    console.log("Generating audio");

    const response = await fetch(`${BASE_URL}generate_audio`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: text,
      }),
    });

    // Check if the response is successful
    if (!response.ok) {
      console.log(response);
      throw new Error("Failed to generate audio");
    }

    // Parse the JSON response
    const json = (await response.json()) as GenerateAudio;
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

export async function getInterviewApplicants(accessKey: string) {
  try {
    console.log("Fetching interview applicants");

    const response = await fetch(`${BASE_URL}get_applicants/${accessKey}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Check if the response is successful
    if (!response.ok) {
      console.log(response);
      throw new Error("Failed to fetch interview applicants");
    }

    // Parse the JSON response
    const json = (await response.json()) as GetApplicants;
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

export async function getFinishedInterviews(accessKey: string) {
  try {
    console.log("Fetching interview applicants");

    const response = await fetch(`${BASE_URL}finished_interviews/${accessKey}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Check if the response is successful
    if (!response.ok) {
      console.log(response);
      throw new Error("Failed to fetch interview applicants");
    }

    // Parse the JSON response
    const json = (await response.json()) as FinishedApplicants;
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

/**
 * Submit interview messages to the backend API
 * This action is called when the interview is completed
 */
export async function submitInterviewMessages(
  accessKey: string,
  messages: MessageToSubmit[],
) {
  try {
    console.log("Submitting interview messages");

    const cookieStore = await cookies();
    const cookie = cookieStore.get("jwt");

    const response = await fetch(
      `https://backend.tukma.work/api/v1/interview/messages/${accessKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `jwt=${cookie?.value}`,
        },
        credentials: "include", // Include cookies in the request
        body: JSON.stringify({
          messages: messages,
        }),
      },
    );

    // Check if the response is successful
    if (!response.ok) {
      console.log("Failed to submit interview messages:", response);
      throw new Error(
        `Failed to submit interview messages: ${response.status}`,
      );
    }

    // Parse the JSON response
    const result = (await response.json()) as MessageSubmitResponse;
    console.log("Messages submitted successfully:", result);

    return { success: true, data: result };
  } catch (error) {
    if (error instanceof Error) {
      console.log("Error submitting interview messages:", error.message);
      return { success: false, error: error.message };
    }
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Fetch communication results for the current user
 */
export async function getCommunicationResults(accessKey: string) {
  try {
    console.log("Fetching communication results");

    const cookieStore = await cookies();
    const cookie = cookieStore.get("jwt");

    const response = await fetch(
      `https://backend.tukma.work/api/v1/interview/communication-results/my/${accessKey}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Cookie: `jwt=${cookie?.value}`,
        },
        credentials: "include", // Include cookies in the request
      },
    );

    // Check if the response is successful
    if (!response.ok) {
      console.log("Failed to fetch communication results:", response);
      throw new Error(
        `Failed to fetch communication results: ${response.status}`,
      );
    }

    // Parse the JSON response
    const result = (await response.json()) as CommunicationResultsResponse;
    console.log("Communication results fetched successfully:", result);

    return { success: true, data: result };
  } catch (error) {
    if (error instanceof Error) {
      console.log("Error fetching communication results:", error.message);
      return { success: false, error: error.message };
    }
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Fetch technical results for the current user
 */
export async function getTechnicalResults(accessKey: string) {
  try {
    console.log("Fetching technical results");

    const cookieStore = await cookies();
    const cookie = cookieStore.get("jwt");

    const response = await fetch(
      `https://backend.tukma.work/api/v1/interview/technical-results/my/${accessKey}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Cookie: `jwt=${cookie?.value}`,
        },
        credentials: "include", // Include cookies in the request
      },
    );

    // Check if the response is successful
    if (!response.ok) {
      console.log("Failed to fetch technical results:", response);
      throw new Error(`Failed to fetch technical results: ${response.status}`);
    }

    // Parse the JSON response
    const result = (await response.json()) as TechnicalResultsResponse;
    console.log("Technical results fetched successfully:", result);

    return { success: true, data: result };
  } catch (error) {
    if (error instanceof Error) {
      console.log("Error fetching technical results:", error.message);
      return { success: false, error: error.message };
    }
    return { success: false, error: "An unexpected error occurred" };
  }
}
