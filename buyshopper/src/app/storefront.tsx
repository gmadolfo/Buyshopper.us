"use client";

import { useEffect, useMemo, useState } from "react";
import type { CatalogSource, Product } from "@/lib/catalog/types";

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 });

function Icon({ name, size = 20 }: { name: "search" | "bag" | "arrow" | "close" | "plus" | "minus" | "heart" | "spark"; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true as const };
  if (name === "search") return <svg {...common}><circle cx="10.8" cy="10.8" r="6.5"/><path d="m16 16 4.2 4.2"/></svg>;
  if (name === "bag") return <svg {...common}><path d="M5 8h14l1 12H4L5 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/></svg>;
  if (name === "arrow") return <svg {...common}><path d="M5 12h14M13 6l6 6-6 6"/></svg>;
  if (name === "close") return <svg {...common}><path d="m6 6 12 12M18 6 6 18"/></svg>;
  if (name === "plus") return <svg {...common}><path d="M12 5v14M5 12h14"/></svg>;
  if (name === "minus") return <svg {...common}><path d="M5 12h14"/></svg>;
  if (name === "heart") return <svg {...common}><path d="M20.8 8.7c0 4.2-8.8 10-8.8 10s-8.8-5.8-8.8-10A4.7 4.7 0 0 1 12 6.1a4.7 4.7 0 0 1 8.8 2.6Z"/></svg>;
  return <svg {...common}><path d="m12 3 1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3Z"/><path d="m19 15 .9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15Z"/></svg>;
}

function ProductPhoto({ product, className = "" }: { product: Product; className?: string }) {
  return <div className={`product-photo ${className}`} style={{ backgroundColor: product.color, backgroundImage: `url("${product.imageUrl}")` }} role="img" aria-label={product.name} />;
}

