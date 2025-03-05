"use client";

import React, { useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { checkUser, login, signup } from "../actions/auth";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const signUpSchema = z
  .object({
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
    applicant: z.boolean().default(true),
    companyName: z.string().optional(),
  })
  .refine(
    (data) =>
      data.applicant || (data.companyName && data.companyName.length > 0),
    {
      message: "Company name is required for recruiters",
      path: ["companyName"],
    },
  );

export type LoginFormValues = z.infer<typeof loginSchema>;
export type SignUpFormValues = z.infer<typeof signUpSchema>;

interface AuthDialogProps {
  defaultTab?: "login" | "signup";
  children: React.ReactNode;
}

export default function AuthDialog({
  defaultTab = "login",
  children,
}: AuthDialogProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const signUpForm = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      applicant: true,
      companyName: "",
    },
  });

  const onLoginSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await login(data);
      if (result.success) {
        setOpen(false);
        router.push("/");
      } else {
        setError(result.error ?? "An error occurred during login");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const onSignUpSubmit = async (data: SignUpFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signup(data);
      if (result?.success) {
        setOpen(false);
        if (data.applicant) {
          router.push("/");
        } else {
          router.push("/");
        }
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="bg-background-900 sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl text-text-100">
            Welcome to Tukma
          </DialogTitle>
          <DialogDescription className="text-text-300">
            Sign in to your account or create a new one.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="text-sm font-medium text-primary-300">{error}</div>
        )}

        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-background-800">
            <TabsTrigger
              value="login"
              className="text-text-200 data-[state=active]:bg-primary-300 data-[state=active]:text-background-950"
            >
              Login
            </TabsTrigger>
            <TabsTrigger
              value="signup"
              className="text-text-200 data-[state=active]:bg-primary-300 data-[state=active]:text-background-950"
            >
              Sign Up
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Form {...loginForm}>
              <form
                onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={loginForm.control}
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
                          className="border-background-800 bg-background-950 text-text-100 placeholder:text-text-400"
                        />
                      </FormControl>
                      <FormMessage className="text-primary-300" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-text-200">Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
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
                    "Log in"
                  )}
                </Button>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="signup">
            <Form {...signUpForm}>
              <form
                onSubmit={signUpForm.handleSubmit(onSignUpSubmit)}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={signUpForm.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-text-200">
                          First name
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="John"
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
                    control={signUpForm.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-text-200">
                          Last name
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Doe"
                            {...field}
                            disabled={isLoading}
                            className="border-background-800 bg-background-950 text-text-100 placeholder:text-text-400"
                          />
                        </FormControl>
                        <FormMessage className="text-primary-300" />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={signUpForm.control}
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
                          className="border-background-800 bg-background-950 text-text-100 placeholder:text-text-400"
                        />
                      </FormControl>
                      <FormMessage className="text-primary-300" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={signUpForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-text-200">Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          {...field}
                          disabled={isLoading}
                          className="border-background-800 bg-background-950 text-text-100 placeholder:text-text-400"
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
                  control={signUpForm.control}
                  name="applicant"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-lg border border-background-800 p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-text-200">
                          I am an applicant
                        </FormLabel>
                      </div>
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="h-5 w-5 border-2 border-primary-300 data-[state=checked]:bg-primary-300 data-[state=checked]:text-background-950"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Company Name field - shown only when applicant is false */}
                {!signUpForm.watch("applicant") && (
                  <FormField
                    control={signUpForm.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-text-200">
                          Company Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Acme Inc."
                            {...field}
                            disabled={isLoading}
                            className="border-background-800 bg-background-950 text-text-100 placeholder:text-text-400"
                          />
                        </FormControl>
                        <FormDescription className="text-text-400">
                          Required for recruiter accounts
                        </FormDescription>
                        <FormMessage className="text-primary-300" />
                      </FormItem>
                    )}
                  />
                )}
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
                    "Sign up"
                  )}
                </Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
