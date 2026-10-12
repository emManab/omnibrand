import { useEffect, useRef, useState } from "react";
import { Canvas, FabricImage, FabricText, type FabricObject } from "fabric";
import { ImagePlus, Type, Trash2 } from "lucide-react";
import { toast } from "sonner";

type Props = {
  background: string;
  accent: string;
  onExport: (png: string, json: string) => void;
};

export function DesignEditor({ background, accent, onExport }: Props) {
  const host = useRef<HTMLCanvasElement>(null);
  const canvasRef = useRef<Canvas | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [fill, setFill] = useState("#1B4DFF");
  const [text, setText] = useState("Your brand");

  useEffect(() => {
    if (!host.current) return;
    const canvas = new Canvas(host.current, {
      width: 640,
      height: 640,
      backgroundColor: accent,
      preserveObjectStacking: true,
      selection: true,
    });
    canvasRef.current = canvas;

    FabricImage.fromURL(background, { crossOrigin: "anonymous" })
      .then((img) => {
        const scale = Math.max(640 / (img.width || 640), 640 / (img.height || 640));
        img.set({
          selectable: false,
          evented: false,
          scaleX: scale,
          scaleY: scale,
          left: 0,
          top: 0,
        });
        canvas.backgroundImage = img;
        canvas.requestRenderAll();
      })
      .catch(() => {
        canvas.backgroundColor = accent;
        canvas.requestRenderAll();
      });

    const label = new FabricText("LOGO", {
      left: 220,
      top: 250,
      fontFamily: "Outfit",
      fontSize: 48,
      fill: "#ffffff",
      fontWeight: 700,
    });
    canvas.add(label);

    return () => {
      canvas.dispose();
      canvasRef.current = null;
    };
  }, [background, accent]);

  function addText() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.add(
      new FabricText(text || "Text", {
        left: 180,
        top: 180,
        fontFamily: "Outfit",
        fontSize: 36,
        fill,
        fontWeight: 600,
      }),
    );
    canvas.setActiveObject(canvas.getObjects().at(-1) as FabricObject);
    canvas.requestRenderAll();
  }

  async function onFile(file: File) {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const supportedTypes = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];
    if (!supportedTypes.includes(file.type)) {
      toast.error("Choose a PNG, JPG, WebP, or SVG logo.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Logo files must be smaller than 10 MB.");
      return;
    }

    const url = URL.createObjectURL(file);
    try {
      const img = await FabricImage.fromURL(url);
      img.scaleToWidth(180);
      img.set({ left: 220, top: 200 });
      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.requestRenderAll();
      toast.success("Logo added to your design");
    } catch {
      toast.error("This image could not be opened. Try exporting it as PNG or JPG.");
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  function recolor() {
    const canvas = canvasRef.current;
    const obj = canvas?.getActiveObject();
    if (!obj || !("set" in obj)) return;
    obj.set("fill", fill);
    canvas?.requestRenderAll();
  }

  function remove() {
    const canvas = canvasRef.current;
    const obj = canvas?.getActiveObject();
    if (obj) {
      canvas?.remove(obj);
      canvas?.requestRenderAll();
    }
  }

  function exportDesign() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const png = canvas.toDataURL({ format: "png", multiplier: 2 });
    const json = JSON.stringify(canvas.toJSON());
    onExport(png, json);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,640px)_280px]">
      <div className="overflow-auto rounded-2xl border border-line bg-paper p-3">
        <canvas ref={host} className="mx-auto max-w-full rounded-xl shadow" />
      </div>
      <aside className="space-y-4">
        <div>
          <label className="text-sm font-medium">Add text</label>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="mt-1 w-full rounded-xl border border-line px-3 py-2 text-sm"
          />
          <button
            onClick={addText}
            className="mt-2 inline-flex items-center gap-2 rounded-full bg-navy px-4 py-2 text-sm font-medium text-white"
          >
            <Type size={16} /> Place text
          </button>
        </div>
        <div>
          <label className="text-sm font-medium">Colour</label>
          <div className="mt-1 flex items-center gap-2">
            <input
              type="color"
              value={fill}
              onChange={(e) => setFill(e.target.value)}
              className="h-10 w-12 cursor-pointer rounded"
            />
            <button onClick={recolor} className="text-sm font-medium text-brand">
              Apply to selection
            </button>
          </div>
        </div>
        <div>
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void onFile(file);
            }}
          />
          <button
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-medium"
          >
            <ImagePlus size={16} /> Upload logo
          </button>
        </div>
        <p className="text-xs leading-5 text-muted">
          Drag to move. Corners resize. Select an object to recolour text or delete it.
        </p>
        <div className="flex gap-2">
          <button
            onClick={remove}
            className="inline-flex items-center gap-1 rounded-full border border-line px-3 py-2 text-sm"
          >
            <Trash2 size={15} /> Delete
          </button>
          <button
            onClick={exportDesign}
            className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white"
          >
            Save to cart
          </button>
        </div>
      </aside>
    </div>
  );
}
