import {
  Car,
  Taxi,
  Bus,
  PawPrint,
  Clock,
  MapPin,
  ForkKnife,
  ShoppingBag,
  Ticket,
  Star,
  Users,
  Baby,
  Tree,
  Laptop,
  Storefront,
} from "@phosphor-icons/react/dist/ssr";

/** Iconos elegibles desde el admin para cards sin foto. */
export const BLOCK_ICONS = {
  car: { label: "Carro", Icon: Car },
  taxi: { label: "Taxi", Icon: Taxi },
  bus: { label: "Bus", Icon: Bus },
  pet: { label: "Mascota", Icon: PawPrint },
  clock: { label: "Reloj", Icon: Clock },
  pin: { label: "Ubicación", Icon: MapPin },
  food: { label: "Comida", Icon: ForkKnife },
  shopping: { label: "Compras", Icon: ShoppingBag },
  ticket: { label: "Entradas", Icon: Ticket },
  star: { label: "Estrella", Icon: Star },
  users: { label: "Personas", Icon: Users },
  kids: { label: "Niños", Icon: Baby },
  tree: { label: "Naturaleza", Icon: Tree },
  laptop: { label: "Coworking", Icon: Laptop },
  store: { label: "Tienda", Icon: Storefront },
} as const;

export type BlockIconName = keyof typeof BLOCK_ICONS;

export function BlockIcon({ name, size = 22 }: { name?: string; size?: number }) {
  const entry = name ? BLOCK_ICONS[name as BlockIconName] : undefined;
  if (!entry) return null;
  const { Icon } = entry;
  return (
    <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-palm-100 text-palm-700">
      <Icon size={size} weight="bold" />
    </span>
  );
}
