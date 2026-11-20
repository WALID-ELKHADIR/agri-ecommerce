import { HomePage } from "@/components/home-page";
import { getCatalog } from "@/lib/catalog-data";
import { getSiteSettings } from "@/lib/site-settings";

export default async function Page() {
  const [{ products }, settings] = await Promise.all([getCatalog(), getSiteSettings()]);

  return <HomePage products={products} settings={settings} />;
}
