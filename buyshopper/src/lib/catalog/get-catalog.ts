import "server-only";

import { createClient } from "@supabase/supabase-js";
import { demoProducts } from "./demo-products";
import type { CatalogResult, Product } from "./types";

type CatalogRow = {
  id: string;
  name: string;
  description: string;
  price: string | number;
  compare_at_price: string | number | null;
  color: string;
  image_url: string;
  badge: string | null;
  rating: string | number;
  review_count: number;
  category: string;
};

function demoCatalog(): CatalogResult {
  return { products: demoProducts, source: "demo" };
}

function safeImageUrl(value: string): string | null {
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}

function toProduct(row: CatalogRow): Product | null {
  const imageUrl = safeImageUrl(row.image_url);
  if (!imageUrl || !row.category) return null;

  return {
    id: row.id,
    name: row.name,
    category: row.category,
    description: row.description,
    price: Number(row.price),
    ...(row.compare_at_price === null
      ? {}
      : { previousPrice: Number(row.compare_at_price) }),
    color: row.color,
    imageUrl,
    ...(row.badge ? { badge: row.badge } : {}),
    rating: Number(row.rating),
    reviews: row.review_count,
  };
}

export async function getCatalog(): Promise<CatalogResult> {
  const supabaseUrl = process.env.SUPABASE_URL?.trim();
  const supabasePublishableKey = process.env.SUPABASE_PUBLISHABLE_KEY?.trim();

  if (!supabaseUrl || !supabasePublishableKey) return demoCatalog();

  try {
    const supabase = createClient(supabaseUrl, supabasePublishableKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await supabase
      .from("storefront_catalog")
      .select(
        "id, name, category, description, price, compare_at_price, color, image_url, badge, rating, review_count",
      )
      .order("name")
      .limit(250);

    if (error || !data) {
      console.warn("Supabase catalog is unavailable; showing the labeled demo catalog.");
      return demoCatalog();
    }

    const products = (data as unknown as CatalogRow[])
      .map(toProduct)
      .filter((product): product is Product => product !== null);

    return { products, source: "supabase" };
  } catch {
    console.warn("Supabase catalog is unavailable; showing the labeled demo catalog.");
    return demoCatalog();
  }
}
