import { Material } from '../types';

export const toMaterialsMap = (materials: Material[]): Record<string, Material> =>
  materials.reduce((acc, m) => ({ ...acc, [m.id!]: m }), {});

export const calcPricePerMinUnit = (pricePaid: number, packageQty: number, unit: string): number => {
  const totalMinUnits = unit === 'kg' || unit === 'L' ? packageQty * 1000 : packageQty;
  return pricePaid / totalMinUnits;
};
