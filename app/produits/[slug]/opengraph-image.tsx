/* eslint-disable @next/next/no-img-element -- ImageResponse (Satori) ne rend que des <img>, pas next/image. */
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { BRAND_COLORS, logoSvgDocument } from "@/lib/brand/logo-svg";
import { getProductBySlug } from "@/lib/catalog-data";
import { siteConfig } from "@/lib/site-config";

export const alt = `Produit ${siteConfig.name} — devis gratuit sur WhatsApp`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = { params: Promise<{ slug: string }> };

/**
 * Photo du produit en PNG (data URL) : le moteur des images de partage ne lit
 * pas le WebP. Conversion par sharp, déjà installé avec Next (optimisation des
 * images) ; s'il manque, l'image de partage est générée sans photo.
 */
async function productPhoto(src: string): Promise<string | null> {
  try {
    const input = src.startsWith("/")
      ? await readFile(join(process.cwd(), "public", src))
      : await fetch(src).then(async (response) => (response.ok ? Buffer.from(await response.arrayBuffer()) : null));
    if (!input) return null;
    const { default: sharp } = await import("sharp");
    const png = await sharp(input).resize(460, 460, { fit: "contain", background: "#ffffff" }).png().toBuffer();
    return `data:image/png;base64,${png.toString("base64")}`;
  } catch {
    return null;
  }
}

/** Image de partage d'une fiche (WhatsApp, Facebook) : photo, nom, gamme et logo. */
export default async function ProductOpenGraphImage({ params }: Props) {
  const { slug } = await params;
  const [product, bricolageBold] = await Promise.all([
    getProductBySlug(slug),
    readFile(join(process.cwd(), "assets/fonts/BricolageGrotesque-Bold.ttf")),
  ]);
  const logo = `data:image/svg+xml;base64,${Buffer.from(
    logoSvgDocument({ variant: "full", pixelWidth: 260, maskId: "og-product-logo" }),
  ).toString("base64")}`;
  const photo = product && !product.imagePlaceholder ? await productPhoto(product.image) : null;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          backgroundColor: BRAND_COLORS.soil50,
          fontFamily: "Bricolage Grotesque",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "64px 56px 64px 72px", width: 640 }}>
          <img src={logo} width={260} height={77} alt="" />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 26, color: BRAND_COLORS.field600 }}>{product?.categoryLabel ?? siteConfig.tagline}</div>
            <div style={{ marginTop: 16, fontSize: 60, lineHeight: 1.05, color: BRAND_COLORS.soil900 }}>
              {product?.name ?? siteConfig.slogan}
            </div>
          </div>
          <div style={{ fontSize: 26, color: "#6b6352" }}>Devis gratuit sur WhatsApp</div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 560,
            height: "100%",
            backgroundColor: BRAND_COLORS.white,
          }}
        >
          {photo ? <img src={photo} width={460} height={460} alt="" style={{ objectFit: "contain" }} /> : null}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Bricolage Grotesque", data: bricolageBold, style: "normal", weight: 700 }],
    },
  );
}
