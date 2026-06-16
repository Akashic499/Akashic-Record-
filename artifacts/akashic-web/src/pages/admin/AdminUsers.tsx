import { useState } from "react";
import { useListUsers, useDeleteUser } from "@workspace/api-client-react";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { getListUsersQueryKey } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminUsers() {
  const [page, setPage] = useState(1);
  const limit = 20;
  
  const { data: usersData, isLoading } = useListUsers({ limit, offset: (page - 1) * limit });
  const deleteUser = useDeleteUser();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to banish this user from the archive?")) {
      deleteUser.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });
          toast({ title: "User Banished" });
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-primary/20 pb-4">
        <h1 className="text-3xl font-serif text-foreground mb-1">Cosmic Seekers</h1>
        <p className="text-muted-foreground font-serif text-sm">Those who wander the archives.</p>
      </div>

      <div className="bg-card/40 border border-primary/20 overflow-x-auto">
        <table className="w-full text-left font-serif border-collapse">
          <thead>
            <tr className="border-b border-primary/20 text-primary/80 uppercase tracking-widest text-xs">
              <th className="px-6 py-4 font-normal">Identity</th>
              <th className="px-6 py-4 font-normal">Joined</th>
              <th className="px-6 py-4 font-normal text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-primary/10">
            {isLoading ? (
              <tr><td colSpan={3} className="px-6 py-8 text-center text-muted-foreground">Scrying...</td></tr>
            ) : usersData?.map(user => (
              <tr key={user.id} className="hover:bg-primary/5 transition-colors">
                <td className="px-6 py-4">
                  <div className="text-foreground font-medium mb-1">{user.username || 'Anonymous Seeker'}</div>
                  <div className="text-xs text-muted-foreground">{user.email}</div>
                </td>
                <td className="px-6 py-4 text-muted-foreground text-sm">
                  {format(new Date(user.createdAt), "MMM d, yyyy")}
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => handleDelete(user.id)}
                    className="p-2 text-muted-foreground hover:text-destructive transition-colors border border-transparent hover:border-destructive/20 bg-card"
                    title="Banish User"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {usersData?.length === 0 && (
              <tr><td colSpan={3} className="px-6 py-8 text-center text-muted-foreground italic">The hall is empty.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className="flex justify-end font-serif text-sm">
        <div className="flex gap-2 ml-auto">
          <button 
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="px-4 py-2 border border-primary/20 text-primary disabled:opacity-50 bg-card hover:bg-primary/10 transition-colors"
          >
            Prev
          </button>
          <button 
            disabled={!usersData || usersData.length < limit}
            onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 border border-primary/20 text-primary disabled:opacity-50 bg-card hover:bg-primary/10 transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}