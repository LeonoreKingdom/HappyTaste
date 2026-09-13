import { MenuBrowser } from "@/components/menu/menu-browser";

export const metadata = {
  title: "Jelajah Menu - HappyTaste Resto",
  description: "Jelajahi hidangan favorit HappyTaste lengkap dengan foto dan harga.",
};

export default function MenuPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
      <MenuBrowser />
    </main>
  );
}
