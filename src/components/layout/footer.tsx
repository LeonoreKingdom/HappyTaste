import { Utensils } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-orange-100 bg-white py-8 mt-12 text-sm text-gray-500">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 font-semibold text-gray-800">
          <Utensils className="w-4 h-4 text-orange-600" />
          <span>HappyTaste Resto</span>
        </div>
        <p className="flex items-center gap-1 text-xs">
          Dibuat dengan rasa & kelezatan untuk pecinta kuliner
        </p>
        <p className="text-xs">
          &copy; {new Date().getFullYear()} HappyTaste. Hak cipta dilindungi.
        </p>
      </div>
    </footer>
  );
}
