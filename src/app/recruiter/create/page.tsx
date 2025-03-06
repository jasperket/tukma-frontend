import { redirect } from "next/navigation";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";
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
});

export default function CreateJobPage() {
  async function handleSubmit(formData: FormData) {
    "use server";

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
    };

    // Validate with Zod
    const result = createJobSchema.safeParse(rawData);

    if (!result.success) {
      // In a real app, you might want to handle validation errors better
      console.error("Validation failed:", result.error);
      return;
    }

    const data = result.data;

    // Call the createJob server action
    const response = await createJob(data);

    if (response.success) {
      // Redirect to the jobs list on success
      redirect("/recruiter/view/" + response.job?.accessKey);
    } else {
      // In a real app, you would handle errors better
      console.error("Failed to create job:", response.error);
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
          <form action={handleSubmit} className="space-y-6">
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
                  defaultValue="DAY_SHIFT"
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
                Keywords separated by commas
              </label>
              <input
                type="text"
                id="keywords"
                name="keywords"
                placeholder="java springboot backend frontend"
                className="mt-1 block w-full rounded-md border border-background-800 bg-background-950 px-3 py-2 text-text-100 placeholder:text-text-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-stone-950"
              />
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
              >
                Create Job
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