export default function Storefront({ products, catalogSource }: { products: Product[]; catalogSource: CatalogSource }) {
  const [category, setCategory] = useState("All finds");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("featured");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [cartLoaded, setCartLoaded] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [selected, setSelected] = useState<Product | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);

  const categories = useMemo(
    () => ["All finds", ...new Set(products.map((product) => product.category))],
    [products],
  );

  useEffect(() => {
    try {
      const saved = localStorage.getItem("buyshopper-cart");
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          const validIds = new Set(products.map((product) => product.id));
          const restored = Object.fromEntries(
            Object.entries(parsed).filter(([id, quantity]) =>
              validIds.has(id) && typeof quantity === "number" && Number.isSafeInteger(quantity) && quantity > 0,
            ),
          ) as Record<string, number>;
          // eslint-disable-next-line react-hooks/set-state-in-effect -- Restore persisted client-only cart state after hydration.
          setCart(restored);
        }
      }
    } catch { /* Ignore invalid local demo data. */ }
    setCartLoaded(true);
  }, [products]);

  useEffect(() => {
    if (!cartLoaded) return;
    localStorage.setItem("buyshopper-cart", JSON.stringify(cart));
  }, [cart, cartLoaded]);

  const visibleProducts = useMemo(() => {
    const matching = products.filter((product) => {
      const matchesCategory = category === "All finds" || product.category === category;
      const matchesSearch = `${product.name} ${product.category}`.toLowerCase().includes(query.toLowerCase().trim());
      return matchesCategory && matchesSearch;
    });
    if (sort === "price-low") matching.sort((a, b) => a.price - b.price);
    if (sort === "price-high") matching.sort((a, b) => b.price - a.price);
    if (sort === "top-rated") matching.sort((a, b) => b.rating - a.rating);
    return matching;
  }, [category, products, query, sort]);

  const cartCount = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);
  const cartItems = products.filter((product) => cart[product.id]);
  const subtotal = cartItems.reduce((sum, product) => sum + product.price * cart[product.id], 0);
  const addToCart = (id: string) => setCart((current) => ({ ...current, [id]: (current[id] ?? 0) + 1 }));
  const changeQuantity = (id: string, change: number) => setCart((current) => {
    const next = { ...current, [id]: (current[id] ?? 0) + change };
    if (next[id] <= 0) delete next[id];
    return next;
  });

  return (
    <main>
      <div className="announcement">A little something extra: free shipping on orders over $75 <span>✳</span></div>
      <header className="site-header">
        <a className="wordmark" href="#home" aria-label="BuyShopper home">buyshopper<span>.</span></a>
        <nav className="desktop-nav" aria-label="Main navigation"><a href="#shop">Shop all</a><a href="#shop" onClick={() => setCategory("Home")}>Home goods</a><a href="#shop" onClick={() => setCategory("Style")}>Style</a><a href="#story">Our story</a></nav>
        <div className="header-actions">
          <label className="header-search"><Icon name="search" size={18}/><input aria-label="Search products" placeholder="Search anything..." value={query} onChange={(event) => { setQuery(event.target.value); document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" }); }}/></label>
          <button className="icon-button bag-button" aria-label={`Open shopping bag, ${cartCount} items`} onClick={() => setCartOpen(true)}><Icon name="bag"/><span className="bag-count">{cartCount}</span></button>
        </div>
      </header>

      <section className="hero" id="home">
        <div className="hero-copy"><span className="eyebrow"><Icon name="spark" size={15}/> GOOD THINGS, FOUND</span><h1>Find your<br/>kind of <em>everyday.</em></h1><p>Little upgrades, thoughtful essentials, and just-because treats. Curated for the life you actually live.</p><a className="button button-dark" href="#shop">Shop the collection <Icon name="arrow" size={17}/></a><div className="hero-note"><span className="note-avatars"><i>A</i><i>M</i><i>J</i></span><span>Loved by 2,400+ happy finders</span><span className="note-stars">★★★★★</span></div></div>
        <div className="hero-art"><div className="hero-image" role="img" aria-label="Warm and thoughtfully curated everyday essentials"/><div className="floating-note"><span>THE LITTLE THINGS</span><strong>Make your day.</strong><Icon name="spark" size={18}/></div><div className="hero-index">01 <span>—</span> EVERYDAY EDIT</div></div>
        <div className="hero-side-label">THOUGHTFUL FINDS FOR EVERY KIND OF DAY</div>
      </section>

      <div className="trust-strip"><span>✳&nbsp; Curated with care</span><span>♧&nbsp; Better everyday basics</span><span>♡&nbsp; Small joys, big energy</span><span>↗&nbsp; Made for real life</span></div>

      <section className="shop-section" id="shop">
        <div className="section-heading"><div><span className="eyebrow">THE GOOD STUFF</span><h2>A few of our <em>favorites.</em></h2></div><p>Useful, lovely, and worth the little splurge.<br/>Meet your new everyday things.</p></div>
        <div className="shop-toolbar"><div className="category-list" role="tablist" aria-label="Filter by category">{categories.map((item) => <button key={item} role="tab" aria-selected={category === item} className={category === item ? "category-pill active" : "category-pill"} onClick={() => setCategory(item)}>{item}</button>)}</div><label className="sort-control">Sort by <select aria-label="Sort products" value={sort} onChange={(event) => setSort(event.target.value)}><option value="featured">Featured</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="top-rated">Top rated</option></select></label></div>
        <div className="product-grid">{visibleProducts.map((product) => <article className="product-card" key={product.id}><div className="product-image-wrap"><button className="photo-open" aria-label={`View ${product.name}`} onClick={() => setSelected(product)}><ProductPhoto product={product}/></button>{product.badge && <span className={`product-badge ${product.badge === "LOW STOCK" ? "badge-light" : ""}`}>{product.badge}</span>}<button className={`favorite-button ${favorites.includes(product.id) ? "is-favorite" : ""}`} aria-label={favorites.includes(product.id) ? "Remove from favorites" : "Add to favorites"} onClick={() => setFavorites((current) => current.includes(product.id) ? current.filter((id) => id !== product.id) : [...current, product.id])}><Icon name="heart" size={18}/></button><button className="quick-add" onClick={() => addToCart(product.id)}>Quick add <Icon name="plus" size={15}/></button></div><div className="product-info"><div className="product-title-row"><button className="product-name" onClick={() => setSelected(product)}>{product.name}</button><span className="product-price">{money.format(product.price)}</span></div><div className="product-meta"><span>{product.category}</span><span><b>★</b> {product.rating} <i>({product.reviews})</i></span></div></div></article>)}</div>
        {visibleProducts.length === 0 && <div className="empty-results"><Icon name="search" size={25}/><h3>No little treasures found.</h3><p>Try another search or category.</p><button onClick={() => { setQuery(""); setCategory("All finds"); }}>Clear filters</button></div>}
        <div className="sample-disclaimer">{catalogSource === "supabase" ? "Catalog source: Supabase. Seed products and commercial details are illustrative; cart and checkout remain demo-only." : "Demo catalog: Supabase is not configured or unavailable. Products, prices, reviews, and availability are illustrative."}</div>
      </section>

      <section className="editorial" id="story"><div className="editorial-image" role="img" aria-label="A calm, considered home interior"/><div className="editorial-copy"><span className="eyebrow">A SMALLER, HAPPIER WAY TO SHOP</span><h2>Less scrolling.<br/>More <em>“oh, I love this.”</em></h2><p>We believe the best finds don’t need a hard sell. Just good things, picked with intention, that make the everyday feel a little more yours.</p><a href="#shop" className="text-link">A little more about us <Icon name="arrow" size={16}/></a></div></section>

      <section className="newsletter"><span className="eyebrow">A GOOD EMAIL, ONCE IN A WHILE</span><h2>Come find the <em>good stuff.</em></h2><p>New finds, little perks, no inbox clutter. Promise.</p><form onSubmit={(event) => { event.preventDefault(); const form = event.currentTarget; form.reset(); alert("Thanks for joining the BuyShopper demo list!"); }}><label className="sr-only" htmlFor="email">Your email address</label><input id="email" type="email" required placeholder="Your email address"/><button className="button button-dark" type="submit">Count me in <Icon name="arrow" size={16}/></button></form><small>By subscribing, you agree to receive occasional emails. Unsubscribe anytime.</small></section>

      <footer className="site-footer"><a className="wordmark" href="#home">buyshopper<span>.</span></a><span>Find your kind of everyday.</span><div><a href="#shop">Shop</a><a href="#story">Our story</a><a href="mailto:hello@buyshopper.example">Say hello</a></div><small>© 2026 BuyShopper. A demo storefront.</small></footer>

      {cartOpen && <div className="overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) setCartOpen(false); }}><aside className="cart-drawer" aria-label="Shopping bag"><div className="drawer-heading"><div><span className="eyebrow">YOUR GOOD FINDS</span><h2>Your bag <span>({cartCount})</span></h2></div><button className="icon-button" aria-label="Close shopping bag" onClick={() => setCartOpen(false)}><Icon name="close"/></button></div>{cartItems.length ? <><div className="cart-lines">{cartItems.map((product) => <div className="cart-line" key={product.id}><ProductPhoto product={product}/><div className="cart-line-info"><strong>{product.name}</strong><span>{money.format(product.price)}</span><div className="quantity-control"><button aria-label={`Remove one ${product.name}`} onClick={() => changeQuantity(product.id, -1)}><Icon name="minus" size={13}/></button><span>{cart[product.id]}</span><button aria-label={`Add one ${product.name}`} onClick={() => changeQuantity(product.id, 1)}><Icon name="plus" size={13}/></button></div></div><span className="line-total">{money.format(product.price * cart[product.id])}</span></div>)}</div><div className="cart-footer"><div className="subtotal"><span>Subtotal</span><strong>{money.format(subtotal)}</strong></div><p>Shipping and taxes calculated at checkout.</p><button className="button button-dark checkout-button" onClick={() => alert("Demo checkout only — no payment will be collected.")}>Continue to checkout <Icon name="arrow" size={16}/></button><small>Demo checkout · No payment is collected</small></div></> : <div className="cart-empty"><div className="empty-bag"><Icon name="bag" size={28}/></div><h3>Your bag is taking a little break.</h3><p>Let’s find something lovely for it.</p><button className="button button-dark" onClick={() => { setCartOpen(false); document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" }); }}>Explore the finds <Icon name="arrow" size={16}/></button></div>}</aside></div>}

      {selected && <div className="overlay modal-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null); }}><section className="product-modal" aria-label={`${selected.name} details`}><button className="icon-button modal-close" aria-label="Close product details" onClick={() => setSelected(null)}><Icon name="close"/></button><ProductPhoto product={selected} className="modal-photo"/><div className="modal-info"><span className="eyebrow">{selected.category.toUpperCase()} · A GOOD FIND</span><h2>{selected.name}</h2><div className="modal-rating"><b>★</b> {selected.rating} <span>({selected.reviews} happy finders)</span></div><strong className="modal-price">{money.format(selected.price)} {selected.previousPrice && <del>{money.format(selected.previousPrice)}</del>}</strong><p>{selected.description}</p><div className="sample-disclaimer">Illustrative demo product. Availability and details are not connected to live inventory.</div><button className="button button-dark modal-add" onClick={() => { addToCart(selected.id); setSelected(null); setCartOpen(true); }}>Add to bag <Icon name="bag" size={17}/></button></div></section></div>}
    </main>
  );
}
