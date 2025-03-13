import React from 'react';
import { BloodType } from '../types';

interface BloodTypeSelectorProps {
  selectedType: BloodType | '';
  onChange: (type: BloodType) => void;
}

const BloodTypeSelector: React.FC<BloodTypeSelectorProps> = ({ selectedType, onChange }) => {
  const bloodTypes: BloodType[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  return (
    <div className="grid grid-cols-4 gap-2">
      {bloodTypes.map((type) => (
        <button
          key={type}
          className={`py-2 px-4 rounded-md transition-colors ${
            selectedType === type
              ? 'bg-red-600 text-white'
              : 'bg-white border border-gray-300 hover:bg-gray-100'
          }`}
          onClick={() => onChange(type)}
        >
          {type}
        </button>
      ))}
    </div>
  );
};

export default BloodTypeSelector;