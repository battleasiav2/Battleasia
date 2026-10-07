import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Eye,
  EyeOff,
  Check,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  User,
  Gamepad2,
  Mail,
  Lock,
  ArrowLeft,
  Trophy,
  Swords,
  Wallet,
} from "lucide-react";
import arenaBg from "@/assets/arena-bg.jpg";

const COUNTRY_CODES = [
  { code: "+880", flag: "🇧🇩", name: "Bangladesh" },
  { code: "+91", flag: "🇮🇳", name: "India" },
  { code: "+92", flag: "🇵🇰", name: "Pakistan" },
  { code: "+94", flag: "🇱🇰", name: "Sri Lanka" },
  { code: "+977", flag: "🇳🇵", name: "Nepal" },
  { code: "+60", flag: "🇲🇾", name: "Malaysia" },
  { code: "+62", flag: "🇮🇩", name: "Indonesia" },
  { code: "+63", flag: "🇵🇭", name: "Philippines" },
  { code: "+971", flag: "🇦🇪", name: "UAE" },
  { code: "+966", flag: "🇸🇦", name: "Saudi Arabia" },
  { code: "+44", flag: "🇬🇧", name: "United Kingdom" },
  { code: "+1", flag: "🇺🇸", name: "United States" },
];

const SERVERS = ["Europe", "Asia", "South America", "Middle East", "KRJP", "North America"];

