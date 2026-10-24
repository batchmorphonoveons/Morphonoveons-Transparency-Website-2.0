// Price list and order helpers shared by the jersey form and the jersey tables.
// To change a price, edit the number below and commit the file.

export const SOLO_PRICE = 525; // one piece on its own
export const PAIR_PRICE = 1000; // one pair

export const SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'];

export const BATCH_KINDS = ['Batch Shirt', 'Batch Short'];
export const MOL_BLUE_KIND = 'MOL Blue Shirt';
export const MMC_WHITE_KIND = 'MMC White Shirt';
export const MOL_MMC_KINDS = [MOL_BLUE_KIND, MMC_WHITE_KIND];

export interface JerseyItem {
  id: string;
  kind: string; // e.g. "Batch Shirt", "MOL Blue Shirt"
  size: string; // one of SIZES
  number?: string; // optional printed number
}

export interface OrderCounts {
  pairs: number;
  solos: number;
}

export const kindsForType = (jerseyType: string): string[] =>
  jerseyType === 'batch_jersey' ? BATCH_KINDS : MOL_MMC_KINDS;

// MOL Blue & MMC White tab: a pair is always 1 MOL Blue + 1 MMC White.
export const isPairedType = (jerseyType: string): boolean => jerseyType !== 'batch_jersey';

// The order total decides the units: total = PAIR_PRICE x pairs + SOLO_PRICE x solos.
// Returns null when the total cannot be made from pairs and solos (for example 700).
// If a total can be made more than one way, the answer with the most pairs is used.
export const solveOrder = (total: number): OrderCounts | null => {
  if (!isFinite(total) || total <= 0) return null;
  if (Math.abs(total - Math.round(total)) > 0.001) return null;
  const t = Math.round(total);
  for (let pairs = Math.floor(t / PAIR_PRICE); pairs >= 0; pairs--) {
    const rest = t - pairs * PAIR_PRICE;
    if (rest % SOLO_PRICE === 0) return { pairs, solos: rest / SOLO_PRICE };
  }
  return null;
};

export const priceForCounts = (c: OrderCounts): number => c.pairs * PAIR_PRICE + c.solos * SOLO_PRICE;

export const piecesFor = (c: OrderCounts): number => c.pairs * 2 + c.solos;

export const describeCounts = (c: OrderCounts): string => {
  const parts: string[] = [];
  if (c.pairs > 0) parts.push(c.pairs === 1 ? '1 Pair' : `${c.pairs} Pairs`);
  if (c.solos > 0) parts.push(c.solos === 1 ? '1 Solo' : `${c.solos} Solo`);
  return parts.length ? parts.join(' + ') : 'No pieces';
};

export interface SlotSpec {
  group: 'pair' | 'solo';
  label: string; // shown beside the piece, e.g. "Pair 1"
  fixedKind?: string; // set when the item is forced (MOL Blue / MMC White pairs)
}

// The piece slots an order needs: 2 per pair, 1 per solo.
export const buildSlots = (c: OrderCounts, jerseyType: string): SlotSpec[] => {
  const slots: SlotSpec[] = [];
  for (let p = 1; p <= c.pairs; p++) {
    if (isPairedType(jerseyType)) {
      slots.push({ group: 'pair', label: `Pair ${p}`, fixedKind: MOL_BLUE_KIND });
      slots.push({ group: 'pair', label: `Pair ${p}`, fixedKind: MMC_WHITE_KIND });
    } else {
      slots.push({ group: 'pair', label: `Pair ${p}` });
      slots.push({ group: 'pair', label: `Pair ${p}` });
    }
  }
  for (let s = 1; s <= c.solos; s++) slots.push({ group: 'solo', label: `Solo ${s}` });
  return slots;
};

// Older orders were saved before pieces existed, so they count as one piece.
export const getOrderItems = (order: any): JerseyItem[] => {
  if (order && Array.isArray(order.items) && order.items.length > 0) return order.items as JerseyItem[];
  return [
    {
      id: `${order?.id || 'order'}-1`,
      kind: 'Not specified',
      size: order?.jerseySize || 'L',
      number: order?.jerseyNumber,
    },
  ];
};

// Pairs and solos come from the order total. If the total does not match the pieces
// saved on the order (older orders), fall back to counting the pieces.
export const getOrderCounts = (order: any): OrderCounts => {
  const n = getOrderItems(order).length;
  const solved = solveOrder(Number(order?.unitPrice) || 0);
  if (solved && piecesFor(solved) === n) return solved;
  return { pairs: Math.floor(n / 2), solos: n % 2 };
};

export const describeOrder = (order: any): string => describeCounts(getOrderCounts(order));
