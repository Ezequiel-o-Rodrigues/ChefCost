import { useState, useEffect } from 'react';
import { Material, Recipe, Conversion, AppSettings } from '../types';
import { apiService } from '../services/apiService';
import { calcPricePerMinUnit } from '../utils/materialUtils';

export const useAPI = (userEmail: string | null) => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [conversions, setConversions] = useState<Conversion[]>([]);
  const [settings, setSettings] = useState<AppSettings>({ hourlyRate: 25, energyRate: 5 });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [m, r, c, s] = await Promise.all([
        apiService.getMaterials(),
        apiService.getRecipes(),
        apiService.getConversions(),
        apiService.getSettings(),
      ]);
      setMaterials(Array.isArray(m) ? m : []);
      setRecipes(Array.isArray(r) ? r : []);
      setConversions(Array.isArray(c) ? c : []);
      setSettings(s?.hourlyRate !== undefined ? s : { hourlyRate: 25, energyRate: 5 });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userEmail) fetchData();
    else setLoading(false);
  }, [userEmail]);

  const addMaterial = async (material: Omit<Material, 'id' | 'userId' | 'pricePerMinUnit'>) => {
    const pricePerMinUnit = calcPricePerMinUnit(material.pricePaid, material.packageQty, material.unit);
    await apiService.createMaterial({ ...material, pricePerMinUnit });
    fetchData();
  };

  const deleteMaterial = async (id: string) => {
    await apiService.deleteMaterial(id);
    fetchData();
  };

  const addRecipe = async (recipe: Omit<Recipe, 'id' | 'userId' | 'createdAt'>) => {
    await apiService.createRecipe(recipe);
    fetchData();
  };

  const deleteRecipe = async (id: string) => {
    await apiService.deleteRecipe(id);
    fetchData();
  };

  const addConversion = async (conversion: Omit<Conversion, 'id' | 'userId'>) => {
    await apiService.createConversion(conversion);
    fetchData();
  };

  const deleteConversion = async (id: string) => {
    await apiService.deleteConversion(id);
    fetchData();
  };

  const updateSettings = async (newSettings: AppSettings) => {
    await apiService.saveSettings(newSettings);
    fetchData();
  };

  return {
    materials, recipes, conversions, settings, loading,
    addMaterial, deleteMaterial,
    addRecipe, deleteRecipe,
    addConversion, deleteConversion,
    updateSettings,
  };
};
