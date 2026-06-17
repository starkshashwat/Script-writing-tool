"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Lock, Mail, AlertCircle, ArrowRight, User } from "lucide-react";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // States
  const [isSignUp, setIsSignUp] = React.useState(searchParams.get("mode") === "signup");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [fullName, setFullName] = React.useState("");
  const [error, setError] = React.useState<string | null>(searchParams.get("error"));
  const [info, setInfo] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const supabase = createClient();

  React.useEffect(() => {
    // Listen to changes in search params mode
    setIsSignUp(searchParams.get("mode") === "signup");
  }, [searchParams]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setIsLoading(true);

    if (!email || !password) {
      setError("Please fill in all fields.");
      setIsLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        // Sign Up flow
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName || null,
            },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (signUpError) {
          if (signUpError.message === "Failed to fetch") {
            setError("Connection error: Failed to reach the authentication server. Please check your internet connection or verify your Supabase configuration in .env.local.");
          } else {
            setError(signUpError.message);
          }
        } else if (data.user && data.session === null) {
          // Verification email sent
          setInfo("Registration successful! Please check your email to verify your account.");
          setEmail("");
          setPassword("");
          setFullName("");
        } else {
          // Session established immediately
          router.push("/dashboard");
          router.refresh();
        }
      } else {
        // Sign In flow
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          if (signInError.message === "Failed to fetch") {
            setError("Connection error: Failed to reach the authentication server. Please check your internet connection or verify your Supabase configuration in .env.local.");
          } else {
            setError(signInError.message);
          }
        } else {
          router.push("/dashboard");
          router.refresh();
        }
      }
    } catch (err: any) {
      console.error("Auth connection error:", err);
      setError("Connection error: Failed to reach the authentication server. Please check your internet connection or verify your Supabase configuration in .env.local.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setInfo(null);
    setIsLoading(true);

    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (oauthError) {
        if (oauthError.message === "Failed to fetch") {
          setError("Connection error: Failed to reach the authentication server. Please check your internet connection or verify your Supabase configuration in .env.local.");
        } else {
          setError(oauthError.message);
        }
        setIsLoading(false);
      }
    } catch (err: any) {
      console.error("OAuth connection error:", err);
      setError("Connection error: Failed to reach the authentication server. Please check your internet connection or verify your Supabase configuration in .env.local.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fff8f6] text-[#2b1613] antialiased overflow-x-hidden selection:bg-[#bc0100] selection:text-white p-4 relative">
      {/* Visual background decorations from landing page */}
      <div className="grid-pattern" />
      <div className="noise-bg" />

      {/* Top light glow */}
      <div className="absolute top-0 left-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 bg-[radial-gradient(circle_300px_at_center,#ffe9e6,transparent)] opacity-60" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="text-3xl font-extrabold tracking-tighter text-[#bc0100] font-display hover:opacity-90 transition-opacity">
            TubeBoost
          </Link>
          <p className="text-[#603e39] text-xs font-semibold uppercase tracking-wider mt-1">Intelligence Engine</p>
        </div>

        <Card className="border-[#ebbbb4]/40 bg-white/90 backdrop-blur-md text-[#2b1613] shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#bc0100]/50 to-transparent" />
          
          <CardHeader className="space-y-1.5 text-center pt-8 pb-6">
            <CardTitle className="text-2xl font-extrabold tracking-tight text-[#2b1613] font-display">
              {isSignUp ? "Create an account" : "Welcome back"}
            </CardTitle>
            <CardDescription className="text-[#603e39] text-sm font-medium">
              {isSignUp
                ? "Enter your details to create a new workspace account"
                : "Enter your credentials to access your dashboard"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 px-6 md:px-8">
            {/* Notifications */}
            {error && (
              <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3.5 text-sm text-red-800 shadow-sm animate-in fade-in duration-200">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
                <p className="leading-tight font-medium">{error}</p>
              </div>
            )}

            {info && (
              <div className="flex items-start gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 p-3.5 text-sm text-emerald-800 shadow-sm animate-in fade-in duration-200">
                <AlertCircle className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                <p className="leading-tight font-medium">{info}</p>
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-3.5">
              {isSignUp && (
                <div className="space-y-1.5">
                  <label htmlFor="name" className="text-xs font-bold text-[#603e39] uppercase tracking-wider">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-2.5 h-4 w-4 text-[#956d67]" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Jane Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="pl-10 border-[#ebbbb4]/40 bg-[#fff8f6]/50 text-[#2b1613] placeholder:text-[#603e39]/30 focus-visible:ring-[#bc0100] focus-visible:border-[#ebbbb4]"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label htmlFor="email" className="text-xs font-bold text-[#603e39] uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-2.5 h-4 w-4 text-[#956d67]" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 border-[#ebbbb4]/40 bg-[#fff8f6]/50 text-[#2b1613] placeholder:text-[#603e39]/30 focus-visible:ring-[#bc0100] focus-visible:border-[#ebbbb4]"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="password" className="text-xs font-bold text-[#603e39] uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-2.5 h-4 w-4 text-[#956d67]" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 border-[#ebbbb4]/40 bg-[#fff8f6]/50 text-[#2b1613] placeholder:text-[#603e39]/30 focus-visible:ring-[#bc0100] focus-visible:border-[#ebbbb4]"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-[#FF0000] to-[#FF6B00] text-white hover:opacity-95 mt-6 shadow-md h-10 font-bold tracking-wide transition-opacity cursor-pointer flex items-center justify-center gap-1.5"
                isLoading={isLoading}
              >
                {isSignUp ? "Sign Up" : "Sign In"} <ArrowRight className="h-4 w-4" />
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#ebbbb4]/30" />
              </div>
              <div className="relative flex justify-center text-xs uppercase font-bold tracking-wider">
                <span className="bg-white px-2.5 text-[#956d67]">Or continue with</span>
              </div>
            </div>

            <Button
              variant="outline"
              type="button"
              className="w-full border-[#ebbbb4]/40 bg-[#fff8f6]/50 text-[#603e39] hover:bg-[#ffe9e6] hover:text-[#bc0100] h-10 font-bold transition-colors cursor-pointer flex items-center justify-center gap-2"
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              <svg className="h-4 w-4 text-[#bc0100]" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
              </svg>
              Google Account
            </Button>
          </CardContent>

          <CardFooter className="justify-center border-t border-[#ebbbb4]/20 bg-[#fff8f6]/30 py-4 pt-4 mt-6">
            <p className="text-sm text-[#603e39] font-medium">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                type="button"
                className="text-[#bc0100] hover:underline font-bold cursor-pointer ml-1"
                onClick={() => {
                  setError(null);
                  setInfo(null);
                  setIsSignUp(!isSignUp);
                }}
              >
                {isSignUp ? "Sign In" : "Sign Up"}
              </button>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#fff8f6] text-[#603e39] font-semibold text-sm">
          Loading authentication...
        </div>
      }
    >
      <LoginForm />
    </React.Suspense>
  );
}
