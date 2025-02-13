"use client";

import React, { useState } from "react";
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
import { Form, FormProvider, useForm } from "react-hook-form";
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

const createJobSchema = z.object({
  jobTitle: z.string().min(1, "Job title required"),
  jobDescription: z.string().min(1, "Job description required"),
});

export type CreateJobFormValues = z.infer<typeof createJobSchema>;

function CreateJobs() {
  const [isLoading, setIsLoading] = useState(false);
  const createJobForm = useForm<CreateJobFormValues>({
    resolver: zodResolver(createJobSchema),
    defaultValues: {
      jobTitle: "",
      jobDescription: "",
    },
  });

  const onSubmit = (data: CreateJobFormValues) => {
    console.log(data);
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
        <CardFooter>
          <p>Card Footer</p>
        </CardFooter>
      </Card>
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

        <main className="space-y-6 px-4 py-8">
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
        </main>
      </div>
    </>
  );
}
