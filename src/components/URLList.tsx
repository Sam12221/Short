import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { URLCard } from "./URLCard";
import { toast } from "sonner";

interface URL {
  id: string;
  original_url: string;
  short_code: string;
  created_at: string;
  clicks: number;
  is_custom: boolean;
}

interface URLListProps {
  userId: string;
}

export const URLList = ({ userId }: URLListProps) => {
  const [urls, setUrls] = useState<URL[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUrls = async () => {
    try {
      const { data, error } = await supabase
        .from("urls")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setUrls(data || []);
    } catch (error: any) {
      console.error("Error fetching URLs:", error);
      toast.error("Failed to load your URLs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUrls();

    // Listen for new URL creation
    const handleUrlCreated = () => {
      fetchUrls();
    };

    window.addEventListener("url-created", handleUrlCreated);

    // Set up realtime subscription
    const channel = supabase
      .channel("urls-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "urls",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchUrls();
        }
      )
      .subscribe();

    return () => {
      window.removeEventListener("url-created", handleUrlCreated);
      channel.unsubscribe();
    };
  }, [userId]);

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("urls").delete().eq("id", id);

      if (error) throw error;

      toast.success("URL deleted successfully");
      fetchUrls();
    } catch (error: any) {
      console.error("Error deleting URL:", error);
      toast.error("Failed to delete URL");
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-pulse text-muted-foreground">Loading your links...</div>
      </div>
    );
  }

  if (urls.length === 0) {
    return (
      <div className="text-center py-12 space-y-2">
        <p className="text-muted-foreground">No shortened URLs yet</p>
        <p className="text-sm text-muted-foreground">Create your first short link above!</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {urls.map((url) => (
        <URLCard key={url.id} url={url} onDelete={handleDelete} />
      ))}
    </div>
  );
};
