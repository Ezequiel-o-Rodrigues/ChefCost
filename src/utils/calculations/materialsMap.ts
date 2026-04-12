/**
 * Helper para converter array de materiais em mapa indexado por ID
 */

import { Material } from '../../types';

export const toMaterialsMap = (materials: Material[]): Record<string, Material> =>
  materials.reduce((acc, m) => ({ ...acc, [m.id!]: m }), {});
