"use client";

import { useEffect, useId, useRef, useState, type DragEvent, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, ImageIcon, Star, Trash, Upload } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { computeSquareCrop, MAX_ZOOM, MIN_ZOOM, outputSize, type CropSettings } from "@/lib/admin/image-crop";
import type { ImageEntry } from "@/lib/admin/image-list";
import { cn } from "@/lib/cn";
import { getBrowserClient } from "@/lib/supabase/browser";

const BUCKET = "product-images";
const WEBP_QUALITY = 0.82;

type ManagedImage = ImageEntry & {
  key: string;
  /** Envoyée pendant cette session : supprimée tout de suite si on la retire. */
  fresh: boolean;
};

type Pending = { file: File; previewUrl: string; width: number; height: number };

type ImageManagerProps = {
  /** Nom du champ caché qui transmet la liste (JSON) à la Server Action. */
  name: string;
  initial: ImageEntry[];
  /** Dossier du bucket (ex. « produits », « categories »). */
  folder: string;
  /** Nombre maximal d'images (1 pour une catégorie). */
  max?: number;
  label?: string;
};

function key(): string {
  return crypto.randomUUID();
}

async function loadPending(file: File): Promise<Pending> {
  const bitmap = await createImageBitmap(file);
  const pending = { file, previewUrl: URL.createObjectURL(file), width: bitmap.width, height: bitmap.height };
  bitmap.close();
  return pending;
}

/** Recadre en carré et compresse en WebP (1600 px au plus), dans le navigateur. */
async function cropToWebp(pending: Pending, settings: CropSettings): Promise<Blob> {
  const bitmap = await createImageBitmap(pending.file);
  const crop = computeSquareCrop(bitmap.width, bitmap.height, settings);
  const size = outputSize(crop.size);
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas indisponible");
  context.imageSmoothingQuality = "high";
  context.drawImage(bitmap, crop.x, crop.y, crop.size, crop.size, 0, 0, size, size);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", WEBP_QUALITY));
  if (!blob || blob.type !== "image/webp") throw new Error("Ce navigateur ne sait pas produire du WebP.");
  return blob;
}

