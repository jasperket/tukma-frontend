"use client";

import { useState } from "react";
import { redirect, useRouter } from "next/navigation";
import { z } from "zod";
import { ArrowLeft, PlusCircle, X } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import Link from "next/link";
import { createJob } from "~/app/actions/recruiter";
import {
  JOB_TYPES,
  SHIFT_TYPES,
  LOCATION_TYPES,
  formatDisplayName,
} from "~/app/lib/constants/job-metadata";

// Zod schema for form validation
const createJobSchema = z.object({
  jobTitle: z.string().min(1, "Job title required"),
  jobDescription: z.string().min(1, "Job description required"),
  jobAddress: z.string().min(1, "Cebu IT Park"),
  jobType: z.enum(["FULL_TIME", "PART_TIME", "INTERNSHIP", "CONTRACT"], {
    required_error: "Job type is required",
  }),
  shiftType: z.enum(
    ["DAY_SHIFT", "NIGHT_SHIFT", "ROTATING_SHIFT", "FLEXIBLE_SHIFT"],
    {
      required_error: "Shift type is required",
    },
  ),
  shiftLengthHours: z.coerce
    .number()
    .min(1, "Shift length must be at least 1 hour")
    .max(24, "Shift length cannot exceed 24 hours"),
  locationType: z.enum(["ON_SITE", "REMOTE", "HYBRID"], {
    required_error: "Shift type is required",
  }),
  keywords: z.string().optional().default(""),
  behavioralQuestions: z.array(z.string()).optional(),
  technicalQuestions: z.array(z.string()).optional(),
});

