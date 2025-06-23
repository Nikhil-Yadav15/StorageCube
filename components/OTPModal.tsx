"use client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { CloseDark, Loader } from "@/public/assets";
import Image from "next/image";
import { MouseEvent, useState } from "react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { createHttpClient } from "@/tools/httpClient";
import { localStorageService } from "@/services/LocalStorage.service";
import { apiUrls } from "@/tools/apiUrls";
import { utils } from "@/lib/utils/server-utils";
import { useToast } from "@/hooks/use-toast";
interface Props {
  email: string;
  accountId: string | null;
}

const OTPModal = ({ email }: Props) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { toast } = useToast();

  const onOTPSubmit = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const httpClient = createHttpClient();
    try {
      const session = await httpClient.post(apiUrls.verifyEmail, {
        email,
        code: password,
      });

      if (!session || session.status !== 200) {
        setIsLoading(false);
        return toast({
          description: (
            <p className="body-2 text-white">
              {session?.message || "Something went wrong while verifying OTP"}
            </p>
          ),
          className: "error-toast",
        });
      }

      if (session) {
        localStorageService.setAccessToken(session.data.accessToken);
        localStorageService.setRefreshToken(session.data.refreshToken);
        router.push("/"); // trigger navigation after modal closes
      }


    } catch (error) {
      console.log("Failed to verify OTP", error);
    } finally {
      setIsLoading(false);
    }
  };

  const onResendOTP = async () => {
    const httpClient = createHttpClient();

    try {
      const user = await httpClient.post(apiUrls.resend, {
        email,
      });

      if (user.status !== 200) {
        return toast({
          description: (
            <p className="body-2 text-white">
              {user?.message || `Something went wrong while sending OTP`}
            </p>
          ),
          className: "error-toast",
        });
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent className="shad-alert-dialog">
        <AlertDialogHeader className="relative flex justify-center">
          <AlertDialogTitle className="h2 text-center">
            Enter Your OTP
            <Image
              src={CloseDark}
              alt="close"
              width={20}
              height={20}
              onClick={() => setIsOpen(false)}
              className="otp-close-button"
            />
          </AlertDialogTitle>
          <AlertDialogDescription className="subtitle-2 text-center text-light-100">
            We've sent a code to{" "}
            <span className="pl-1 text-brand">{email || "test@gmail.com"}</span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <InputOTP maxLength={6} value={password} onChange={setPassword}>
          <InputOTPGroup className="shad-otp">
            <InputOTPSlot index={0} className="shad-otp-slot" />
            <InputOTPSlot index={1} className="shad-otp-slot" />
            <InputOTPSlot index={2} className="shad-otp-slot" />
            <InputOTPSlot index={3} className="shad-otp-slot" />
            <InputOTPSlot index={4} className="shad-otp-slot" />
            <InputOTPSlot index={5} className="shad-otp-slot" />
          </InputOTPGroup>
        </InputOTP>
        <AlertDialogFooter>
          <div className="flex w-full flex-col gap-4">
            <AlertDialogAction
              onClick={onOTPSubmit}
              className="shad-submit-btn h-12"
              type="button"
            >
              Submit
              {isLoading && (
                <Image
                  src={Loader}
                  alt="loader"
                  width={24}
                  height={24}
                  className="ml-2 animate-spin"
                />
              )}
            </AlertDialogAction>
            <div className="subtitle-2 mt-2 text-center text-light-100">
              Didn't receive the code?
              <Button
                type="button"
                onClick={onResendOTP}
                variant="link"
                className="pl-1 text-brand"
              >
                Click to resend
              </Button>
            </div>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default OTPModal;
