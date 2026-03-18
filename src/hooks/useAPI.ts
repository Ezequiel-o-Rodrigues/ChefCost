import { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { Material, Recipe, Conversion, AppSettings } from '../types';

const API_BASE = 'http://localhost:3001/api';

export const useAPI = () => {
  const [user, setUser] = useState(auth.currentUser);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [conversions, setConversions] = useState<Conversion[]>([]);
  const [settings, setSettings] = useState<AppSettings>({ hourlyRate: 25, energyRate: 5 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (!user) {
        setMaterials([]);
        setRecipes([]);
        setConversions([]);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const fetchData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const [materialsRes, recipesRes, conversionsRes, settingsRes] = await Promise.all([
        fetch(`${API_BASE}/materials/${user.uid}`),
        fetch(`${API_BASE}/recipes/${user.uid}`),
        fetch(`${API_BASE}/conversions/${user.uid}`),
        fetch(`${API_BASE}/settings/${user.uid}`)
      ]);

      const materialsData = await materialsRes.json();
      const recipesData = await recipesRes.json();
      const conversionsData = await conversionsRes.json();
      const settingsData = await settingsRes.json();

      setMaterials(materialsData);
      setRecipes(recipesData);
      setConversions(conversionsData);
      setSettings(settingsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const addMaterial = async (material: Omit<Material, 'id' | 'userId' | 'pricePerMinUnit'>) => {
    if (!user) return;
    
    const totalMinUnits = material.unit === 'kg' || material.unit === 'L' 
      ? material.packageQty * 1000 
      : material.packageQty;
    
    const pricePerMinUnit = material.pricePaid / totalMinUnits;

    await fetch(`${API_BASE}/materials`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...material, pricePerMinUnit, userId: user.uid })
    });
    fetchData();
  };

  const updateMaterial = async (id: string, material: Partial<Material>) => {
    await fetch(`${API_BASE}/materials/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(material)
    });
    fetchData();
  };

  const deleteMaterial = async (id: string) => {
    await fetch(`${API_BASE}/materials/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const addRecipe = async (recipe: Omit<Recipe, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return;
    await fetch(`${API_BASE}/recipes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...recipe, userId: user.uid })
    });
    fetchData();
  };

  const updateRecipe = async (id: string, recipe: Partial<Recipe>) => {
    await fetch(`${API_BASE}/recipes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(recipe)
    });
    fetchData();
  };

  const deleteRecipe = async (id: string) => {
    await fetch(`${API_BASE}/recipes/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const deleteConversion = async (id: string) => {
    await fetch(`${API_BASE}/conversions/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const addConversion = async (conversion: Omit<Conversion, 'id' | 'userId'>) => {
    if (!user) return;
    await fetch(`${API_BASE}/conversions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...conversion, userId: user.uid })
    });
    fetchData();
  };

  const updateSettings = async (settings: AppSettings) => {
    if (!user) return;
    await fetch(`${API_BASE}/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...settings, userId: user.uid })
    });
    fetchData();
  };

  return {
    user,
    materials,
    recipes,
    conversions,
    settings,
    loading,
    addMaterial,
    updateMaterial,
    deleteMaterial,
    addRecipe,
    updateRecipe,
    deleteRecipe,
    addConversion,
    updateSettings
  };
};