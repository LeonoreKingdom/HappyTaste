export const menuCategories = ["Makanan Utama", "Camilan", "Minuman"] as const;

export type MenuCategory = (typeof menuCategories)[number];

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: MenuCategory;
  image: string;
  ingredients: string[];
  portion: string;
};

export const mockMenus: MenuItem[] = [
  {
    id: "nasi-goreng-rempah",
    name: "Nasi Goreng Rempah",
    description: "Nasi goreng wangi dengan ayam suwir, telur, dan acar segar.",
    price: 42000,
    category: "Makanan Utama",
    image:
      "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=900&q=80",
    ingredients: ["Nasi", "Ayam suwir", "Telur", "Rempah pilihan"],
    portion: "1 porsi",
  },
  {
    id: "ayam-bakar-madu",
    name: "Ayam Bakar Madu",
    description: "Ayam panggang berbumbu madu dengan sambal dan lalapan.",
    price: 48000,
    category: "Makanan Utama",
    image:
      "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=80",
    ingredients: ["Ayam", "Madu", "Sambal", "Lalapan"],
    portion: "1 potong",
  },
  {
    id: "beef-burger",
    name: "Happy Beef Burger",
    description: "Patty sapi juicy, keju leleh, selada renyah, dan kentang goreng.",
    price: 52000,
    category: "Camilan",
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80",
    ingredients: ["Patty sapi", "Keju", "Selada", "Kentang"],
    portion: "1 set",
  },
  {
    id: "spaghetti-bolognese",
    name: "Spaghetti Bolognese",
    description: "Pasta al dente dengan saus tomat daging yang kaya rasa.",
    price: 47000,
    category: "Makanan Utama",
    image:
      "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=900&q=80",
    ingredients: ["Spaghetti", "Daging sapi", "Tomat", "Parmesan"],
    portion: "1 porsi",
  },
  {
    id: "caesar-salad",
    name: "Caesar Salad",
    description: "Selada segar, ayam panggang, crouton, dan dressing creamy.",
    price: 39000,
    category: "Camilan",
    image:
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80",
    ingredients: ["Selada", "Ayam panggang", "Crouton", "Dressing"],
    portion: "1 mangkuk",
  },
  {
    id: "es-kopi-susu",
    name: "Es Kopi Susu Gula Aren",
    description: "Kopi espresso, susu segar, dan manis gula aren yang lembut.",
    price: 26000,
    category: "Minuman",
    image:
      "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=900&q=80",
    ingredients: ["Espresso", "Susu segar", "Gula aren"],
    portion: "350 ml",
  },
];
