import { Material, Recipe, Conversion, AppSettings } from '../types';
import { authService } from './authService';

const BASE = () => `${window.location.origin}/api`;

const req = (url: string, options?: RequestInit) =>
  fetch(url, { ...options, headers: authService.getAuthHeaders() });

export const apiService = {
  getMaterials: () => req(`${BASE()}/materials`).then(r => r.json()) as Promise<Material[]>,
  getRecipes: () => req(`${BASE()}/recipes`).then(r => r.json()) as Promise<Recipe[]>,
  getConversions: () => req(`${BASE()}/conversions`).then(r => r.json()) as Promise<Conversion[]>,
  getSettings: () => req(`${BASE()}/settings`).then(r => r.json()) as Promise<AppSettings>,

  createMaterial: (material: Omit<Material, 'id' | 'userId'>) =>
    req(`${BASE()}/materials`, { method: 'POST', body: JSON.stringify(material) }),

  updateMaterial: (id: string, material: Omit<Material, 'id' | 'userId'>) =>
    req(`${BASE()}/materials/${id}`, { method: 'PUT', body: JSON.stringify(material) }),

  deleteMaterial: (id: string) =>
    req(`${BASE()}/materials/${id}`, { method: 'DELETE' }),

  createRecipe: (recipe: Omit<Recipe, 'id' | 'userId' | 'createdAt'>) =>
    req(`${BASE()}/recipes`, { method: 'POST', body: JSON.stringify(recipe) }),

  updateRecipe: (id: string, recipe: Omit<Recipe, 'id' | 'userId' | 'createdAt'>) =>
    req(`${BASE()}/recipes/${id}`, { method: 'PUT', body: JSON.stringify(recipe) }),

  deleteRecipe: (id: string) =>
    req(`${BASE()}/recipes/${id}`, { method: 'DELETE' }),

  createConversion: (conversion: Omit<Conversion, 'id' | 'userId'>) =>
    req(`${BASE()}/conversions`, { method: 'POST', body: JSON.stringify(conversion) }),

  deleteConversion: (id: string) =>
    req(`${BASE()}/conversions/${id}`, { method: 'DELETE' }),

  saveSettings: (settings: AppSettings) =>
    req(`${BASE()}/settings`, { method: 'POST', body: JSON.stringify(settings) }),
};