export function ImageManager({ name, initial, folder, max = 12, label = "Images" }: ImageManagerProps) {
  const toast = useToast();
  const inputId = useId();
  const fileInput = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<ManagedImage[]>(() =>
    initial.map((image) => ({ ...image, key: key(), fresh: false })),
  );
  const [queue, setQueue] = useState<Pending[]>([]);
  const [settings, setSettings] = useState<CropSettings>({ zoom: 1, x: 0, y: 0 });
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const current = queue[0] ?? null;
  const remaining = max - images.length;

  // Aperçus locaux encore en attente : libérés au démontage du composant.
  const queueRef = useRef<Pending[]>([]);
  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);
  useEffect(() => () => queueRef.current.forEach((pending) => URL.revokeObjectURL(pending.previewUrl)), []);

  // Pas d'enregistrement du formulaire pendant un envoi : l'image serait perdue.
  const root = useRef<HTMLDivElement>(null);
  const uploadingRef = useRef(false);
  useEffect(() => {
    uploadingRef.current = uploading || queue.length > 0;
  }, [uploading, queue]);
  useEffect(() => {
    const form = root.current?.closest("form");
    if (!form) return;
    const guard = (event: SubmitEvent) => {
      if (!uploadingRef.current) return;
      event.preventDefault();
      toast({ title: "Envoi de photo en cours", description: "Attendez la fin du recadrage et de l'envoi avant d'enregistrer." });
    };
    form.addEventListener("submit", guard);
    return () => form.removeEventListener("submit", guard);
  }, [toast]);

  async function addFiles(files: FileList | File[]) {
    const accepted = [...files].filter((file) => file.type.startsWith("image/"));
    if (accepted.length === 0) {
      toast({ tone: "error", title: "Format non pris en charge", description: "Choisissez une photo (JPEG, PNG ou WebP)." });
      return;
    }
    const room = Math.max(0, remaining - queue.length);
    if (room === 0) {
      toast({ tone: "error", title: `${max} image${max > 1 ? "s" : ""} au maximum`, description: "Retirez une image avant d'en ajouter." });
      return;
    }
    const results = await Promise.allSettled(accepted.slice(0, room).map(loadPending));
    const loaded = results.flatMap((result) => (result.status === "fulfilled" ? [result.value] : []));
    results.forEach((result, index) => {
      if (result.status === "rejected") {
        toast({
          tone: "error",
          title: `Photo illisible : ${accepted[index].name}`,
          description: "Enregistrez-la en JPEG ou PNG (les photos HEIC d'iPhone ne sont pas lues par tous les navigateurs).",
        });
      }
    });
    if (loaded.length === 0) return;
    setSettings({ zoom: 1, x: 0, y: 0 });
    setQueue((existing) => [...existing, ...loaded]);
  }

  async function confirmCrop() {
    if (!current) return;
    const supabase = getBrowserClient();
    if (!supabase) {
      toast({ tone: "error", title: "Supabase n'est pas configuré" });
      return;
    }
    setUploading(true);
    try {
      const blob = await cropToWebp(current, settings);
      const path = `${folder}/${crypto.randomUUID()}.webp`;
      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(path, blob, { contentType: "image/webp", cacheControl: "31536000", upsert: false });
      if (error) throw new Error(error.message);
      const url = supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
      setImages((existing) => [...existing, { url, storagePath: path, alt: "", key: key(), fresh: true }]);
      toast({ title: "Image ajoutée", description: `${Math.round(blob.size / 1024)} Ko, pensez à enregistrer.` });
    } catch (error) {
      toast({
        tone: "error",
        title: "Envoi impossible",
        description: error instanceof Error ? error.message : "Réessayez dans un instant.",
      });
    } finally {
      setUploading(false);
      skipCurrent();
    }
  }

  function skipCurrent() {
    setSettings({ zoom: 1, x: 0, y: 0 });
    setQueue((existing) => {
      if (existing[0]) URL.revokeObjectURL(existing[0].previewUrl);
      return existing.slice(1);
    });
  }

  async function remove(index: number) {
    const image = images[index];
    setImages((existing) => existing.filter((_, i) => i !== index));
    // Une image envoyée dans cette session et jamais enregistrée est supprimée
    // tout de suite ; les autres le seront à l'enregistrement du formulaire.
    if (image.fresh && image.storagePath) {
      await getBrowserClient()?.storage.from(BUCKET).remove([image.storagePath]);
    }
  }

  function move(from: number, to: number) {
    if (to < 0 || to >= images.length || from === to) return;
    setImages((existing) => {
      const next = [...existing];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragOver(false);
    if (event.dataTransfer.files.length > 0) void addFiles(event.dataTransfer.files);
  }

  const crop = current ? computeSquareCrop(current.width, current.height, settings) : null;
  const serialized = JSON.stringify(images.map(({ url, storagePath, alt }) => ({ url, storagePath, alt })));

  return (
    <div ref={root} className="grid gap-3">
      <input type="hidden" name={name} value={serialized} />
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm font-semibold text-soil-800">{label}</p>
        <p className="text-xs text-soil-500">
          {max > 1 ? "La première image est l'image principale. Glissez pour réordonner." : "Format carré, recadré à l'ajout."}
        </p>
      </div>

      {images.length > 0 ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((image, index) => (
            <li
              key={image.key}
              draggable={max > 1}
              onDragStart={() => setDragIndex(index)}
              onDragEnd={() => setDragIndex(null)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                event.stopPropagation();
                if (dragIndex !== null) move(dragIndex, index);
                setDragIndex(null);
              }}
              className={cn(
                "group overflow-hidden rounded-card border bg-white shadow-soft",
                index === 0 && max > 1 ? "border-field-400" : "border-soil-200",
                dragIndex === index && "opacity-50",
              )}
            >
              <div className="relative aspect-square bg-soil-50">
                {/* eslint-disable-next-line @next/next/no-img-element -- aperçu admin (URL Storage ou locale), pas d'optimisation utile ici */}
                <img src={image.url} alt="" className="h-full w-full object-cover" />
                {index === 0 && max > 1 ? (
                  <span className="absolute left-2 top-2 rounded-full bg-field-900 px-2 py-0.5 text-[11px] font-semibold text-white">
                    Principale
                  </span>
                ) : null}
              </div>
              <div className="grid gap-2 p-2">
                <label className="grid gap-1">
                  <span className="sr-only">Texte alternatif de l&apos;image {index + 1}</span>
                  <input
                    value={image.alt}
                    maxLength={300}
                    onChange={(event) =>
                      setImages((existing) =>
                        existing.map((item, i) => (i === index ? { ...item, alt: event.target.value } : item)),
                      )
                    }
                    placeholder="Description de l'image"
                    className="min-h-9 w-full rounded-control border border-soil-300 px-2 text-xs"
                  />
                </label>
                <div className="flex items-center justify-between gap-1">
                  {max > 1 ? (
                    <div className="flex gap-1">
                      <IconButton label="Déplacer à gauche" onClick={() => move(index, index - 1)} disabled={index === 0}>
                        <ArrowLeft className="h-4 w-4" />
                      </IconButton>
                      <IconButton
                        label="Déplacer à droite"
                        onClick={() => move(index, index + 1)}
                        disabled={index === images.length - 1}
                      >
                        <ArrowRight className="h-4 w-4" />
                      </IconButton>
                      {index > 0 ? (
                        <IconButton label="Définir comme image principale" onClick={() => move(index, 0)}>
                          <Star className="h-4 w-4" />
                        </IconButton>
                      ) : null}
                    </div>
                  ) : (
                    <span />
                  )}
                  <IconButton label="Retirer l'image" onClick={() => void remove(index)} danger>
                    <Trash className="h-4 w-4" />
                  </IconButton>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      {remaining > 0 ? (
        <div
          onDragOver={(event) => {
            event.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={cn(
            "flex flex-col items-center gap-2 rounded-card border-2 border-dashed px-4 py-6 text-center transition-colors",
            dragOver ? "border-water-600 bg-water-50" : "border-soil-300 bg-white",
          )}
        >
          <ImageIcon className="h-6 w-6 text-soil-500" />
          <p className="text-sm text-soil-700">Glissez une photo ici, ou</p>
          <label htmlFor={inputId} className="sr-only">
            Ajouter des images
          </label>
          <input
            ref={fileInput}
            id={inputId}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple={max > 1}
            className="sr-only"
            onChange={(event) => {
              if (event.target.files) void addFiles(event.target.files);
              event.target.value = "";
            }}
          />
          <Button variant="secondary" size="sm" onClick={() => fileInput.current?.click()}>
            <Upload className="h-4 w-4" />
            Choisir {max > 1 ? "des photos" : "une photo"}
          </Button>
          <p className="text-xs text-soil-500">Recadrée en carré et compressée en WebP (1600 px max) avant l&apos;envoi.</p>
        </div>
      ) : null}

      <Dialog
        open={current !== null}
        // Pendant l'envoi, Échap ne ferme pas : la photo suivante serait sautée.
        onClose={() => {
          if (!uploading) skipCurrent();
        }}
        title="Recadrer la photo"
        description="Centrez le produit dans le carré : c'est ce cadrage qui apparaîtra sur le site."
        footer={
          <>
            <Button variant="ghost" onClick={skipCurrent} disabled={uploading}>
              Annuler
            </Button>
            <Button onClick={() => void confirmCrop()} loading={uploading}>
              Recadrer et envoyer
            </Button>
          </>
        }
      >
        {current && crop ? (
          <div className="grid gap-4">
            <div className="relative mx-auto aspect-square w-full max-w-xs overflow-hidden rounded-card bg-soil-100">
              {/* eslint-disable-next-line @next/next/no-img-element -- aperçu local (blob:) du recadrage */}
              <img
                src={current.previewUrl}
                alt="Aperçu du recadrage"
                className="absolute max-w-none"
                style={{
                  width: `${(current.width / crop.size) * 100}%`,
                  left: `${(-crop.x / crop.size) * 100}%`,
                  top: `${(-crop.y / crop.size) * 100}%`,
                }}
              />
            </div>
            <Slider label="Zoom" min={MIN_ZOOM} max={MAX_ZOOM} step={0.05} value={settings.zoom}
              onChange={(zoom) => setSettings((s) => ({ ...s, zoom }))} />
            <Slider label="Gauche ↔ droite" min={-1} max={1} step={0.02} value={settings.x}
              onChange={(x) => setSettings((s) => ({ ...s, x }))} />
            <Slider label="Haut ↕ bas" min={-1} max={1} step={0.02} value={settings.y}
              onChange={(y) => setSettings((s) => ({ ...s, y }))} />
            {queue.length > 1 ? <p className="text-xs text-soil-500">Encore {queue.length - 1} photo(s) à recadrer.</p> : null}
          </div>
        ) : null}
      </Dialog>
    </div>
  );
}

function IconButton({
  label,
  onClick,
  disabled,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex h-11 w-11 items-center justify-center rounded-control text-soil-600 transition-colors hover:bg-soil-100 disabled:opacity-30 sm:h-9 sm:w-9",
        danger && "hover:bg-danger-50 hover:text-danger-700",
      )}
    >
      {children}
    </button>
  );
}

function Slider({
  label,
  min,
  max,
  step,
  value,
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
}) {
  const id = useId();
  return (
    <div className="grid gap-1">
      <label htmlFor={id} className="text-xs font-semibold text-soil-700">
        {label}
      </label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="min-h-11 w-full accent-field-600"
      />
    </div>
  );
}
