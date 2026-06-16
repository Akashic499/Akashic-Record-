import { useState } from "react";
import { useLocation } from "wouter";
import { useAdminLogin } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const login = useAdminLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate({ data: { username, password } }, {
      onSuccess: (res) => {
        localStorage.setItem("akashic_admin_token", res.token);
        toast({
          title: "Access Granted",
          description: "Welcome to the Inner Sanctum.",
        });
        setLocation("/admin/dashboard");
      },
      onError: () => {
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "Your credentials hold no power here.",
        });
      }
    });
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-background px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,168,76,0.05)_0%,transparent_50%)]" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-card/40 border border-primary/20 p-10 md:p-12 backdrop-blur-xl shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          <div className="w-16 h-16 mx-auto border-2 border-primary/40 rounded-sm flex items-center justify-center mb-8 rotate-45">
            <Lock className="w-6 h-6 text-primary -rotate-45" />
          </div>
          
          <h1 className="text-3xl font-serif text-center text-primary mb-2 uppercase tracking-widest">
            Inner Sanctum
          </h1>
          <p className="text-center text-muted-foreground font-serif mb-10 text-sm italic">
            Identify yourself to access the core archive.
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs uppercase tracking-widest text-primary/80 font-serif mb-2">
                True Name
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-background/50 border border-primary/20 px-4 py-3 text-foreground font-mono text-sm focus:outline-none focus:border-primary/60 transition-colors"
                required
              />
            </div>
            
            <div>
              <label className="block text-xs uppercase tracking-widest text-primary/80 font-serif mb-2">
                Secret Phrase
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-background/50 border border-primary/20 px-4 py-3 text-foreground font-mono text-sm focus:outline-none focus:border-primary/60 transition-colors"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={login.isPending}
              className="w-full bg-primary/10 border border-primary/40 text-primary py-4 mt-4 font-serif uppercase tracking-widest hover:bg-primary/20 hover:shadow-[0_0_15px_rgba(201,168,76,0.2)] transition-all disabled:opacity-50"
            >
              {login.isPending ? "Verifying..." : "Enter"}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}