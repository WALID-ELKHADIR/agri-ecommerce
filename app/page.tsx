import { HomePage } from "@/components/home-page";
import { getCatalog } from "@/lib/catalog-data";

export default async function Page() {
  const { products } = await getCatalog();

  return <HomePage products={products} />;
}