export default function CreateJobPage() {
  const router = useRouter();
  const [behavioralQuestions, setBehavioralQuestions] = useState<string[]>([""]);
  const [technicalQuestions, setTechnicalQuestions] = useState<string[]>([""]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle behavioral questions
  const handleBehavioralQuestionChange = (index: number, value: string) => {
    const updatedQuestions = [...behavioralQuestions];
    updatedQuestions[index] = value;
    setBehavioralQuestions(updatedQuestions);
  };

  const addBehavioralQuestion = () => {
    setBehavioralQuestions([...behavioralQuestions, ""]);
  };

  const removeBehavioralQuestion = (index: number) => {
    if (behavioralQuestions.length > 1) {
      const updatedQuestions = [...behavioralQuestions];
      updatedQuestions.splice(index, 1);
      setBehavioralQuestions(updatedQuestions);
    }
  };

  // Handle technical questions
  const handleTechnicalQuestionChange = (index: number, value: string) => {
    const updatedQuestions = [...technicalQuestions];
    updatedQuestions[index] = value;
    setTechnicalQuestions(updatedQuestions);
  };

  const addTechnicalQuestion = () => {
    setTechnicalQuestions([...technicalQuestions, ""]);
  };

  const removeTechnicalQuestion = (index: number) => {
    if (technicalQuestions.length > 1) {
      const updatedQuestions = [...technicalQuestions];
      updatedQuestions.splice(index, 1);
      setTechnicalQuestions(updatedQuestions);
    }
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);

    // Extract and validate form data
    const rawData = {
      jobTitle: formData.get("jobTitle") as string,
      jobDescription: formData.get("jobDescription") as string,
      jobAddress: formData.get("jobAddress") as string,
      jobType: formData.get("jobType") as string,
      shiftType: formData.get("shiftType") as string,
      shiftLengthHours: Number(formData.get("shiftLengthHours")),
      locationType: formData.get("locationType") as string,
      keywords: formData.get("keywords") as string,
      behavioralQuestions: behavioralQuestions.filter(q => q.trim() !== ""),
      technicalQuestions: technicalQuestions.filter(q => q.trim() !== ""),
    };

    // Validate with Zod
    const result = createJobSchema.safeParse(rawData);

    if (!result.success) {
      // In a real app, you might want to handle validation errors better
      console.error("Validation failed:", result.error);
      setIsSubmitting(false);
      return;
    }

    const data = result.data;

    try {
      // Call the createJob server action
      const response = await createJob(data);

      if (response.success) {
        // Redirect to the jobs list on success
        router.push("/recruiter/view/" + response.job?.accessKey);
      } else {
        // In a real app, you would handle errors better
        console.error("Failed to create job:", response.error);
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setIsSubmitting(false);
    }
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/recruiter">
          <Button
            variant={"ghost"}
            className="flex items-center gap-2 text-text-200 hover:bg-background-800 hover:text-text-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Jobs
          </Button>
        </Link>
      </div>

      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle className="font-serif text-2xl text-text-100">
            Create New Job
          </CardTitle>
          <CardDescription className="text-text-300">
            Fill out the form below to create a new job posting.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="jobTitle"
                className="block text-sm font-medium text-text-200"
              >
                Job Title
              </label>
              <input
                type="text"
                id="jobTitle"
                name="jobTitle"
                required
                placeholder="e.g. Software Engineer"
                className="mt-1 block w-full rounded-md border border-background-800 bg-background-950 px-3 py-2 text-text-100 placeholder:text-text-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-stone-950"
              />
            </div>

            <div>
              <label
                htmlFor="jobDescription"
                className="block text-sm font-medium text-text-200"
              >
                Job Description
              </label>
              <textarea
                id="jobDescription"
                name="jobDescription"
                required
                rows={5}
                placeholder="Describe the job responsibilities, requirements, and qualifications..."
                className="mt-1 block w-full rounded-md border border-background-800 bg-background-950 px-3 py-2 text-text-100 placeholder:text-text-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-stone-950"
              />
            </div>

            <div>
              <label
                htmlFor="jobAddress"
                className="block text-sm font-medium text-text-200"
              >
                Address
              </label>
              <input
                type="text"
                id="jobAddress"
                required
                name="jobAddress"
                placeholder="IT Park"
                className="mt-1 block w-full rounded-md border border-background-800 bg-background-950 px-3 py-2 text-text-100 placeholder:text-text-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-stone-950"
              />
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label
                  htmlFor="jobType"
                  className="block text-sm font-medium text-text-200"
                >
                  Job Type
                </label>
                <select
                  id="jobType"
                  name="jobType"
                  required
                  defaultValue="FULL_TIME"
                  className="mt-1 block w-full rounded-md border border-background-800 bg-background-950 px-3 py-2 text-text-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-stone-950"
                >
                  {JOB_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {formatDisplayName(type)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="shiftType"
                  className="block text-sm font-medium text-text-200"
                >
                  Shift Type
                </label>
                <select
                  id="shiftType"
                  name="shiftType"
                  required
                  defaultValue="DAY_SHIFT"
                  className="mt-1 block w-full rounded-md border border-background-800 bg-background-950 px-3 py-2 text-text-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-stone-950"
                >
                  {SHIFT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {formatDisplayName(type)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label
                  htmlFor="shiftLengthHours"
                  className="block text-sm font-medium text-text-200"
                >
                  Shift Length (hours)
                </label>
                <input
                  type="number"
                  id="shiftLengthHours"
                  name="shiftLengthHours"
                  required
                  min={1}
                  max={24}
                  defaultValue={8}
                  className="mt-1 block w-full rounded-md border border-background-800 bg-background-950 px-3 py-2 text-text-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-stone-950"
                />
                <p className="mt-2 text-sm text-text-400">
                  Number of hours per shift
                </p>
              </div>

              <div>
                <label
                  htmlFor="locationType"
                  className="block text-sm font-medium text-text-200"
                >
                  Location Type
                </label>
                <select
                  id="locationType"
                  name="locationType"
                  required
                  defaultValue="ON_SITE"
                  className="mt-1 block w-full rounded-md border border-background-800 bg-background-950 px-3 py-2 text-text-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-stone-950"
                >
                  {LOCATION_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {formatDisplayName(type)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="keywords"
                className="block text-sm font-medium text-text-200"
              >
                Keywords (separated by commas)
              </label>
              <input
                type="text"
                id="keywords"
                name="keywords"
                placeholder="java, springboot, backend, frontend"
                className="mt-1 block w-full rounded-md border border-background-800 bg-background-950 px-3 py-2 text-text-100 placeholder:text-text-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-stone-950"
              />
            </div>

            {/* Behavioral Questions Section */}
            <div className="rounded-lg border border-background-800 p-4">
              <h3 className="mb-4 text-lg font-medium text-text-100">
                Behavioral Questions
              </h3>
              <p className="mb-4 text-sm text-text-300">
                Add questions that assess soft skills, past experiences, and problem-solving approaches.
              </p>
              
              <div className="space-y-4">
                {behavioralQuestions.map((question, index) => (
                  <div key={`behavioral-${index}`} className="flex items-start gap-2">
                    <textarea
                      value={question}
                      onChange={(e) => handleBehavioralQuestionChange(index, e.target.value)}
                      placeholder="e.g. Tell me about a time when you had to solve a complex problem."
                      className="flex-1 rounded-md border border-background-800 bg-background-950 px-3 py-2 text-text-100 placeholder:text-text-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-stone-950"
                      rows={2}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeBehavioralQuestion(index)}
                      className="shrink-0 text-text-300 hover:text-text-100"
                      disabled={behavioralQuestions.length === 1}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                ))}
              </div>
              
              <Button
                type="button"
                variant="ghost"
                onClick={addBehavioralQuestion}
                className="mt-4 flex items-center gap-1 text-sm text-primary-300 hover:text-primary-400"
              >
                <PlusCircle className="h-4 w-4" />
                Add another behavioral question
              </Button>
            </div>

            {/* Technical Questions Section */}
            <div className="rounded-lg border border-background-800 p-4">
              <h3 className="mb-4 text-lg font-medium text-text-100">
                Technical Questions
              </h3>
              <p className="mb-4 text-sm text-text-300">
                Add questions that assess technical skills, knowledge, and expertise relevant to the role.
              </p>
              
              <div className="space-y-4">
                {technicalQuestions.map((question, index) => (
                  <div key={`technical-${index}`} className="flex items-start gap-2">
                    <textarea
                      value={question}
                      onChange={(e) => handleTechnicalQuestionChange(index, e.target.value)}
                      placeholder="e.g. Explain how you would implement a sorting algorithm."
                      className="flex-1 rounded-md border border-background-800 bg-background-950 px-3 py-2 text-text-100 placeholder:text-text-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-stone-950"
                      rows={2}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeTechnicalQuestion(index)}
                      className="shrink-0 text-text-300 hover:text-text-100"
                      disabled={technicalQuestions.length === 1}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                ))}
              </div>
              
              <Button
                type="button"
                variant="ghost"
                onClick={addTechnicalQuestion}
                className="mt-4 flex items-center gap-1 text-sm text-primary-300 hover:text-primary-400"
              >
                <PlusCircle className="h-4 w-4" />
                Add another technical question
              </Button>
            </div>

            <div className="flex justify-end space-x-4">
              <Link href="/recruiter">
                <Button
                  type="button"
                  variant="outline"
                  className="border-background-800 text-text-200 hover:bg-background-800 hover:text-text-100"
                >
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                className="bg-primary-300 text-background-950 hover:bg-primary-400"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Create Job"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
