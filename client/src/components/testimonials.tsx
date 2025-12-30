import { Star } from "lucide-react";

export function Testimonials() {
  const testimonials = [
    {
      name: "Alexis K.",
      role: "Investor",
      content: "QuestInvest Pro changed how I approach daily earning. The quests are engaging and the returns are real!",
      rating: 5,
      avatar: "A"
    },
    {
      name: "Marie D.",
      role: "Financial Advisor",
      content: "Finally a platform that gamifies investing. My clients love the experience and the results speak for themselves.",
      rating: 5,
      avatar: "M"
    },
    {
      name: "Thomas R.",
      role: "Trader",
      content: "The leaderboard feature keeps me motivated. I've increased my earnings by 300% in just 3 months.",
      rating: 5,
      avatar: "T"
    }
  ];

  return (
    <div>
      <h2 className="text-4xl font-bold font-display text-center mb-16">
        Trusted by Thousands
      </h2>
      
      <div className="grid md:grid-cols-3 gap-8">
        {testimonials.map((testimonial, idx) => (
          <div
            key={idx}
            className="glass-effect p-8 rounded-2xl space-y-4 animate-fade-in-up"
            style={{
              animationDelay: `${idx * 0.15 + 0.3}s`,
              opacity: 0,
            }}
          >
            <div className="flex gap-1">
              {[...Array(testimonial.rating)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            
            <p className="text-muted-foreground italic">"{testimonial.content}"</p>
            
            <div className="flex items-center gap-3 pt-4 border-t border-white/10">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center font-bold text-white text-sm">
                {testimonial.avatar}
              </div>
              <div>
                <p className="font-semibold text-sm">{testimonial.name}</p>
                <p className="text-xs text-muted-foreground">{testimonial.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
