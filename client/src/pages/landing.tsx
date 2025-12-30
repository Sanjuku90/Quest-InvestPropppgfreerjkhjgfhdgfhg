import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { TrendingUp, Target, Zap, Trophy, ArrowRight, Check } from "lucide-react";

export default function LandingPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-md border-b border-border/50 z-50 flex items-center px-6 justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold font-display text-lg">QuestInvest Pro</span>
        </div>
        <Button onClick={() => setLocation("/auth")} variant="default">
          Sign In
        </Button>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-primary/8 blur-[120px] -z-10" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-accent/5 blur-[100px] -z-10" />

        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-6xl md:text-7xl font-bold font-display leading-tight">
              Invest Smart.<br />
              <span className="text-gradient-primary">Complete Quests.</span><br />
              Earn More.
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Transform your daily goals into meaningful financial returns. Join a community of forward-thinking investors who turn tasks into profits.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Button 
              size="lg" 
              onClick={() => setLocation("/auth")}
              className="btn-glow"
              data-testid="button-get-started"
            >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              data-testid="button-learn-more"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-card/20 border-y border-border/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold font-display text-center mb-16">
            Why Choose QuestInvest Pro?
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Target,
                title: "Daily Quests",
                description: "Complete engaging daily tasks and earn real investment returns. Every action counts.",
              },
              {
                icon: Zap,
                title: "Smart Investing",
                description: "Invest strategically with our intelligent system. Watch your portfolio grow exponentially.",
              },
              {
                icon: Trophy,
                title: "Compete & Win",
                description: "Climb the leaderboard, earn badges, and compete with other investors worldwide.",
              },
            ].map((feature, idx) => (
              <div key={idx} className="glass-card p-8 space-y-4 hover-elevate" data-testid={`card-feature-${idx}`}>
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold font-display">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold font-display text-center mb-16">
            How It Works
          </h2>

          <div className="space-y-6">
            {[
              "Sign up and create your investor profile",
              "Complete daily quests and strategic challenges",
              "Earn points and invest them in opportunities",
              "Watch your portfolio grow and climb rankings",
              "Withdraw earnings or reinvest for bigger returns",
            ].map((benefit, idx) => (
              <div key={idx} className="flex items-start gap-4 p-4 rounded-lg border border-border/50 hover:border-primary/30 transition-colors" data-testid={`item-benefit-${idx}`}>
                <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Check className="w-4 h-4 text-background" />
                </div>
                <p className="text-lg">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-primary/10 to-accent/10 border-t border-border/50">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl font-bold font-display">
              Ready to Start Investing?
            </h2>
            <p className="text-xl text-muted-foreground">
              Join thousands of smart investors who are already earning through QuestInvest Pro.
            </p>
          </div>

          <Button 
            size="lg" 
            onClick={() => setLocation("/auth")}
            className="btn-glow"
            data-testid="button-create-account"
          >
            Create Your Account
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border/50 text-center text-muted-foreground text-sm">
        <p>&copy; 2025 QuestInvest Pro. All rights reserved.</p>
      </footer>
    </div>
  );
}