const signupSchema = z
  .object({
    email: z.string().trim().min(1, "Email is required").email("Enter a valid email address").max(255),
    password: z.string().min(6, "Password must be at least 6 characters").max(72),
    confirmPassword: z.string().min(1, "Confirm your password"),
    username: z
      .string()
      .trim()
      .min(3, "In-game name must be at least 3 characters")
      .max(30, "In-game name must be under 30 characters"),
    pubgId: z
      .string()
      .trim()
      .min(8, "PUBG ID must be at least 8 digits")
      .max(15, "PUBG ID must be under 15 digits")
      .regex(/^\d+$/, "PUBG ID must contain digits only"),
    countryCode: z.string().min(1, "Select a country code"),
    mobile: z
      .string()
      .trim()
      .min(6, "Enter a valid mobile number")
      .max(15, "Enter a valid mobile number")
      .regex(/^\d+$/, "Mobile number must contain digits only"),
    server: z.string().min(1, "Select your game server"),
    terms: z.boolean().refine((val) => val === true, {
      message: "You must accept the Terms of Service",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignupForm = z.infer<typeof signupSchema>;

const STEPS = [
  { id: 1, title: "Account Info", hint: "Your login details" },
  { id: 2, title: "In-Game Details", hint: "Match & payout info" },
] as const;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sign Up — PUBG Mobile Tournaments" },
      {
        name: "description",
        content:
          "Create your free account in two quick steps and join PUBG Mobile tournaments with real cash prizes, fair play and secure payouts.",
      },
      { property: "og:title", content: "Sign Up — PUBG Mobile Tournaments" },
      {
        property: "og:description",
        content:
          "Create your free account in two quick steps and join PUBG Mobile tournaments with real cash prizes, fair play and secure payouts.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const inputBase =
  "w-full rounded-lg border border-input bg-background/50 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 transition-colors hover:border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/40";

const labelBase = "block text-[13px] font-medium text-muted-foreground";

function FieldError({ message }: { message?: string | undefined }) {
  if (!message) return null;
  return <p className="text-xs text-destructive">{message}</p>;
}

function Index() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [step, setStep] = useState(1);

  const {
    register,
    handleSubmit,
    reset,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: { terms: false, countryCode: "+880", server: "" },
  });

  const goNext = async () => {
    const valid = await trigger(["email", "password", "confirmPassword"]);
    if (valid) setStep(2);
  };

  const onSubmit = async (data: SignupForm) => {
    await new Promise((resolve) => setTimeout(resolve, 1200));
    console.log("Signup data:", { ...data, password: "***", confirmPassword: "***" });
    setSubmitted(true);
  };

  const progress = submitted ? 100 : step === 1 ? 50 : 100;

  return (
    <main className="signup-bg relative min-h-screen">
      {/* Gaming background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <img
          src={arenaBg}
          alt=""
          aria-hidden="true"
          width={1920}
          height={1280}
          className="h-full w-full object-cover opacity-40 lg:opacity-55"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/70 to-background" />
        <div className="absolute left-1/4 top-0 h-72 w-72 rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-primary/5 blur-[140px]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl items-center gap-12 px-4 py-10 lg:px-8">
        {/* Desktop brand panel */}
        <aside className="hidden flex-1 lg:block">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-primary">
            PUBG Mobile Tournaments
          </p>
          <h2 className="mt-4 text-4xl font-bold leading-tight tracking-tight text-foreground xl:text-5xl">
            Drop in. Outplay.
            <br />
            Get paid.
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
            Daily solo, duo and squad matches with verified rooms, instant results and secure cash
            payouts. Registration takes under a minute.
          </p>
          <dl className="mt-10 grid max-w-md grid-cols-3 gap-4">
            {[
              { k: "12K+", v: "Active players" },
              { k: "৳2.5M", v: "Prizes paid" },
              { k: "24/7", v: "Match rooms" },
            ].map((s) => (
              <div key={s.k} className="rounded-xl border border-border/50 bg-card/40 px-4 py-3 backdrop-blur">
                <dt className="text-lg font-bold text-foreground">{s.k}</dt>
                <dd className="text-xs text-muted-foreground">{s.v}</dd>
              </div>
            ))}
          </dl>
        </aside>

        {/* Form column */}
        <div className="w-full lg:max-w-md lg:shrink-0">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-4">
              <a
                href="/"
                className="inline-flex items-center gap-2 rounded-lg border border-primary/40 px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
              >
                <ArrowLeft className="h-4 w-4" />
                Back Home
              </a>
            </div>

            <div className="overflow-hidden rounded-2xl border border-border/50 bg-card/90 shadow-2xl shadow-black/40 backdrop-blur-xl">
              <div className="h-1 w-full bg-border/60">
                <div
                  className="h-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="px-6 pb-8 pt-7 sm:px-8 sm:pb-9">
                <div className="mb-6 flex flex-col items-center text-center">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary shadow-[0_0_20px_-5px] shadow-primary/40">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <h1 className="text-xl font-bold tracking-tight text-card-foreground sm:text-2xl">
                    Create your account
                  </h1>
                  <p className="mt-1.5 text-[13px] text-muted-foreground">
                    Two quick steps and you're in the lobby
                  </p>
                </div>

                {!submitted && (
                  <ol className="mb-7 flex items-center gap-3">
                    {STEPS.map((s, i) => {
                      const active = step === s.id;
                      const done = step > s.id;
                      return (
                        <li key={s.id} className="flex flex-1 items-center gap-2.5">
                          <span
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors ${
                              done
                                ? "border-primary bg-primary text-primary-foreground"
                                : active
                                  ? "border-primary text-primary"
                                  : "border-border text-muted-foreground"
                            }`}
                          >
                            {done ? <Check className="h-3.5 w-3.5" /> : s.id}
                          </span>
                          <span className="min-w-0">
                            <span
                              className={`block truncate text-[13px] font-medium ${
                                active || done ? "text-card-foreground" : "text-muted-foreground"
                              }`}
                            >
                              {s.title}
                            </span>
                            <span className="block truncate text-[11px] text-muted-foreground/70">
                              {s.hint}
                            </span>
                          </span>
                          {i === 0 && <span className="ml-auto h-px flex-1 bg-border" />}
                        </li>
                      );
                    })}
                  </ol>
                )}

                {submitted ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/15 text-primary">
                      <Check className="h-8 w-8" />
                    </div>
                    <h2 className="text-lg font-semibold text-card-foreground">Account created</h2>
                    <p className="mt-2 text-[13px] text-muted-foreground">
                      Welcome to the arena. Check your inbox to verify your email.
                    </p>
                    <button
                      onClick={() => {
                        reset();
                        setStep(1);
                        setSubmitted(false);
                      }}
                      className="mt-6 text-sm font-medium text-primary transition-colors hover:text-primary/80"
                    >
                      Back to signup
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                    {step === 1 ? (
                      <>
                        <div className="space-y-1.5">
                          <label htmlFor="email" className={labelBase}>
                            Email Address
                          </label>
                          <div className="relative">
                            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <input
                              id="email"
                              type="email"
                              autoComplete="email"
                              placeholder="Example@domain.com"
                              {...register("email")}
                              className={`${inputBase} pl-9`}
                            />
                          </div>
                          <FieldError message={errors.email?.message} />
                        </div>

                        <div className="space-y-1.5">
                          <label htmlFor="password" className={labelBase}>
                            Password
                          </label>
                          <div className="relative">
                            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <input
                              id="password"
                              type={showPassword ? "text" : "password"}
                              autoComplete="new-password"
                              placeholder="6+ characters"
                              {...register("password")}
                              className={`${inputBase} pl-9 pr-10`}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword((v) => !v)}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                              aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                          <FieldError message={errors.password?.message} />
                        </div>

                        <div className="space-y-1.5">
                          <label htmlFor="confirmPassword" className={labelBase}>
                            Confirm Password
                          </label>
                          <div className="relative">
                            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <input
                              id="confirmPassword"
                              type={showConfirm ? "text" : "password"}
                              autoComplete="new-password"
                              placeholder="Confirm your password"
                              {...register("confirmPassword")}
                              className={`${inputBase} pl-9 pr-10`}
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirm((v) => !v)}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                              aria-label={showConfirm ? "Hide password" : "Show password"}
                            >
                              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                          <FieldError message={errors.confirmPassword?.message} />
                        </div>

                        <button
                          type="button"
                          onClick={goNext}
                          className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-primary/40 active:scale-[0.99]"
                        >
                          Continue
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="space-y-1.5">
                          <label htmlFor="username" className={labelBase}>
                            In-Game User Name
                          </label>
                          <div className="relative">
                            <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <input
                              id="username"
                              type="text"
                              maxLength={30}
                              placeholder="Enter your in-game name"
                              {...register("username")}
                              className={`${inputBase} pl-9`}
                            />
                          </div>
                          <FieldError message={errors.username?.message} />
                        </div>

                        <div className="space-y-1.5">
                          <label htmlFor="pubgId" className={labelBase}>
                            PUBG ID
                          </label>
                          <div className="relative">
                            <Gamepad2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <input
                              id="pubgId"
                              type="text"
                              inputMode="numeric"
                              maxLength={15}
                              placeholder="Enter your PUBG ID"
                              {...register("pubgId")}
                              className={`${inputBase} pl-9`}
                            />
                          </div>
                          <FieldError message={errors.pubgId?.message} />
                        </div>

                        <div className="space-y-1.5">
                          <label htmlFor="mobile" className={labelBase}>
                            Country Code &amp; Mobile No
                          </label>
                          <div className="flex items-stretch gap-2">
                            <div className="relative shrink-0">
                              <select
                                {...register("countryCode")}
                                aria-label="Country code"
                                className={`${inputBase} appearance-none pr-8 font-medium`}
                              >
                                {COUNTRY_CODES.map((c) => (
                                  <option key={c.code} value={c.code}>
                                    {c.flag} {c.code}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            </div>
                            <input
                              id="mobile"
                              type="tel"
                              inputMode="numeric"
                              maxLength={15}
                              placeholder="1XXXXXXXXX"
                              {...register("mobile")}
                              className={inputBase}
                            />
                          </div>
                          <FieldError message={errors.countryCode?.message ?? errors.mobile?.message} />
                        </div>

                        <div className="space-y-1.5">
                          <label htmlFor="server" className={labelBase}>
                            Game Server
                          </label>
                          <div className="relative">
                            <select
                              id="server"
                              {...register("server")}
                              className={`${inputBase} appearance-none pr-8`}
                            >
                              <option value="">Select</option>
                              {SERVERS.map((s) => (
                                <option key={s} value={s}>
                                  {s}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          </div>
                          <FieldError message={errors.server?.message} />
                        </div>

                        <div className="space-y-1.5">
                          <label className="flex cursor-pointer items-start gap-3">
                            <input
                              type="checkbox"
                              {...register("terms")}
                              className="mt-0.5 h-4 w-4 rounded border-input bg-background/50 text-primary focus:ring-2 focus:ring-ring/40"
                            />
                            <span className="text-[13px] leading-relaxed text-muted-foreground">
                              By signing up, I agree to the{" "}
                              <a href="#" className="text-primary underline underline-offset-4 hover:text-primary/80">
                                Terms of Service
                              </a>{" "}
                              and{" "}
                              <a href="#" className="text-primary underline underline-offset-4 hover:text-primary/80">
                                Privacy Policy
                              </a>
                              .
                            </span>
                          </label>
                          <FieldError message={errors.terms?.message} />
                        </div>

                        <div className="flex items-center gap-3 pt-1">
                          <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="flex shrink-0 items-center gap-2 rounded-lg border border-border/70 px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/40 hover:text-foreground"
                          >
                            <ArrowLeft className="h-4 w-4" />
                            Back
                          </button>
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-primary/40 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            {isSubmitting ? (
                              <>
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                                Creating account...
                              </>
                            ) : (
                              <>
                                <Swords className="h-4 w-4" />
                                Create Account
                              </>
                            )}
                          </button>
                        </div>
                      </>
                    )}
                  </form>
                )}

                <div className="my-6 flex items-center gap-3">
                  <span className="h-px flex-1 bg-border" />
                  <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground/80">
                    Or continue with
                  </span>
                  <span className="h-px flex-1 bg-border" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {["Google", "Discord"].map((provider) => (
                    <button
                      key={provider}
                      type="button"
                      disabled
                      className="relative flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-lg border border-border/60 bg-background/40 px-3 py-2.5 text-[13px] font-medium text-muted-foreground"
                    >
                      {provider}
                      <span className="rounded bg-primary/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
                        Soon
                      </span>
                    </button>
                  ))}
                </div>

                <p className="mt-6 text-center text-[13px] text-muted-foreground">
                  Already have an account?{" "}
                  <Link
                    to="/"
                    className="font-medium text-primary underline underline-offset-4 transition-colors hover:text-primary/80"
                  >
                    Sign In
                  </Link>
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground/80">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                100% Secure
              </span>
              <span className="flex items-center gap-1.5">
                <Trophy className="h-3.5 w-3.5 text-primary" />
                Fair Play
              </span>
              <span className="flex items-center gap-1.5">
                <Wallet className="h-3.5 w-3.5 text-primary" />
                Real Cash Prizes
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
