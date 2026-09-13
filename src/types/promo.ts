export interface Promo {
  id: string;
  title: string;
  description: string;
  type: "discount" | "free_item" | "cashback";
  value: number;
  terms: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  bannerUrl?: string;
}

export interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  link: string;
  order: number;
  isActive: boolean;
  promoId?: string;
}
