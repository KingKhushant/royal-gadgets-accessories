import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Product = {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  description?: string;
  stock?: number;
  rating?: number;

  category:
    | string
    | {
        _id: string;
        name: string;
      };

  images?: {
    url: string;
    publicId?: string;
  }[];
};

type CartItem = { product: Product; qty: number };
type CartCtx = {
  items: CartItem[];
  add: (p: Product, qty?: number) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  count: number;
  total: number;
};

const Ctx = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("rma_cart");
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);
  useEffect(() => {
    localStorage.setItem("rma_cart", JSON.stringify(items));
  }, [items]);

  const add: CartCtx["add"] = (p, qty = 1) =>
    setItems((cur) => {
      const ex = cur.find((i) => i.product._id === p._id);
      if (ex)
        return cur.map((i) =>
          i.product._id === p._id
            ? { ...i, qty: i.qty + qty }
            : i
        );
      return [...cur, { product: p, qty }];
    });
  const remove: CartCtx["remove"] = (id) =>
    setItems((c) => c.filter((i) => i.product._id !== id));
  const setQty: CartCtx["setQty"] = (id, qty) =>
    setItems((c) =>
      c.map((i) =>
        i.product._id === id
          ? { ...i, qty: Math.max(1, qty) }
          : i
      )
    );
  const clear = () => setItems([]);
  const count = items.reduce((s, i) => s + i.qty, 0);
  const total = items.reduce((s, i) => s + i.qty * i.product.price, 0);

  return <Ctx.Provider value={{ items, add, remove, setQty, clear, count, total }}>{children}</Ctx.Provider>;
}

export const useCart = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart outside provider");
  return c;
};
