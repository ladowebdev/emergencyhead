import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Droplet, AlertCircle, MapPin, Bell } from 'lucide-react';
import { motion } from 'framer-motion';
import EmergencyButton from '../components/EmergencyButton';
import { useEmergencyStore } from '../store/emergencyStore';
import { useAuthStore } from '../store/authStore';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { activeAlert, createAlert } = useEmergencyStore();
  const { user } = useAuthStore();

  const handleEmergencyClick = () => {
    navigate('/alert');
  };

  const features = [
    {
      icon: <AlertCircle size={32} className="text-red-600" />,
      title: 'Emergency Alerts',
      description: 'Send SOS alerts with your location in case of emergency',
      path: '/alert'
    },
    {
      icon: <Droplet size={32} className="text-red-600" />,
      title: 'Blood Donation',
      description: 'Find blood donors or request blood donations',
      path: '/blood-donation'
    },
    {
      icon: <MapPin size={32} className="text-red-600" />,
      title: 'Location Tracking',
      description: 'Share your location with emergency contacts',
      path: '/tracking'
    },
    {
      icon: <Bell size={32} className="text-red-600" />,
      title: 'Notifications',
      description: 'Stay updated with emergency alerts and responses',
      path: '/notifications'
    }
  ];

  return (
    <div className="flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome, {user?.full_name || 'User'}</h1>
        <p className="text-gray-600 max-w-md mx-auto">
          Your personal emergency response system. Press the button below in case of emergency.
        </p>
      </motion.div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="mb-12"
      >
        <EmergencyButton 
          onClick={handleEmergencyClick} 
          isActive={!!activeAlert} 
        />
      </motion.div>

      <div className="w-full max-w-4xl">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * (index + 1), duration: 0.5 }}
              className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate(feature.path)}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-4">{feature.icon}</div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">{feature.title}</h3>
                  <p className="text-gray-600 mt-1">{feature.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;