import type { Product } from "./types";

const unsplash = (photoId: string) =>
  `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=900&q=85`;

export const demoProducts: Product[] = [
  { id: "1", name: "Everyday Carry Bottle", category: "Lifestyle", price: 28, previousPrice: 36, rating: 4.9, reviews: 128, color: "#e4e8dd", imageUrl: unsplash("photo-1602143407151-7111542de6e8"), badge: "BESTSELLER", description: "A thoughtfully designed insulated bottle that keeps your favorite drinks at the perfect temperature, wherever the day takes you." },
  { id: "2", name: "Studio Wireless Headphones", category: "Tech", price: 89, rating: 4.8, reviews: 86, color: "#e5e0dc", imageUrl: unsplash("photo-1505740420928-5e560c06d30e"), badge: "JUST IN", description: "Rich, balanced sound and all-day comfort come together in these everyday wireless headphones." },
  { id: "3", name: "Cloud Knit Throw", category: "Home", price: 64, rating: 4.9, reviews: 54, color: "#ebe3d8", imageUrl: unsplash("photo-1600210492486-724fe5c67fb0"), description: "An extra-soft knit throw for slower mornings, cozy evenings, and everything in between." },
  { id: "4", name: "Weekend Canvas Tote", category: "Accessories", price: 42, rating: 4.7, reviews: 93, color: "#e9e4d6", imageUrl: unsplash("photo-1544816155-12df9643f363"), badge: "LOW STOCK", description: "Roomy, durable canvas with a clean silhouette made for market mornings and weekend escapes." },
  { id: "5", name: "Ceramic Pour-Over Set", category: "Home", price: 48, rating: 4.8, reviews: 71, color: "#e7ddd2", imageUrl: unsplash("photo-1495474472287-4d71bcdd2085"), description: "Make your morning ritual a little more special with a minimal ceramic pour-over set." },
  { id: "6", name: "Retro Sport Sneakers", category: "Style", price: 112, previousPrice: 140, rating: 4.9, reviews: 42, color: "#e1e4dd", imageUrl: unsplash("photo-1542291026-7eec264c27ff"), badge: "−20%", description: "A fresh take on a classic silhouette, built for comfortable everyday wear and easy styling." },
  { id: "7", name: "Pocket Digital Camera", category: "Tech", price: 138, rating: 4.6, reviews: 38, color: "#e6e2de", imageUrl: unsplash("photo-1516035069371-29a1b244cc32"), description: "A compact point-and-shoot for spontaneous moments, weekend trips, and everyday memories." },
  { id: "8", name: "Botanical Candle Set", category: "Lifestyle", price: 34, rating: 4.8, reviews: 112, color: "#e9e3da", imageUrl: unsplash("photo-1603006905003-be475563bc59"), description: "A set of clean-burning botanical candles with layered scents inspired by the natural world." },
];
