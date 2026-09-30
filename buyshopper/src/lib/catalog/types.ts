export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  previousPrice?: number;
  rating: number;
  reviews: number;
  color: string;
  imageUrl: string;
  badge?: string;
  description: string;
};

export type CatalogSource = "supabase" | "demo";

export type CatalogResult = {
  products: Product[];
  source: CatalogSource;
};
