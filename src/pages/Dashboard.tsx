import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut, Link2, QrCode } from "lucide-react";
import { toast } from "sonner";
import { URLShortener } from "@/components/URLShortener";
import { URLList } from "@/components/URLList";
import { URLAnalytics } from "@/components/URLAnalytics";
import logoImage from "@/assets/logo.png";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [totalClicks, setTotalClicks] = useState(0);
  const [totalUrls, setTotalUrls] = useState(0);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }
      
      setUser(session.user);
      
      // Fetch analytics data
      const { data: urls } = await supabase
        .from("urls")
        .select("clicks")
        .eq("user_id", session.user.id);
      
      if (urls) {
        setTotalUrls(urls.length);
        const clicks = urls.reduce((sum, url) => sum + (url.clicks || 0), 0);
        setTotalClicks(clicks);
      }
      
      setLoading(false);
    };

    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        navigate("/auth");
      } else if (session) {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Failed to sign out");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoImage} alt="LinkSnap Logo" className="h-10 w-10 object-contain" />
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              LinkSnap
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {user?.email}
            </span>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        <section className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">Analytics</h2>
          <URLAnalytics totalClicks={totalClicks} totalUrls={totalUrls} />
        </section>

        <section className="max-w-2xl mx-auto space-y-4">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold">Shorten Your URL</h2>
            <p className="text-muted-foreground">
              Create your short link (limit: 1 URL per user)
            </p>
          </div>
          <URLShortener userId={user?.id} />
        </section>

        <section className="max-w-6xl mx-auto">
          <h3 className="text-2xl font-bold mb-6">Your Links</h3>
          <URLList userId={user?.id} />
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
