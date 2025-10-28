import { Card } from "@/components/ui/card";
import { BarChart3, MousePointerClick, Link as LinkIcon } from "lucide-react";

interface URLAnalyticsProps {
  totalClicks: number;
  totalUrls: number;
}

export const URLAnalytics = ({ totalClicks, totalUrls }: URLAnalyticsProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-3 mb-8">
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-primary/10">
            <MousePointerClick className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Clicks</p>
            <p className="text-3xl font-bold">{totalClicks}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-accent/10">
            <LinkIcon className="h-6 w-6 text-accent" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Short URLs</p>
            <p className="text-3xl font-bold">{totalUrls}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-secondary/10">
            <BarChart3 className="h-6 w-6 text-secondary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Avg. Clicks per URL</p>
            <p className="text-3xl font-bold">
              {totalUrls > 0 ? (totalClicks / totalUrls).toFixed(1) : 0}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};