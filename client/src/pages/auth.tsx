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
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Panel - Hero */}
      <div className="hidden lg:flex flex-col justify-center items-center relative overflow-hidden p-12 text-center">
        {/* Subtle gradient background */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-900/20 to-teal-900/10" />
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />
        
        <div className="relative z-10 max-w-lg">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-xl mx-auto mb-8 flex items-center justify-center shadow-xl shadow-primary/25">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-5xl font-bold font-display text-foreground mb-6 leading-tight">
            Invest Smart.<br/>Complete <span className="text-gradient-primary">Quests.</span> Earn More.
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Join a community of forward-thinking investors who transform daily goals into meaningful returns. 
            Level up your financial game with QuestInvest Pro.
          </p>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Header */}
          <div className="text-center lg:hidden mb-8">
             <div className="w-12 h-12 bg-primary rounded-lg mx-auto mb-4 flex items-center justify-center">
               <TrendingUp className="w-6 h-6 text-white" />
             </div>
             <h1 className="text-2xl font-bold font-display">QuestInvest Pro</h1>
             <p className="text-sm text-muted-foreground mt-2">Smart investing starts here</p>
          </div>

          <Card className="glass-card">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
              <CardHeader>
                <TabsList className="grid w-full grid-cols-2 bg-muted/40">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>
              </CardHeader>
              
              <CardContent className="space-y-4 pt-4">
                <TabsContent value="login">
                  <LoginForm onSubmit={onLogin} isLoading={loginMutation.isPending} error={loginMutation.error} />
                </TabsContent>
                
                <TabsContent value="register">
                  <RegisterForm onSubmit={onRegister} isLoading={registerMutation.isPending} error={registerMutation.error} />
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
          
          <p className="text-center text-xs text-muted-foreground/80 px-8">
            By continuing, you agree to our <span className="text-foreground/60">Terms of Service</span> and <span className="text-foreground/60">Privacy Policy</span>
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
