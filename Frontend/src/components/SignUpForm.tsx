// src/components/SignUpForm.tsx
import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import axiosInstance from "@/utils/axiosInstance";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Heading from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { UserContext } from "@/providers/user-provider";

// --------------------
// Schema & Types
// --------------------
const formSchema = z.object({
  fullName: z.string().min(3, "Full Name must contain at least 3 characters."),
  dob: z.string().nonempty("Date of birth is required"),
  email: z.string().email("Enter a valid Email Address"),
  otp: z.string().length(6, "OTP must be 6 digits"),
});

type SignUpFormValues = z.infer<typeof formSchema>;

interface OTPResponse {
  success: boolean;
  message: string;
}

// interface SignupResponse {
//   success: boolean;
//   message: string;
//   authToken: string;
// }

// --------------------
// Component
// --------------------
const SignUpForm: React.FC = () => {
  const { signUp } = useContext(UserContext);
  // const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      dob: "",
      email: "",
      otp: "",
    },
  });

  // --------------------
  // Send OTP
  // --------------------
  const sendOtp = async (email: string) => {
    if (!email) {
      toast.error("Enter your email first!");
      return;
    }
    try {
      const res = await axiosInstance.post<OTPResponse>("/api/auth/send-otp", { email });
      if (res.data.success) {
        toast.success(res.data.message);
        setOtpSent(true);
      } else {
        toast.error(res.data.message);
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      toast.error(err.response?.data?.message || err.message || "Failed to send OTP");
    }
  };

  // --------------------
  // Signup / Verify OTP
  // --------------------
  const onSubmit = async (data: SignUpFormValues) => {
    setLoading(true);
    try {
      await signUp(data);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      toast.error(err.response?.data?.message || err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  // --------------------
  // Render
  // --------------------
  return (
    <div className="container max-w-4xl py-4 mx-auto md:py-10">
      <Heading title="Sign Up" description="Sign Up to DevNotes" />
      <Separator className="mt-4 mb-8" />

      <div className="max-w-lg mx-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            {/* Full Name */}
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input type="text" disabled={loading} placeholder="Enter your full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* DOB */}
            <FormField
              control={form.control}
              name="dob"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Birth</FormLabel>
                  <FormControl>
                    <Input type="date" disabled={loading} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email + Get OTP */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input type="email" disabled={loading} placeholder="Enter your email" {...field} />
                    </FormControl>
                    <Button type="button" disabled={loading || otpSent} onClick={() => sendOtp(field.value)}>
                      {otpSent ? "OTP Sent" : "Get OTP"}
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* OTP */}
            {otpSent && (
              <FormField
                control={form.control}
                name="otp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>OTP</FormLabel>
                    <FormControl>
                      <Input type="text" disabled={loading} placeholder="Enter 6-digit OTP" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Submit + Reset */}
            <div className="flex flex-col items-start my-3 md:flex-row md:items-center md:justify-between gap-y-3 md:gap-y-0">
              <div className="flex gap-2 mr-auto">
                <Button disabled={loading} type="submit">
                  {loading ? "Signing Up..." : "Sign Up"}
                </Button>
                <Button disabled={loading} type="reset" onClick={() => form.reset()}>
                  Reset
                </Button>
              </div>
              <div className="sm:pr-3">
                <p className="flex items-center text-base sm:text-lg text-accent-foreground/50">
                  <span>Already have an account?</span>
                  <Link
                    to={loading ? "/signup" : "/login"}
                    className={`pb-[2px] ml-2 text-sm sm:text-base border-b border-b-current ${
                      loading ? "text-input" : "text-accent-foreground/90 hover:text-accent-foreground"
                    }`}
                  >
                    Log in now!
                  </Link>
                </p>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default SignUpForm;
