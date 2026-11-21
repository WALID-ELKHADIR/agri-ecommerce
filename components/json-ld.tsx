import { jsonLdScript } from "@/lib/seo";

/** Données structurées schema.org, lues par Google (contenu échappé, voir lib/seo.ts). */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(data) }} />;
}
