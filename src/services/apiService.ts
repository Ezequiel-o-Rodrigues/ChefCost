import { Material, Recipe, Conversion, AppSettings } from '../types';
import { authService } from './authService';

const BASE = () => `${window.location.origin}/api`;

const req = (url: string, options?: RequestInit) =>
  fetch(url, { ...options, headers: authService.getAuthHeaders() });

export const apiService = {
  getMaterials: (email: string) => req(`${BASE()}/materials/${email}`).then(r => r.json()) as Promise<Material[]>,
  getRecipes: (email: string) => req(`${BASE()}/recipes/${email}`).then(r => r.json()) as Promise<Recipe[]>,
  getConversions: (email: string) => req(`${BASE()}/conversions/${email}`).then(r => r.json()) as Promise<Conversion[]>,
  getSettings: (email: string) => req(`${BASE()}/settings/${email}`).then(r => r.json()) as Promise<AppSettings>,

  createMaterial: (material: Omit<Material, 'id' | 'userId'>) =>
    req(`${BASE()}/materials`, { method: 'POST', body: JSON.stringify(material) }),

  deleteMaterial: (id: string) =>
    req(`${BASE()}/materials/${id}`, { method: 'DELETE' }),

  createRecipe: (recipe: Omit<Recipe, 'id' | 'userId' | 'createdAt'>) =>
    req(`${BASE()}/recipes`, { method: 'POST', body: JSON.stringify(recipe) }),

  deleteRecipe: (id: string) =>
    req(`${BASE()}/recipes/${id}`, { method: 'DELETE' }),

  createConversion: (conversion: Omit<Conversion, 'id' | 'userId'>) =>
    req(`${BASE()}/conversions`, { method: 'POST', body: JSON.stringify(conversion) }),

  deleteConversion: (id: string) =>
    req(`${BASE()}/conversions/${id}`, { method: 'DELETE' }),

  saveSettings: (settings: AppSettings) =>
    req(`${BASE()}/settings`, { method: 'POST', body: JSON.stringify(settings) }),
};
