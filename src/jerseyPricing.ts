// Price list and order-item helpers shared by the jersey form and the jersey tables.
// To change a price, edit the number below and commit the file.

export const SOLO_PRICE = 525; // one piece on its own
export const PAIR_PRICE = 1000; // any two pieces together

export const SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'];

export const BATCH_KINDS = ['Batch Shirt', 'Batch Short'];
export const MOL_MMC_KINDS = ['MOL Blue Shirt', 'MMC White Shirt'];

export interface JerseyItem {
  id: string;
  kind: string; // e.g. "Batch Shirt", "MOL Blue Shirt"
  size: string; // one of SIZES
  number?: string; // optional printed number
}

export const kindsForType = (jerseyType: string): string[] =>
  jerseyType === 'batch_jersey' ? BATCH_KINDS : MOL_MMC_KINDS;

// Any two pieces make a pair. A leftover single piece is charged as a solo.
export const priceFor = (pieces: number): number =>
  Math.floor(pieces / 2) * PAIR_PRICE + (pieces % 2) * SOLO_PRICE;

export const describePieces = (pieces: number): string => {
  const pairs = Math.floor(pieces / 2);
  const solos = pieces % 2;
  const pairText = pairs === 1 ? '1 Pair' : `${pairs} Pairs`;
  if (pairs === 0) return solos === 1 ? 'Solo' : 'No pieces';
  return solos ? `${pairText} + 1 Solo` : pairText;
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
