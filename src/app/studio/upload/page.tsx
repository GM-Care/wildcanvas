"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Camera, Sparkles, Shield, ArrowLeft, Check, Loader2, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import exifr from "exifr";

export default function StudioUploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Landscape");
  const [tags, setTags] = useState("landscape, high-resolution, master");
  const [pricePersonal, setPricePersonal] = useState("19");
  const [priceEditorial, setPriceEditorial] = useState("49");
  const [priceCommercial, setPriceCommercial] = useState("165");
  const [priceBuyout, setPriceBuyout] = useState("390");

  const [exif, setExif] = useState<any>({});
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    const objectUrl = URL.createObjectURL(selected);
    setPreview(objectUrl);

    // Auto-populate title if blank
    if (!title) {
      const cleanName = selected.name.replace(/\.[^/.]+$/, "").replace(/[-_]+/g, " ");
      setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }

    // Client-side EXIF inspection
    try {
      const parsed = await exifr.parse(selected, {
        pick: ["Make", "Model", "LensModel", "FNumber", "ExposureTime", "ISO", "FocalLength"],
      });
      if (parsed) {
        setExif({
          camera: [parsed.Make, parsed.Model].filter(Boolean).join(" "),
          lens: parsed.LensModel,
          aperture: parsed.FNumber ? `f/${parsed.FNumber}` : undefined,
          shutterSpeed: parsed.ExposureTime ? (parsed.ExposureTime < 1 ? `1/${Math.round(1/parsed.ExposureTime)}s` : `${parsed.ExposureTime}s`) : undefined,
          iso: parsed.ISO,
          focalLength: parsed.FocalLength ? `${Math.round(parsed.FocalLength)}mm` : undefined,
        });
      }
    } catch {
      // Ignore EXIF parse errors
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      setErrorMsg("Please provide a photo title.");
      return;
    }

    setIsUploading(true);
    setErrorMsg("");

    try {
      const formData = new FormData();
      if (file) {
        formData.append("file", file);
      }
      formData.append("title", title);
      formData.append("description", description);
      formData.append("category", category);
      formData.append("tags", JSON.stringify(tags.split(",").map((t) => t.trim())));
      formData.append("pricePersonal", pricePersonal);
      formData.append("priceEditorial", priceEditorial);
      formData.append("priceCommercial", priceCommercial);
      formData.append("priceBuyout", priceBuyout);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to publish photo.");
      }

      router.push(`/photo/${data.slug}`);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to upload photo.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 space-y-8">
      {/* Back Link */}
      <Link
        href="/studio"
        className="inline-flex items-center space-x-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Studio Dashboard</span>
      </Link>

      <div className="space-y-2">
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-amber-400">
          <Upload className="h-3.5 w-3.5" />
          <span>Upload & Ingestion Pipeline</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">
          Add Masterpiece to Storefront
        </h1>
        <p className="text-xs text-zinc-400">
          Direct ingestion to Cloudflare R2 object storage. Original RAW/JPEG files are encrypted in your private vault; web-optimized watermarked previews are deployed to the global CDN edge.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {errorMsg && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-xs text-red-400">
            {errorMsg}
          </div>
        )}

        {/* Upload Zone */}
        <div className="rounded-3xl border-2 border-dashed border-zinc-800 hover:border-amber-500/50 bg-zinc-900/40 p-8 text-center transition-colors">
          {preview ? (
            <div className="space-y-4">
              <div className="relative mx-auto max-h-80 max-w-md rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-800 shadow-xl">
                <img src={preview} alt="Upload preview" className="h-full w-full object-contain" />
              </div>
              <div className="flex items-center justify-center space-x-3">
                <label className="cursor-pointer rounded-xl bg-zinc-800 hover:bg-zinc-700 px-4 py-2 text-xs font-semibold text-white transition-colors">
                  Change Photo
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
                <span className="text-xs text-zinc-400">{file?.name}</span>
              </div>
            </div>
          ) : (
            <label className="cursor-pointer flex flex-col items-center justify-center py-8">
              <div className="h-16 w-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
                <Upload className="h-8 w-8" />
              </div>
              <span className="text-base font-bold text-white mb-1">
                Drag & Drop high-resolution photo or click to browse
              </span>
              <span className="text-xs text-zinc-400 max-w-sm">
                Supports uncompressed RAW, TIFF, PNG, and high-bitrate JPEG. EXIF camera telemetry is auto-detected.
              </span>
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>
          )}
        </div>

        {/* Detected EXIF Telemetry */}
        {exif.camera && (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-3 backdrop-blur-md">
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-amber-400">
              <Camera className="h-3.5 w-3.5" />
              <span>Detected EXIF Telemetry</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-[10px] uppercase text-zinc-500 block">Camera</span>
                <span className="font-semibold text-white">{exif.camera}</span>
              </div>
              {exif.lens && (
                <div>
                  <span className="text-[10px] uppercase text-zinc-500 block">Lens</span>
                  <span className="font-semibold text-white truncate block">{exif.lens}</span>
                </div>
              )}
              {exif.aperture && (
                <div>
                  <span className="text-[10px] uppercase text-zinc-500 block">Aperture</span>
                  <span className="font-semibold text-amber-400">{exif.aperture}</span>
                </div>
              )}
              {exif.shutterSpeed && (
                <div>
                  <span className="text-[10px] uppercase text-zinc-500 block">Shutter</span>
                  <span className="font-semibold text-white">{exif.shutterSpeed}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Metadata Details */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-md space-y-5">
          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-300">
            Catalog Details
          </h3>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                Photo Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Serengeti Cheetah at Dawn"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none"
                >
                  <option value="Wildlife">Wildlife & Nature</option>
                  <option value="Architecture">Architecture & Interior</option>
                  <option value="Landscape">Landscape & Aerial</option>
                  <option value="Portrait">Portrait & Culture</option>
                  <option value="Street">Street & Urban</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="safari, africa, predator, action"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                Artistic Description & Location
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Captured with prime telephoto optics during early morning light in..."
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Pricing & License Tiers Configurator */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-md space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-300">
              License Pricing Matrix (USD)
            </h3>
            <span className="text-[11px] text-amber-400">
              You retain 85%+ of each sale
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 space-y-2">
              <span className="text-xs font-bold text-white block">Personal / Web</span>
              <p className="text-[10px] text-zinc-400 leading-tight">Screensaver, non-commercial</p>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs text-zinc-400">$</span>
                <input
                  type="number"
                  value={pricePersonal}
                  onChange={(e) => setPricePersonal(e.target.value)}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900 pl-7 pr-3 py-1.5 text-xs font-bold text-white focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 space-y-2">
              <span className="text-xs font-bold text-white block">Editorial</span>
              <p className="text-[10px] text-zinc-400 leading-tight">Books, magazines, articles</p>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs text-zinc-400">$</span>
                <input
                  type="number"
                  value={priceEditorial}
                  onChange={(e) => setPriceEditorial(e.target.value)}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900 pl-7 pr-3 py-1.5 text-xs font-bold text-white focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 space-y-2 border-amber-500/30">
              <span className="text-xs font-bold text-amber-400 block">Commercial</span>
              <p className="text-[10px] text-zinc-400 leading-tight">Campaigns, packaging, ads</p>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs text-zinc-400">$</span>
                <input
                  type="number"
                  value={priceCommercial}
                  onChange={(e) => setPriceCommercial(e.target.value)}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900 pl-7 pr-3 py-1.5 text-xs font-bold text-white focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 space-y-2">
              <span className="text-xs font-bold text-white block">Exclusive Buyout</span>
              <p className="text-[10px] text-zinc-400 leading-tight">Full rights ownership</p>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs text-zinc-400">$</span>
                <input
                  type="number"
                  value={priceBuyout}
                  onChange={(e) => setPriceBuyout(e.target.value)}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900 pl-7 pr-3 py-1.5 text-xs font-bold text-white focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end space-x-4">
          <Link
            href="/studio"
            className="rounded-xl px-5 py-3 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={isUploading}
            className="flex items-center space-x-2 rounded-xl bg-amber-400 hover:bg-amber-300 px-6 py-3 text-xs font-bold text-zinc-950 transition-colors shadow-lg shadow-amber-500/20 disabled:opacity-50"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Ingesting to Cloudflare R2...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Publish Photo to Storefront</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
