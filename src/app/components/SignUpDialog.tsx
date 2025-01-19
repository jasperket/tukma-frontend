"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { signup } from "../actions/auth";

const signUpSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(12, "Password must be at least 12 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number",
    ),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  isInterviewer: z.boolean().default(false),
});

export type SignUpFormValues = z.infer<typeof signUpSchema>;

export function SignUpDialog() {
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      isInterviewer: false,
    },
  });

  const onSubmit = async (data: SignUpFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signup(data);
      if (result?.success) {
        router.push("/dashboard");
      } else {
        setError(result?.error ?? "An error occurred during signup");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="link" className="text-text-200 hover:text-text-100">
          Sign up
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-background-900">
        <DialogHeader>
          <DialogTitle className="text-text-100 font-serif text-2xl">
            Create an account
          </DialogTitle>
          <DialogDescription className="text-text-300">
            Enter your information below to create your account.
          </DialogDescription>
        </DialogHeader>
        {error && (
          <div className="text-primary-300 text-sm font-medium">{error}</div>
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-text-200">First name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="John"
                        {...field}
                        disabled={isLoading}
                        className="bg-background-950 border-background-800 text-text-100 placeholder:text-text-400"
                      />
                    </FormControl>
                    <FormMessage className="text-primary-300" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-text-200">Last name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Doe"
                        {...field}
                        disabled={isLoading}
                        className="bg-background-950 border-background-800 text-text-100 placeholder:text-text-400"
                      />
                    </FormControl>
                    <FormMessage className="text-primary-300" />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-text-200">Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="johndoe@example.com"
                      {...field}
                      disabled={isLoading}
                      className="bg-background-950 border-background-800 text-text-100 placeholder:text-text-400"
                    />
                  </FormControl>
                  <FormMessage className="text-primary-300" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-text-200">Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      {...field}
                      disabled={isLoading}
                      className="bg-background-950 border-background-800 text-text-100 placeholder:text-text-400"
                    />
                  </FormControl>
                  <FormDescription className="text-text-400">
                    Password must contain at least: <br />
                    - 12 characters <br />
                    - one uppercase letter <br />
                    - one lowercase letter <br />- one number
                  </FormDescription>
                  <FormMessage className="text-primary-300" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isInterviewer"
              render={({ field }) => (
                <FormItem className="border-background-800 flex flex-row items-center justify-between space-y-0 rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-text-200">
                      Are you an interviewer?
                    </FormLabel>
                  </div>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="border-primary-300 data-[state=checked]:bg-primary-300 data-[state=checked]:text-background-950 h-5 w-5 border-2"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-primary-300 hover:bg-primary-400 relative w-full"
            >
              {isLoading ? (
                <div className="absolute flex items-center justify-center">
                  <span className="loader"></span>
                </div>
              ) : (
                "Sign up"
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
