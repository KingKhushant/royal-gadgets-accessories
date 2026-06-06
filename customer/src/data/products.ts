import {
  LucideIcon,
} from "lucide-react";


export interface Product {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  stock?: number;
  description?: string;
  rating?: number;
  reviewsCount?: number;
  isFlashSale?: boolean;
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
}

type Category = {
  slug: string;
  icon: LucideIcon;
};
