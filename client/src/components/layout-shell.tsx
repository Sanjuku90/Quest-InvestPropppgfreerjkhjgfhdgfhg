import { Link, useLocation } from "wouter";
import { useUser, useLogout } from "@/hooks/use-auth";
import { 
  LayoutDashboard, 
  Gamepad2, 
  Wallet, 
  Target, 
  LogOut, 
  Menu,
  X,
  Trophy
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { data: user } = useUser();
  const logout = useLogout();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/quests", label: "Daily Quests", icon: Target },
    { href: "/roulette", label: "Lucky Wheel", icon: Gamepad2 },
    { href: "/wallet", label: "Wallet", icon: Wallet },
    { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  ];

  if (!user) return <div className="min-h-screen bg-background">{children}</div>;

  const NavContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6">
        <h1 className="text-2xl font-bold font-display text-gradient-gold">
          QuestInvest
          <span className="text-white text-xs block font-mono tracking-widest mt-1 opacity-50">PRO EDITION</span>
        </h1>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <div 
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer
                  ${isActive 
                    ? "bg-primary/10 text-primary border border-primary/20 shadow-lg shadow-primary/5" 
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  }
                `}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto border-t border-white/5">
        <div className="flex items-center gap-3 px-4 py-3 mb-4 rounded-xl bg-white/5 border border-white/5">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-orange-400 flex items-center justify-center font-bold text-primary-foreground">
            {user.fullName?.charAt(0) || "U"}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold truncate">{user.fullName}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          className="w-full justify-start gap-3 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={() => logout.mutate()}
        >
          <LogOut size={18} />
          Sign Out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-72 border-r border-border bg-card/30 backdrop-blur-xl fixed h-full z-50">
        <NavContent />
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-md border-b border-border z-40 px-4 flex items-center justify-between">
         <h1 className="text-xl font-bold font-display text-gradient-gold">QuestInvest</h1>
         <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
           <SheetTrigger asChild>
             <Button variant="ghost" size="icon">
               <Menu className="h-6 w-6" />
             </Button>
           </SheetTrigger>
           <SheetContent side="left" className="p-0 w-80 bg-background border-r border-border">
             <NavContent />
           </SheetContent>
         </Sheet>
      </div>

      {/* Main Content */}
      <main className="flex-1 lg:ml-72 pt-16 lg:pt-0 min-h-screen relative overflow-hidden">
        {/* Background ambient effects */}
        <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-[100px]" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-secondary/5 blur-[100px]" />
        </div>
        
        <div className="max-w-7xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
          {children}
        </div>
      </main>
    </div>
  );
}
