import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Link2 } from "lucide-react";

const Redirect = () => {
  const { shortCode } = useParams<{ shortCode: string }>();

  useEffect(() => {
    const redirect = async () => {
      if (!shortCode) {
        window.location.href = "/";
        return;
      }

      try {
        // Fetch the URL
        const { data, error } = await supabase
          .from("urls")
          .select("original_url")
          .eq("short_code", shortCode)
          .maybeSingle();

        if (error || !data) {
          window.location.href = "/";
          return;
        }

        // Increment click count before redirecting
        await supabase.rpc("increment_url_clicks", {
          url_short_code: shortCode,
        });

        // 301 permanent redirect for caching
        window.location.replace(data.original_url);
      } catch (error) {
        console.error("Redirect error:", error);
        window.location.href = "/";
      }
    };

    redirect();
  }, [shortCode]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
      <div className="text-center space-y-4">
        <Link2 className="h-12 w-12 text-primary animate-pulse mx-auto" />
        <p className="text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  );
};

export default Redirect;
