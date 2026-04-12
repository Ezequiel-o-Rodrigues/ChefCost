/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  setDoc,
  getDoc,
  orderBy
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Material, Recipe, Conversion, AppSettings } from '../types';
import { calcPricePerMinUnit } from '../utils/materialUtils';

export const useFirebase = () => {
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

  useEffect(() => {
    if (!user) return;

    setLoading(true);

    // Materials
    const qMaterials = query(collection(db, 'materials'), where('userId', '==', user.uid));
    const unsubscribeMaterials = onSnapshot(qMaterials, (snapshot) => {
      setMaterials(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Material)));
    });

    // Recipes
    const qRecipes = query(collection(db, 'recipes'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
    const unsubscribeRecipes = onSnapshot(qRecipes, (snapshot) => {
      setRecipes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Recipe)));
    });

    // Conversions
    const qConversions = query(collection(db, 'conversions'), where('userId', '==', user.uid));
    const unsubscribeConversions = onSnapshot(qConversions, (snapshot) => {
      setConversions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Conversion)));
    });

    // Settings
    const unsubscribeSettings = onSnapshot(doc(db, 'settings', user.uid), (doc) => {
      if (doc.exists()) {
        setSettings(doc.data() as AppSettings);
      }
      setLoading(false);
    });

    return () => {
      unsubscribeMaterials();
      unsubscribeRecipes();
      unsubscribeConversions();
      unsubscribeSettings();
    };
  }, [user]);

  const addMaterial = async (material: Omit<Material, 'id' | 'userId' | 'pricePerMinUnit'>) => {
    if (!user) return;
    
    const pricePerMinUnit = calcPricePerMinUnit(material.pricePaid, material.packageQty, material.unit);

    await addDoc(collection(db, 'materials'), {
      ...material,
      pricePerMinUnit,
      userId: user.uid
    });
  };

  const deleteMaterial = async (id: string) => {
    await deleteDoc(doc(db, 'materials', id));
  };

  const addRecipe = async (recipe: Omit<Recipe, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return;
    await addDoc(collection(db, 'recipes'), {
      ...recipe,
      userId: user.uid,
      createdAt: Date.now()
    });
  };

  const deleteRecipe = async (id: string) => {
    await deleteDoc(doc(db, 'recipes', id));
  };

  const addConversion = async (conversion: Omit<Conversion, 'id' | 'userId'>) => {
    if (!user) return;
    await addDoc(collection(db, 'conversions'), {
      ...conversion,
      userId: user.uid
    });
  };

  const deleteConversion = async (id: string) => {
    await deleteDoc(doc(db, 'conversions', id));
  };

  const updateSettings = async (newSettings: AppSettings) => {
    if (!user) return;
    await setDoc(doc(db, 'settings', user.uid), {
      ...newSettings,
      userId: user.uid
    });
  };

  return {
    user,
    materials,
    recipes,
    conversions,
    settings,
    loading,
    addMaterial,
    deleteMaterial,
    addRecipe,
    deleteRecipe,
    addConversion,
    deleteConversion,
    updateSettings
  };
};
