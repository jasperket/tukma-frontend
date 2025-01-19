"use client";

import * as React from "react";
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

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LogInDialog() {
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(data: LoginFormValues) {
    console.log(data);
    // Handle form submission
  }

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
                      className="bg-background-950 border-background-800 text-text-100 placeholder:text-text-400"
                    />
                  </FormControl>
                  <FormMessage className="text-primary-300" />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="bg-primary-300 hover:bg-primary-400 w-full"
            >
              Log in
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
