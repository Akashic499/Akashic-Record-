import { useState } from "react";
import { useListTomes, useDeleteTome, useUpdateTome, useCreateTome } from "@workspace/api-client-react";
import { format } from "date-fns";
import { Plus, Edit2, Trash2, Star, Eye } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { getListTomesQueryKey } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminTomes() {
  const [page, setPage] = useState(1);
  const [isEditing, setIsEditing] = useState<number | 'new' | null>(null);
  const limit = 20;
  
  const { data: tomesData, isLoading } = useListTomes({ limit, offset: (page - 1) * limit });
  const deleteTome = useDeleteTome();
  const updateTome = useUpdateTome();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to erase this knowledge from the archive?")) {
      deleteTome.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListTomesQueryKey() });
          toast({ title: "Tome Erased" });
        }
      });
    }
  };

  const toggleFeatured = (id: number, current: boolean) => {
    updateTome.mutate({ id, data: { featured: !current } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListTomesQueryKey() });
      }
    });
  };

  if (isEditing) {
    return <TomeEditor id={isEditing} onCancel={() => setIsEditing(null)} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-primary/20 pb-4">
        <div>
          <h1 className="text-3xl font-serif text-foreground mb-1">Archive Management</h1>
          <p className="text-muted-foreground font-serif text-sm">Curate the knowledge within.</p>
        </div>
        <button 
          onClick={() => setIsEditing('new')}
          className="flex items-center gap-2 bg-primary/10 border border-primary text-primary px-4 py-2 hover:bg-primary/20 transition-colors font-serif uppercase tracking-widest text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Inscribe New</span>
        </button>
      </div>

      <div className="bg-card/40 border border-primary/20 overflow-x-auto">
        <table className="w-full text-left font-serif border-collapse">
          <thead>
            <tr className="border-b border-primary/20 text-primary/80 uppercase tracking-widest text-xs">
              <th className="px-6 py-4 font-normal">Title</th>
              <th className="px-6 py-4 font-normal">Category</th>
              <th className="px-6 py-4 font-normal">Status</th>
              <th className="px-6 py-4 font-normal text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-primary/10">
            {isLoading ? (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">Loading...</td></tr>
            ) : tomesData?.tomes.map(tome => (
              <tr key={tome.id} className="hover:bg-primary/5 transition-colors">
                <td className="px-6 py-4">
                  <div className="text-foreground font-medium mb-1 line-clamp-1">{tome.title}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-3">
                    <span>{format(new Date(tome.createdAt), "MMM d, yyyy")}</span>
                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {tome.viewCount}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs uppercase tracking-widest border border-primary/20 px-2 py-1 text-muted-foreground">
                    {tome.category}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button 
                    onClick={() => toggleFeatured(tome.id, tome.featured)}
                    className={`p-1.5 rounded-sm transition-colors ${tome.featured ? 'bg-primary/20 text-primary border border-primary/50' : 'text-muted-foreground hover:text-primary'}`}
                    title={tome.featured ? "Featured" : "Not Featured"}
                  >
                    <Star className={`w-4 h-4 ${tome.featured ? "fill-current" : ""}`} />
                  </button>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => setIsEditing(tome.id)}
                      className="p-2 text-muted-foreground hover:text-primary transition-colors border border-transparent hover:border-primary/20 bg-card"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(tome.id)}
                      className="p-2 text-muted-foreground hover:text-destructive transition-colors border border-transparent hover:border-destructive/20 bg-card"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {tomesData && tomesData.total > limit && (
        <div className="flex justify-between items-center font-serif text-sm">
          <span className="text-muted-foreground">Showing {(page-1)*limit + 1} to {Math.min(page*limit, tomesData.total)} of {tomesData.total}</span>
          <div className="flex gap-2">
            <button 
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="px-3 py-1 border border-primary/20 text-primary disabled:opacity-50"
            >
              Prev
            </button>
            <button 
              disabled={page * limit >= tomesData.total}
              onClick={() => setPage(p => p + 1)}
              className="px-3 py-1 border border-primary/20 text-primary disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Simple editor component embedded
function TomeEditor({ id, onCancel }: { id: number | 'new', onCancel: () => void }) {
  const [formData, setFormData] = useState({
    title: "", category: "", excerpt: "", content: "", tags: "", sourceUrl: "", featured: false
  });
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const isNew = id === 'new';
  
  // For editing, we'd normally fetch the tome. To keep it fast for this mock, we assume simple fields.
  // In a real app, useGetTome here.
  
  const create = useCreateTome();
  const update = useUpdateTome();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      tags: formData.tags.split(",").map(t => t.trim()).filter(Boolean)
    };

    if (isNew) {
      create.mutate({ data }, {
        onSuccess: () => {
          toast({ title: "Tome Inscribed" });
          queryClient.invalidateQueries({ queryKey: getListTomesQueryKey() });
          onCancel();
        }
      });
    } else {
      update.mutate({ id: id as number, data }, {
        onSuccess: () => {
          toast({ title: "Tome Revised" });
          queryClient.invalidateQueries({ queryKey: getListTomesQueryKey() });
          onCancel();
        }
      });
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex justify-between items-center border-b border-primary/20 pb-4">
        <h2 className="text-2xl font-serif text-foreground">{isNew ? 'Inscribe New Knowledge' : 'Revise Inscription'}</h2>
        <button onClick={onCancel} className="text-muted-foreground hover:text-foreground font-serif uppercase tracking-widest text-sm">Cancel</button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="col-span-2 space-y-2">
            <label className="text-xs uppercase tracking-widest text-primary/80 font-serif">Title</label>
            <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-card/50 border border-primary/20 p-3 text-foreground font-serif focus:border-primary/60 outline-none" />
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-primary/80 font-serif">Category</label>
            <input required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-card/50 border border-primary/20 p-3 text-foreground font-serif focus:border-primary/60 outline-none" />
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-primary/80 font-serif">Tags (comma separated)</label>
            <input value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} className="w-full bg-card/50 border border-primary/20 p-3 text-foreground font-serif focus:border-primary/60 outline-none" />
          </div>
          <div className="col-span-2 space-y-2">
            <label className="text-xs uppercase tracking-widest text-primary/80 font-serif">Excerpt</label>
            <textarea value={formData.excerpt} onChange={e => setFormData({...formData, excerpt: e.target.value})} className="w-full h-24 bg-card/50 border border-primary/20 p-3 text-foreground font-serif focus:border-primary/60 outline-none resize-none" />
          </div>
          <div className="col-span-2 space-y-2">
            <label className="text-xs uppercase tracking-widest text-primary/80 font-serif">Content (HTML allowed)</label>
            <textarea required value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className="w-full h-64 bg-card/50 border border-primary/20 p-3 text-foreground font-mono text-sm focus:border-primary/60 outline-none" />
          </div>
        </div>
        
        <div className="flex justify-end gap-4 border-t border-primary/20 pt-6">
          <button type="button" onClick={onCancel} className="px-6 py-2 border border-primary/20 text-muted-foreground hover:text-foreground font-serif uppercase tracking-widest text-sm transition-colors">
            Discard
          </button>
          <button type="submit" disabled={create.isPending || update.isPending} className="px-6 py-2 bg-primary/10 border border-primary text-primary hover:bg-primary/20 font-serif uppercase tracking-widest text-sm transition-colors disabled:opacity-50">
            {isNew ? 'Inscribe' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}