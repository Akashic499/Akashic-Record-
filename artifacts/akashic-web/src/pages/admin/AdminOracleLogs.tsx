import { useState } from "react";
import { useListOracleLogs } from "@workspace/api-client-react";
import { format } from "date-fns";

export default function AdminOracleLogs() {
  const [page, setPage] = useState(1);
  const limit = 20;
  
  const { data: logsData, isLoading } = useListOracleLogs({ limit, offset: (page - 1) * limit });

  return (
    <div className="space-y-6">
      <div className="border-b border-primary/20 pb-4">
        <h1 className="text-3xl font-serif text-foreground mb-1">Oracle Consultations</h1>
        <p className="text-muted-foreground font-serif text-sm">Review what knowledge seekers have asked the cosmos.</p>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="p-8 text-center text-primary font-serif animate-pulse">Divining logs...</div>
        ) : logsData?.map(log => (
          <div key={log.id} className="bg-card/40 border border-primary/10 p-6 flex flex-col gap-4">
            <div className="flex justify-between items-start text-xs font-serif text-muted-foreground border-b border-primary/5 pb-2">
              <span className="uppercase tracking-widest">Query #{log.id}</span>
              <span>{format(new Date(log.createdAt), "MMM d, yyyy HH:mm")}</span>
            </div>
            
            <div className="space-y-4 font-serif">
              <div className="bg-primary/5 border-l-2 border-primary/30 p-4 text-foreground">
                <span className="text-xs uppercase tracking-widest text-primary/60 block mb-2">Seeker asked:</span>
                {log.question}
              </div>
              <div className="pl-4 text-muted-foreground">
                <span className="text-xs uppercase tracking-widest text-primary/40 block mb-2">Oracle answered:</span>
                <p className="whitespace-pre-wrap">{log.answer}</p>
              </div>
            </div>
          </div>
        ))}
        
        {logsData?.length === 0 && (
          <div className="p-8 text-center text-muted-foreground font-serif border border-primary/10 bg-card/20">
            No queries have been recorded yet.
          </div>
        )}
      </div>

      <div className="flex justify-between items-center font-serif text-sm">
        <div className="flex gap-2 ml-auto">
          <button 
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="px-4 py-2 border border-primary/20 text-primary disabled:opacity-50 bg-card hover:bg-primary/10 transition-colors"
          >
            Newer
          </button>
          <button 
            disabled={!logsData || logsData.length < limit}
            onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 border border-primary/20 text-primary disabled:opacity-50 bg-card hover:bg-primary/10 transition-colors"
          >
            Older
          </button>
        </div>
      </div>
    </div>
  );
}