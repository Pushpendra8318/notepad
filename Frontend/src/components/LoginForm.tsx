import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import axios, { AxiosResponse } from "axios";
import toast from "react-hot-toast";

// ✅ Define API response type
interface ApiResponse {
  success: boolean;
  message?: string;
  authToken?: string;
}

// ✅ Setup axios instance with baseURL
const api = axios.create({
  baseURL: "http://localhost:5000/api", // backend URL
});

// Zod validation schemas
const emailSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
});

const otpSchema = z.object({
  otp: z
    .string()
    .length(6, { message: "OTP must be 6 digits" })
    .regex(/^\d+$/, { message: "OTP must contain only digits" }),
});

export default function LoginForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"email" | "otp">("email");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");

  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  const otpForm = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
  });

  // STEP 1 - Send OTP
  const handleEmailSubmit = async (values: z.infer<typeof emailSchema>) => {
    try {
      setLoading(true);
      const res: AxiosResponse<ApiResponse> = await api.post("/auth/send-otp", {
        email: values.email,
      });

      if (res.data.success) {
        toast.success("OTP sent to your email");
        setEmail(values.email);
        setStep("otp");
      } else {
        toast.error(res.data.message || "Failed to send OTP");
      }
    } catch (err) {
      toast.error("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // STEP 2 - Verify OTP & login
  const handleOtpSubmit = async (values: z.infer<typeof otpSchema>) => {
    try {
      setLoading(true);
      const res: AxiosResponse<ApiResponse> = await api.post("/auth/login", {
        email,
        otp: values.otp,
      });

      if (res.data.success && res.data.authToken) {
        localStorage.setItem("token", res.data.authToken);
        toast.success("Login successful");
        navigate("/");
      } else {
        toast.error(res.data.message || "Invalid OTP");
      }
    } catch (err) {
      toast.error("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white shadow-xl rounded-2xl">
      {step === "email" ? (
        <Form key="email-form" {...emailForm}>
          <form
            onSubmit={emailForm.handleSubmit(handleEmailSubmit)}
            className="space-y-6"
          >
            <FormField
              control={emailForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      disabled={loading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Sending..." : "Send OTP"}
            </Button>
          </form>
        </Form>
      ) : (
        <Form key="otp-form" {...otpForm}>
          <form
            onSubmit={otpForm.handleSubmit(handleOtpSubmit)}
            className="space-y-6"
          >
            <FormField
              control={otpForm.control}
              name="otp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>OTP</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      inputMode="numeric"
                      pattern="\d{6}"
                      maxLength={6}
                      placeholder="Enter 6-digit OTP"
                      disabled={loading}
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Verifying..." : "Verify OTP"}
            </Button>
          </form>
        </Form>
      )}
    </div>
  );
}
