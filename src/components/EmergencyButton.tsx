import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface EmergencyButtonProps {
  onClick: () => void;
  isActive?: boolean;
}

const EmergencyButton: React.FC<EmergencyButtonProps> = ({ onClick, isActive = false }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (isActive) {
      navigate('/alert');
    } else {
      onClick();
    }
  };

  return (
    <motion.button
      className={`w-48 h-48 md:w-64 md:h-64 rounded-full flex items-center justify-center shadow-lg ${
        isActive ? 'bg-yellow-500' : 'bg-red-600'
      } text-white font-bold text-xl md:text-2xl`}
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.05 }}
      animate={isActive ? { 
        scale: [1, 1.05, 1],
        boxShadow: [
          '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
        ]
      } : {}}
      transition={{ 
        repeat: isActive ? Infinity : 0, 
        duration: 2
      }}
      onClick={handleClick}
    >
      <div className="flex flex-col items-center justify-center">
        <AlertTriangle size={64} className="mb-2" />
        <span className="text-center">
          {isActive ? 'EMERGENCY ACTIVE' : 'EMERGENCY SOS'}
        </span>
      </div>
    </motion.button>
  );
};

export default EmergencyButton;