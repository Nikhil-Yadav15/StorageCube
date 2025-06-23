"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import Image from "next/image";
import { Loader } from "@/public/assets";
import Link from "next/link";
import OTPModal from "./OTPModal";
import { createHttpClient } from "@/tools/httpClient";
import { apiUrls } from "@/tools/apiUrls";
import { useToast } from "@/hooks/use-toast";

interface Props {
  type: "sign-in" | "sign-up";
}

const authFormSchema = (formType: "sign-in" | "sign-up") => {
  return z.object({
    email: z.string().email(),
    fullName:
      formType === "sign-up"
        ? z.string().min(2).max(50)
        : z.string().optional(),
  });
};

const AuthForm = ({ type }: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [accountId, setAccountId] = useState(null);

  const { toast } = useToast();

  const formSchema = authFormSchema(type);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setErrorMessage("");
    const httpClient = createHttpClient();

    try {
      const user =
        type === "sign-up"
          ? await httpClient.post(apiUrls.signup, values)
          : await httpClient.post(apiUrls.signin, {
              email: values.email,
            });

      if (user.status !== 200) {
        setIsLoading(false);
        return toast({
          description: (
            <p className="body-2 text-white">
              {user?.message || `Something went wrong while ${type}`}
            </p>
          ),
          className: "error-toast",
        });
      }

      if (user && user.status === 200) {
        setAccountId(user.data.emailVerificationToken);
      }
    } catch (error) {
      console.log("error", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="auth-form">
          <h1 className="form-title ">
            {type === "sign-in" ? "Sign In" : "Sign Up"}
          </h1>
          {type === "sign-up" && (
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <div className="shad-form-item">
                    <FormLabel className="shad-form-label ">Full Name</FormLabel>

                    <FormControl>
                      <Input
                        placeholder="Enter your full name"
                        className="shad-input"
                        {...field}
                      />
                    </FormControl>
                  </div>
                  <FormMessage className="shad-form-message" />
                </FormItem>
              )}
            />
          )}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <div className="shad-form-item">
                  <FormLabel className="shad-form-label">Email</FormLabel>

                  <FormControl>
                    <Input
                      placeholder="Enter your email"
                      className="shad-input"
                      {...field}
                    />
                  </FormControl>
                </div>
                <FormMessage className="shad-form-message" />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="form-submit-button"
            disabled={isLoading}
          >
            {type === "sign-in" ? "Sign In" : "Sign Up"}
            {isLoading && (
              <Image
                src={Loader}
                alt="loader"
                width={24}
                height={24}
                className="ml-2 animate-spin"
              />
            )}
          </Button>
          {errorMessage && <p className="error-message">*{errorMessage}</p>}
          <div className="body-2 flex justify-center">
            <div className="text-light-100">
              {type === "sign-in"
                ? "Don't have an account? "
                : "Already have an account? "}
              <Link
                href={type === "sign-in" ? "/sign-up" : "/sign-in"}
                className="ml-1 font-medium text-purple"
              >
                {type === "sign-in" ? "Sign Up" : "Sign In"}
              </Link>
            </div>
          </div>
        </form>
      </Form>

      {accountId && (
        <OTPModal email={form.getValues("email")} accountId={accountId} />
      )}
    </>
  );
};

export default AuthForm;
