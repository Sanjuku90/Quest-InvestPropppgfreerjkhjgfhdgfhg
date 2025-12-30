import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { useLogin, useRegister, useUser } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { insertUserSchema } from "@shared/schema";
import { Loader2, TrendingUp } from "lucide-react";

// Extend schema for registration form (confirm password could be added here in real app)
const registerSchema = insertUserSchema;
type RegisterFormData = z.infer<typeof registerSchema>;

// Login schema
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});
type LoginFormData = z.infer<typeof loginSchema>;

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { data: user, isLoading: isUserLoading } = useUser();
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  // Redirect if already logged in
  if (user && !isUserLoading) {
    setLocation("/");
    return null;
  }

  const onLogin = async (data: LoginFormData) => {
    try {
      await loginMutation.mutateAsync(data);
    } catch (error) {
      // Error handled by mutation state
    }
  };

  const onRegister = async (data: RegisterFormData) => {
    try {
      await registerMutation.mutateAsync(data);
      // Switch to login tab or auto-login (implementation dependent)
      setActiveTab("login");
    } catch (error) {
      // Error handled by mutation state
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Left Panel - Hero */}
      <div className="hidden lg:flex flex-col justify-center items-center relative overflow-hidden p-16 text-center">
        {/* Minimal gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/5" />
        <div className="absolute top-[-30%] right-[-20%] w-[800px] h-[800px] rounded-full bg-primary/8 blur-[150px]" />
        <div className="absolute bottom-[-30%] left-[-20%] w-[600px] h-[600px] rounded-full bg-accent/8 blur-[150px]" />
        
        <div className="relative z-10 max-w-xl">
          <div className="w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-lg mx-auto mb-8 flex items-center justify-center">
            <TrendingUp className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-6xl font-bold font-display text-foreground mb-6 leading-tight">
            Invest Smart. <span className="text-gradient-primary">Complete Quests.</span> Earn.
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Transform daily goals into real investment returns. Join forward-thinking investors who turn tasks into meaningful profits with QuestInvest Pro.
          </p>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile Header */}
          <div className="text-center lg:hidden mb-6">
             <div className="w-10 h-10 bg-primary rounded-lg mx-auto mb-3 flex items-center justify-center">
               <TrendingUp className="w-5 h-5 text-white" />
             </div>
             <h1 className="text-2xl font-bold font-display">QuestInvest</h1>
             <p className="text-xs text-muted-foreground mt-1">Smart investing platform</p>
          </div>

          <Card className="modern-card border-border/60">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
              <CardHeader className="pb-3">
                <TabsList className="grid w-full grid-cols-2 bg-muted/30 p-1">
                  <TabsTrigger value="login" className="text-sm">Login</TabsTrigger>
                  <TabsTrigger value="register" className="text-sm">Register</TabsTrigger>
                </TabsList>
              </CardHeader>
              
              <CardContent className="space-y-4 pt-2">
                <TabsContent value="login">
                  <LoginForm onSubmit={onLogin} isLoading={loginMutation.isPending} error={loginMutation.error} />
                </TabsContent>
                
                <TabsContent value="register">
                  <RegisterForm onSubmit={onRegister} isLoading={registerMutation.isPending} error={registerMutation.error} />
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
          
          <p className="text-center text-xs text-muted-foreground px-6">
            By continuing, you agree to our <span className="text-foreground/70">Terms</span> and <span className="text-foreground/70">Privacy Policy</span>
          </p>
        </div>
      </div>
    </div>
  );
}

function LoginForm({ onSubmit, isLoading, error }: { onSubmit: (data: LoginFormData) => void, isLoading: boolean, error: Error | null }) {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="john@example.com" {...register("email")} />
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" {...register("password")} />
        {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
      </div>
      
      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error.message}
        </div>
      )}

      <Button type="submit" className="w-full font-semibold" disabled={isLoading}>
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Sign In
      </Button>
    </form>
  );
}

function RegisterForm({ onSubmit, isLoading, error }: { onSubmit: (data: RegisterFormData) => void, isLoading: boolean, error: Error | null }) {
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema)
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input id="fullName" placeholder="John Doe" {...register("fullName")} />
        {errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="reg-email">Email</Label>
        <Input id="reg-email" type="email" placeholder="john@example.com" {...register("email")} />
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="reg-password">Password</Label>
        <Input id="reg-password" type="password" {...register("password")} />
        {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error.message}
        </div>
      )}

      <Button type="submit" className="w-full font-semibold" disabled={isLoading}>
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Create Account
      </Button>
    </form>
  );
}
