import { Link, useLocation } from "wouter";
import { useUser, useLogout } from "@/hooks/use-auth";
import { 
  LayoutDashboard, 
  Gamepad2, 
  Wallet, 
  Target, 
  LogOut, 
  Menu,
  Trophy,
  Shield,
  Package,
  Home,
  X
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
    { href: "/", label: "Dashboard", icon: LayoutDashboard, mobile: true },
    { href: "/quests", label: "Quêtes", icon: Target, mobile: true },
    { href: "/chest-game", label: "Coffre", icon: Package, mobile: false },
    { href: "/roulette", label: "Roulette", icon: Gamepad2, mobile: true },
    { href: "/wallet", label: "Portefeuille", icon: Wallet, mobile: true },
    { href: "/leaderboard", label: "Classement", icon: Trophy, mobile: false },
  ];

  const adminNavItem = user?.isAdmin ? [
    { href: "/admin", label: "Admin", icon: Shield, mobile: false },
  ] : [];

  const mobileNavItems = navItems.filter(item => item.mobile);
  const desktopNavItems = [...navItems, ...adminNavItem];

  if (!user) return <div className="min-h-screen bg-background">{children}</div>;

  const NavContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-border/50">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold font-display text-gradient-primary">
            QuestInvest
          </h1>
          <p className="text-xs font-mono tracking-widest text-primary/80">PRO</p>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-1 py-6">
        {desktopNavItems.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <div 
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer font-medium text-sm
                  ${isActive 
                    ? "bg-primary/15 text-primary border border-primary/30" 
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground border border-transparent"
                  }
                `}
                onClick={() => setIsMobileMenuOpen(false)}
                data-testid={`nav-link-${item.href}`}
              >
                <Icon size={20} className="flex-shrink-0" />
                <span>{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto border-t border-border/50 space-y-3">
        <div className="flex items-center gap-2.5 px-3 py-3 rounded-lg glass-card-sm transition-all">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center font-bold text-white text-sm flex-shrink-0">
            {user.fullName?.charAt(0) || "U"}
          </div>
          <div className="overflow-hidden flex-1 min-w-0">
            <p className="text-xs font-semibold truncate">{user.fullName}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          className="w-full justify-start gap-2 text-destructive border-destructive/30 text-sm py-2 h-auto"
          onClick={() => logout.mutate()}
          data-testid="button-logout"
        >
          <LogOut size={18} />
          Déconnexion
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row pb-20 lg:pb-0">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-72 border-r border-border/50 bg-gradient-to-b from-card/50 to-card/30 backdrop-blur-xl fixed h-full z-50 shadow-2xl shadow-black/20">
        <NavContent />
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-md border-b border-border z-40 px-4 flex items-center justify-between">
         <h1 className="text-lg font-bold font-display text-gradient-gold">QuestInvest</h1>
         <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
           <SheetTrigger asChild>
             <Button variant="ghost" size="icon" data-testid="button-mobile-menu">
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

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-20 bg-background/95 backdrop-blur-lg border-t border-border/50 px-2 py-2 flex justify-around items-start gap-1 z-40">
        {mobileNavItems.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <div 
                className={`flex flex-col items-center justify-center gap-1 px-3 py-2.5 rounded-lg transition-all duration-200 cursor-pointer flex-1 h-full
                  ${isActive 
                    ? "bg-primary/15 text-primary" 
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  }
                `}
                data-testid={`mobile-nav-${item.href}`}
              >
                <Icon size={24} className="flex-shrink-0" />
                <span className="text-xs font-medium text-center line-clamp-1">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
