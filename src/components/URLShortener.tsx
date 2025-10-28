import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Link, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface URLShortenerProps {
  userId: string;
}

export const URLShortener = ({ userId }: URLShortenerProps) => {
  const [url, setUrl] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [useCustomCode, setUseCustomCode] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!url.trim()) {
      toast.error("Please enter a URL");
      return;
    }

    if (!url.match(/^https?:\/\/.+/)) {
      toast.error("Please enter a valid URL (starting with http:// or https://)");
      return;
    }

    setLoading(true);

    try {
      // Check if user already has a URL (one URL per user limit)
      const { data: existingUrls, error: checkError } = await supabase
        .from("urls")
        .select("id, original_url, short_code")
        .eq("user_id", userId)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingUrls) {
        toast.error("You can only create one shortened URL. Please delete your existing URL first.");
        setLoading(false);
        return;
      }

      let shortCode = customCode.trim();

      if (useCustomCode && customCode.trim()) {
        // Validate custom code
        if (!/^[a-zA-Z0-9-_]{3,20}$/.test(customCode.trim())) {
          toast.error("Custom code must be 3-20 characters (letters, numbers, hyphens, underscores)");
          setLoading(false);
          return;
        }

        // Check if custom code already exists
        const { data: existing } = await supabase
          .from("urls")
          .select("id")
          .eq("short_code", customCode.trim())
          .maybeSingle();

        if (existing) {
          toast.error("This custom code is already taken");
          setLoading(false);
          return;
        }
      } else {
        // Generate random code
        const { data: funcData, error: funcError } = await supabase.rpc(
          "generate_short_code"
        );

        if (funcError) {
          throw funcError;
        }

        shortCode = funcData;
      }

      // Insert the URL
      const { error } = await supabase.from("urls").insert({
        user_id: userId,
        original_url: url.trim(),
        short_code: shortCode,
        is_custom: useCustomCode && !!customCode.trim(),
      });

      if (error) {
        if (error.code === '23505') { // Unique violation
          toast.error("You already have a shortened URL. Each user can only create one URL.");
        } else {
          throw error;
        }
        setLoading(false);
        return;
      }

      toast.success("URL shortened successfully!");
      setUrl("");
      setCustomCode("");
      setUseCustomCode(false);

      // Trigger refresh of URL list
      window.dispatchEvent(new CustomEvent("url-created"));
    } catch (error: any) {
      console.error("Error creating short URL:", error);
      toast.error("Failed to create short URL");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 shadow-glow">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="url">Enter your long URL</Label>
          <div className="flex gap-2">
            <Input
              id="url"
              type="url"
              placeholder="https://example.com/very/long/url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1"
              disabled={loading}
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="custom"
              checked={useCustomCode}
              onCheckedChange={(checked) => setUseCustomCode(checked as boolean)}
            />
            <Label
              htmlFor="custom"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Use custom short code
            </Label>
          </div>

          {useCustomCode && (
            <div className="space-y-2">
              <Label htmlFor="customCode">Custom short code (optional)</Label>
              <Input
                id="customCode"
                type="text"
                placeholder="my-custom-code"
                value={customCode}
                onChange={(e) => setCustomCode(e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                3-20 characters: letters, numbers, hyphens, and underscores only
              </p>
            </div>
          )}
        </div>

        <Button
          type="submit"
          className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
          disabled={loading}
        >
          {loading ? (
            <>
              <Sparkles className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Link className="mr-2 h-4 w-4" />
              Shorten URL
            </>
          )}
        </Button>
      </form>
    </Card>
  );
};
