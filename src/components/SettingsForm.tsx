/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppSettings } from '../types';

interface SettingsFormProps {
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
}

export const SettingsForm: React.FC<SettingsFormProps> = ({ settings, onSave }) => {
  const [hourlyRate, setHourlyRate] = useState(settings.hourlyRate);
  const [energyRate, setEnergyRate] = useState(settings.energyRate);

  const handleSave = () => {
    onSave({ hourlyRate, energyRate });
  };

  return (
    <div className="space-y-6">
      <div className="card bg-white space-y-4">
        <h3 className="font-bold border-b border-gray-100 pb-2 text-burgundy">Custos Fixos</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <span className="text-sm font-medium">Mão de Obra (R$/hora)</span>
              <p className="text-[10px] text-gray-400">Quanto você cobra por hora de trabalho.</p>
            </div>
            <input 
              type="number" 
              value={hourlyRate}
              onChange={(e) => setHourlyRate(Number(e.target.value))}
              className="w-20 bg-creme border-none rounded-lg p-2 text-right text-burgundy font-bold" 
            />
          </div>
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <span className="text-sm font-medium">Energia/Gás (R$/hora)</span>
              <p className="text-[10px] text-gray-400">Custo estimado de luz e gás por hora.</p>
            </div>
            <input 
              type="number" 
              value={energyRate}
              onChange={(e) => setEnergyRate(Number(e.target.value))}
              className="w-20 bg-creme border-none rounded-lg p-2 text-right text-burgundy font-bold" 
            />
          </div>
        </div>
        <button 
          onClick={handleSave}
          className="w-full btn-secondary text-sm py-2"
        >
          Atualizar Custos
        </button>
      </div>
    </div>
  );
};
