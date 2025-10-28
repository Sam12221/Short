import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink, Trash2, QrCode as QrCodeIcon, Download } from "lucide-react";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface URLCardProps {
  url: {
    id: string;
    original_url: string;
    short_code: string;
    created_at: string;
    clicks: number;
    is_custom: boolean;
  };
  onDelete: (id: string) => void;
}

export const URLCard = ({ url, onDelete }: URLCardProps) => {
  const [showQR, setShowQR] = useState(false);
  const shortUrl = `${window.location.origin}/${url.short_code}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shortUrl);
    toast.success("Copied to clipboard!");
  };

  const handleDownloadQR = () => {
    const svg = document.getElementById(`qr-${url.id}`) as unknown as SVGSVGElement;
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");

      const downloadLink = document.createElement("a");
      downloadLink.download = `qr-${url.short_code}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  return (
    <Card className="p-4 space-y-3 hover:shadow-glow transition-shadow">
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{url.original_url}</p>
            <a
              href={shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              {shortUrl}
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          {url.is_custom && (
            <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded">
              Custom
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{url.clicks} clicks</span>
          <span>•</span>
          <span>{new Date(url.created_at).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={handleCopy} className="flex-1">
          <Copy className="h-4 w-4 mr-1" />
          Copy
        </Button>

        <Dialog open={showQR} onOpenChange={setShowQR}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="flex-1">
              <QrCodeIcon className="h-4 w-4 mr-1" />
              QR
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>QR Code</DialogTitle>
              <DialogDescription>
                Scan this code to visit {shortUrl}
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center space-y-4">
              <div className="bg-white p-4 rounded-lg">
                <QRCodeSVG
                  id={`qr-${url.id}`}
                  value={shortUrl}
                  size={256}
                  level="H"
                  includeMargin={true}
                />
              </div>
              <Button onClick={handleDownloadQR} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Download QR Code
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete(url.id)}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};
