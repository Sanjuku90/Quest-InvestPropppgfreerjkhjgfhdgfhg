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
      <div className="p-6 border-b border-white/5">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold font-display text-gradient-gold">
            QuestInvest
          </h1>
          <p className="text-xs font-mono tracking-widest text-primary opacity-70">PRO EDITION</p>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1.5 py-6">
        {navItems.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <div 
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer font-medium
                  ${isActive 
                    ? "bg-gradient-to-r from-primary/30 to-primary/10 text-primary border border-primary/30 shadow-lg shadow-primary/20" 
                    : "text-muted-foreground hover:bg-white/8 hover:text-foreground border border-transparent"
                  }
                `}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Icon size={20} className="flex-shrink-0" />
                <span>{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto border-t border-white/5 space-y-4">
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg glass-card-sm border-white/10 hover:border-white/15 transition-all">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary via-primary/80 to-orange-500 flex items-center justify-center font-bold text-primary-foreground shadow-lg shadow-primary/40">
            {user.fullName?.charAt(0) || "U"}
          </div>
          <div className="overflow-hidden flex-1">
            <p className="text-sm font-semibold truncate">{user.fullName}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
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
      <aside className="hidden lg:block w-72 border-r border-border/50 bg-gradient-to-b from-card/50 to-card/30 backdrop-blur-xl fixed h-full z-50 shadow-2xl shadow-black/20">
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
