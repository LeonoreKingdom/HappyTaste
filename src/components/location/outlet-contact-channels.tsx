import { Mail, MessageCircle, Phone } from "lucide-react";

import { mockLocationContactInfo, type LocationContactChannel } from "@/data/mock-location-contact";

const contactIcons = {
  phone: Phone,
  whatsapp: MessageCircle,
  email: Mail,
} as const;

function getContactAction(channel: LocationContactChannel) {
  const value = channel.value?.trim();

  if (!value) return null;

  if (channel.id === "phone" || channel.id === "whatsapp") {
    if (!/^\+?[\d\s().-]+$/.test(value)) return null;

    const number = value.replace(/[^\d+]/g, "");
    const digits = number.replace(/\D/g, "");

    if (!/^\+?\d{7,15}$/.test(number)) return null;

    if (channel.id === "phone") {
      return { href: `tel:${number}`, label: "Hubungi via Telepon", external: false };
    }

    if (!number.startsWith("+")) return null;

    return {
      href: `https://wa.me/${digits}`,
      label: "Buka WhatsApp",
      external: true,
    };
  }

  if (!/^[A-Z0-9._+-]+@[A-Z0-9-]+(?:\.[A-Z0-9-]+)+$/i.test(value)) return null;

  return { href: `mailto:${value}`, label: "Kirim email", external: false };
}

export function OutletContactChannels() {
  return (
    <ul className="grid gap-4 sm:grid-cols-3">
      {mockLocationContactInfo.contactChannels.map((channel) => {
        const Icon = contactIcons[channel.id];
        const action = getContactAction(channel);

        return (
          <li key={channel.id}>
            <article className="h-full rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-700">
                <Icon aria-hidden="true" className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-semibold text-stone-900">{channel.label}</h3>
              {action ? (
                <a
                  href={action.href}
                  target={action.external ? "_blank" : undefined}
                  rel={action.external ? "noopener noreferrer" : undefined}
                  className="mt-3 inline-flex items-center justify-center rounded-lg bg-orange-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-orange-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200"
                >
                  {action.label}
                </a>
              ) : (
                <p className="mt-1 text-sm leading-6 text-stone-600">{channel.unavailableMessage}</p>
              )}
            </article>
          </li>
        );
      })}
    </ul>
  );
}
