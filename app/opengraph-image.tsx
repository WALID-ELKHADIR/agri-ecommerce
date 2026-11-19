/* eslint-disable @next/next/no-img-element -- ImageResponse (Satori) ne rend que des <img>, pas next/image. */
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { BRAND_COLORS, logoSvgDocument } from "@/lib/brand/logo-svg";
import { siteConfig } from "@/lib/site-config";

export const alt = `${siteConfig.name} — ${siteConfig.slogan} ${siteConfig.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function svgDataUrl(svg: string): string {
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

export default async function OpenGraphImage() {
  const bricolageBold = await readFile(join(process.cwd(), "assets/fonts/BricolageGrotesque-Bold.ttf"));

  const logo = svgDataUrl(logoSvgDocument({ variant: "full", pixelWidth: 330, maskId: "og-logo" }));
  const symbol = svgDataUrl(logoSvgDocument({ variant: "symbol", pixelWidth: 620, maskId: "og-symbol" }));

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          backgroundColor: BRAND_COLORS.soil50,
          fontFamily: "Bricolage Grotesque",
          overflow: "hidden",
        }}
      >
        {/* Le symbole agrandi déborde à droite : la parcelle et son canal comme visuel. */}
        <img src={symbol} width={620} height={620} alt="" style={{ position: "absolute", right: -170, top: 5 }} />

        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "72px 80px" }}>
          <img src={logo} width={330} height={98} alt="" />
          <div style={{ display: "flex", flexDirection: "column", maxWidth: 640 }}>
            <div style={{ fontSize: 92, lineHeight: 1, color: BRAND_COLORS.soil900 }}>
              {siteConfig.slogan}
            </div>
            <div style={{ marginTop: 28, fontSize: 30, color: "#6b6352" }}>{siteConfig.tagline}</div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Bricolage Grotesque", data: bricolageBold, style: "normal", weight: 700 }],
    },
  );
}
