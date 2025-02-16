"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import logo from "../../../../public/logo.png";
import { LogOutButton } from "./LogOutButton";
import ButtonSmall from "./ButtonSmall";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { createJob, deleteJob, fetchJobs } from "~/app/actions/employer";
import { LoaderCircle, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

interface Owner {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  recruiter: boolean;
  accountNonExpired: boolean;
  accountNonLocked: boolean;
  credentialsNonExpired: boolean;
}

export interface Job {
  id: number;
  owner: Owner;
  description: string;
  title: string;
  accessKey: string;
}

const createJobSchema = z.object({
  jobTitle: z.string().min(1, "Job title required"),
  jobDescription: z.string().min(1, "Job description required"),
});

export type CreateJobFormValues = z.infer<typeof createJobSchema>;

function CreateJobs() {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState<undefined | boolean>(undefined);
  const createJobForm = useForm<CreateJobFormValues>({
    resolver: zodResolver(createJobSchema),
    defaultValues: {
      jobTitle: "",
      jobDescription: "",
    },
  });

  const onSubmit = async (data: CreateJobFormValues) => {
    setIsLoading(true); // Set loading state to true

    try {
      const result = await createJob(data); // Wait for the job creation to complete
      setSuccess(result.success); // Set success state with the result
    } catch (error) {
      console.error("Error creating job:", error); // Handle any errors
      setSuccess(false); // Optionally, set success to false if there's an error
    } finally {
      setIsLoading(false); // Ensure loading state is set to false, regardless of success or failure
    }

    setTimeout(() => {
      setSuccess(undefined);
    }, 3000);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Create New Job Posting</CardTitle>
        </CardHeader>
        <CardContent>
          <FormProvider {...createJobForm}>
            <form
              onSubmit={createJobForm.handleSubmit(onSubmit)}
              className="space-y-4"
            >
              <FormField
                control={createJobForm.control}
                name="jobTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-text-200">Job Title</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Enter job title"
                        {...field}
                        disabled={isLoading}
                        className="border-background-800 bg-background-950 text-text-100 placeholder:text-text-400"
                      />
                    </FormControl>
                    <FormMessage className="text-primary-300" />
                  </FormItem>
                )}
              />
              <FormField
                control={createJobForm.control}
                name="jobDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-text-200">
                      Job Description
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter job description"
                        {...field}
                        disabled={isLoading}
                        className="border-background-800 bg-background-950 text-text-100 placeholder:text-text-400"
                      />
                    </FormControl>
                    <FormMessage className="text-primary-300" />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                disabled={isLoading}
                className="relative w-full bg-primary-300 hover:bg-primary-400"
              >
                {isLoading ? (
                  <div className="absolute flex items-center justify-center">
                    <span className="loader"></span>
                  </div>
                ) : (
                  "Create Job"
                )}
              </Button>
            </form>
          </FormProvider>
        </CardContent>
        <CardFooter className="justify-center">
          {success === true && (
            <p className="text-green-500">Job created successfully</p>
          )}
          {success === false && (
            <p className="text-red-500">An error occurred while creating job</p>
          )}
        </CardFooter>
      </Card>
    </>
  );
}

function ShowJobs() {
  const [jobs, setJobs] = useState<Job[]>();
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleDelete = (job: Job) => {
    setJobToDelete(job);
  };

  const confirmDelete = async () => {
    setLoading(true);
    if (await deleteJob(jobToDelete!.accessKey)) {
      setJobs(jobs!.filter((job) => job.id !== jobToDelete!.id));
      setJobToDelete(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    const fetch = async () => {
      const result = await fetchJobs();
  
      // Check if the result is an array of jobs
      if (Array.isArray(result)) {
        setJobs(result); // Set the jobs state
      } else {
        // Handle the error case
        console.error(result.error);
        setJobs(undefined); // Optionally set jobs to undefined or an empty array
      }
    };
  
    fetch();

    fetch();
  }, []);

  return (
    <>
      <div className="grid max-w-5xl gap-4">
        {jobs?.map((job) => (
          <Card key={job.id} className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold capitalize text-[#4a3f35]">
                {job.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="line-clamp-2 break-all capitalize text-[#666666]">
                {job.description}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm text-[#8b6f5d]"></span>
                <Button
                  variant="outline"
                  className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                  onClick={() => handleDelete(job)}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="ml-2">Delete</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Delete Confirmation Dialog */}
        <Dialog open={!!jobToDelete} onOpenChange={() => setJobToDelete(null)}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-[#4a3f35]">
                Confirm Deletion
              </DialogTitle>
              <DialogDescription className="text-[#666666]">
                Are you sure you want to delete the job:{" "}
                <span className="font-semibold">{jobToDelete?.title}</span>?
                This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="sm:justify-start">
              <Button
                type="button"
                variant="destructive"
                onClick={confirmDelete}
                className="bg-red-500 text-white hover:bg-red-600"
              >
                {loading && <LoaderCircle className="animate-spin" />}
                {!loading && <p>Delete Job</p>}
                {loading && <p>Deleting Job</p>}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setJobToDelete(null)}
                className="border-[#8b6f5d] text-[#8b6f5d] hover:bg-[#8b6f5d] hover:text-white"
              >
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}

export default function EmployerPage() {
  const [activeTab, setActiveTab] = useState<"showJobs" | "showCreateJobs">(
    "showJobs",
  );

  return (
    <>
      <div className="bg-primary-300 pt-1"></div>
      <div className="mx-auto max-w-7xl">
        <header className="flex items-center justify-between pt-8">
          <Image src={logo} alt="Tukma Logo" className="h-12 w-auto" />
          <div>
            <LogOutButton />
          </div>
        </header>

        <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
          <div className="mb-8 flex items-center justify-between">
            <div className="text-muted-foreground grid h-10 w-full grid-cols-2 items-center justify-center rounded-md bg-background-800 p-1">
              <ButtonSmall
                isActive={activeTab === "showJobs"}
                onClick={() => setActiveTab("showJobs")}
              >
                Active Jobs
              </ButtonSmall>
              <ButtonSmall
                isActive={activeTab === "showCreateJobs"}
                onClick={() => setActiveTab("showCreateJobs")}
              >
                Create Job
              </ButtonSmall>
            </div>
          </div>

          {activeTab === "showCreateJobs" && <CreateJobs />}
          {activeTab === "showJobs" && <ShowJobs />}
        </main>
      </div>
    </>
  );
}
