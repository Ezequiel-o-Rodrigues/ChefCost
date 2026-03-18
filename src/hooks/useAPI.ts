import { useState, useEffect } from 'react';
import { Material, Recipe, Conversion, AppSettings } from '../types';

const API_BASE = window.location.origin + '/api';

export const useAPI = () => {
  const [user, setUser] = useState<string | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [conversions, setConversions] = useState<Conversion[]>([]);
  const [settings, setSettings] = useState<AppSettings>({ hourlyRate: 25, energyRate: 5 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    const token = localStorage.getItem('authToken');
    
    if (email && token) {
      setUser(email);
    } else {
      setLoading(false);
    }
  }, []);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  };

  const fetchData = async () => {
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) return;

    setLoading(true);
    try {
      const headers = getAuthHeaders();
      const [materialsRes, recipesRes, conversionsRes, settingsRes] = await Promise.all([
        fetch(`${API_BASE}/materials/${userEmail}`, { headers }),
        fetch(`${API_BASE}/recipes/${userEmail}`, { headers }),
        fetch(`${API_BASE}/conversions/${userEmail}`, { headers }),
        fetch(`${API_BASE}/settings/${userEmail}`, { headers })
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
    if (user) {
      fetchData();
    }
  }, [user]);

  const addMaterial = async (material: Omit<Material, 'id' | 'userId' | 'pricePerMinUnit'>) => {
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) return;
    
    const totalMinUnits = material.unit === 'kg' || material.unit === 'L' 
      ? material.packageQty * 1000 
      : material.packageQty;
    
    const pricePerMinUnit = material.pricePaid / totalMinUnits;

    await fetch(`${API_BASE}/materials`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ ...material, pricePerMinUnit })
    });
    fetchData();
  };

  const updateMaterial = async (id: string, material: Partial<Material>) => {
    await fetch(`${API_BASE}/materials/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(material)
    });
    fetchData();
  };

  const deleteMaterial = async (id: string) => {
    await fetch(`${API_BASE}/materials/${id}`, { 
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    fetchData();
  };

  const addRecipe = async (recipe: Omit<Recipe, 'id' | 'userId' | 'createdAt'>) => {
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) return;
    await fetch(`${API_BASE}/recipes`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(recipe)
    });
    fetchData();
  };

  const updateRecipe = async (id: string, recipe: Partial<Recipe>) => {
    await fetch(`${API_BASE}/recipes/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(recipe)
    });
    fetchData();
  };

  const deleteRecipe = async (id: string) => {
    await fetch(`${API_BASE}/recipes/${id}`, { 
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    fetchData();
  };

  const deleteConversion = async (id: string) => {
    await fetch(`${API_BASE}/conversions/${id}`, { 
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    fetchData();
  };

  const addConversion = async (conversion: Omit<Conversion, 'id' | 'userId'>) => {
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) return;
    await fetch(`${API_BASE}/conversions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(conversion)
    });
    fetchData();
  };

  const updateSettings = async (settings: AppSettings) => {
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) return;
    await fetch(`${API_BASE}/settings`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ ...settings, userId: userEmail })
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
    deleteConversion,
    updateSettings
  };
};