import { useState, useRef, useEffect } from "react";
import { useQueryOracle } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles } from "lucide-react";

export default function Oracle() {
  const [question, setQuestion] = useState("");
  const [history, setHistory] = useState<{role: 'user' | 'oracle', content: string}[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const queryOracle = useQueryOracle();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, queryOracle.isPending]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || queryOracle.isPending) return;

    const currentQuestion = question.trim();
    setQuestion("");
    
    setHistory(prev => [...prev, { role: 'user', content: currentQuestion }]);
    
    queryOracle.mutate({
      data: {
        question: currentQuestion,
        history: history.map(h => ({ role: h.role === 'user' ? 'user' : 'model', content: h.content }))
      }
    }, {
      onSuccess: (res) => {
        setHistory(prev => [...prev, { role: 'oracle', content: res.answer }]);
      }
    });
  };

  return (
    <div className="container mx-auto px-6 py-12 max-w-4xl min-h-[calc(100vh-80px)] flex flex-col relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      
      <header className="text-center mb-12 relative z-10">
        <Sparkles className="w-8 h-8 text-primary mx-auto mb-4 animate-pulse" />
        <h1 className="text-4xl md:text-5xl font-serif text-foreground mb-4">Consult the Oracle</h1>
        <p className="text-muted-foreground font-serif">Pose your question to the cosmic consciousness.</p>
      </header>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto mb-8 pr-4 space-y-12 relative z-10 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent"
      >
        {history.length === 0 && (
          <div className="h-full flex items-center justify-center text-center opacity-50">
            <p className="text-xl font-serif italic max-w-md">"I am the whisper between the stars. What knowledge do you seek?"</p>
          </div>
        )}

        <AnimatePresence initial={false}>
          {history.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] p-6 font-serif leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-card/40 border border-primary/20 text-foreground' 
                    : 'bg-transparent border-l-2 border-primary/50 text-primary/90 text-lg md:text-xl italic'
                }`}
                dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, '<br/>') }}
              />
            </motion.div>
          ))}
          
          {queryOracle.isPending && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-transparent border-l-2 border-primary/50 text-primary/50 text-lg p-6 font-serif italic flex items-center gap-2">
                <span>The cosmos aligns...</span>
                <span className="flex gap-1">
                  <span className="animate-bounce delay-75">.</span>
                  <span className="animate-bounce delay-150">.</span>
                  <span className="animate-bounce delay-300">.</span>
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="relative z-10 mt-auto">
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask your question..."
            disabled={queryOracle.isPending}
            className="w-full bg-card/80 border border-primary/30 py-4 pl-6 pr-16 text-foreground font-serif placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/50 transition-all shadow-[0_0_20px_rgba(0,0,0,0.5)] disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!question.trim() || queryOracle.isPending}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-primary hover:text-primary/70 disabled:opacity-50 transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
        <div className="absolute -inset-0.5 bg-primary/20 blur opacity-0 group-focus-within:opacity-100 transition duration-1000 -z-10" />
      </div>
    </div>
  );
}