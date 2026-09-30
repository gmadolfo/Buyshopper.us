import Storefront from "./storefront";
import { getCatalog } from "@/lib/catalog/get-catalog";
import { connection } from "next/server";

export default async function Home() {
  await connection();
  const catalog = await getCatalog();
  return <Storefront products={catalog.products} catalogSource={catalog.source} />;
}
