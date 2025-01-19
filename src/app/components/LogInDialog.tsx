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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { login } from "../actions/auth";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export function LogInDialog() {
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await login(data);
      if (result.success) {
        router.push("/dashboard");
      } else {
        setError(result.error ?? "An error occurred during login");
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
        <Button className="bg-primary-300 hover:bg-primary-400">Log in</Button>
      </DialogTrigger>
      <DialogContent className="bg-background-900">
        <DialogHeader>
          <DialogTitle className="text-text-100 font-serif text-2xl">
            Welcome back
          </DialogTitle>
          <DialogDescription className="text-text-300">
            Enter your credentials to access your account.
          </DialogDescription>
        </DialogHeader>
        {error && (
          <div className="text-primary-300 text-sm font-medium">{error}</div>
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                  <FormMessage className="text-primary-300" />
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
                "Log in"
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
