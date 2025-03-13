import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Phone, MessageSquare, MapPin, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEmergencyStore } from '../store/emergencyStore';
import { useLocationStore } from '../store/locationStore';
import Map from '../components/Map';
import toast from 'react-hot-toast';

const AlertPage: React.FC = () => {
  const navigate = useNavigate();
  const { activeAlert, createAlert, updateAlertStatus } = useEmergencyStore();
  const { currentLocation } = useLocationStore();
  const [description, setDescription] = useState('');
  const [alertType, setAlertType] = useState<'medical' | 'fire' | 'police' | 'other'>('medical');

  useEffect(() => {
    if (!currentLocation) {
      toast.error('Location services are required for emergency alerts');
    }
  }, [currentLocation]);

  const handleSendAlert = async () => {
    if (!currentLocation) {
      toast.error('Cannot send alert without location information');
      return;
    }

    try {
      await createAlert(alertType, description);
      toast.success('Emergency alert sent successfully');
    } catch (error) {
      toast.error('Failed to send emergency alert');
    }
  };

  const handleCancelAlert = async () => {
    if (!activeAlert) return;
    
    try {
      await updateAlertStatus(activeAlert.id, 'resolved');
      toast.success('Emergency alert cancelled');
      navigate('/');
    } catch (error) {
      toast.error('Failed to cancel emergency alert');
    }
  };

  const alertTypes = [
    { id: 'medical', label: 'Medical', icon: '🚑' },
    { id: 'fire', label: 'Fire', icon: '🚒' },
    { id: 'police', label: 'Police', icon: '🚓' },
    { id: 'other', label: 'Other', icon: '🆘' },
  ];

  if (!currentLocation) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <MapPin size={48} className="text-red-600 mb-4" />
        <p className="text-gray-700 text-center">
          Waiting for location services...
          <br />
          Please enable location access to use emergency features.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-md p-6 mb-4"
      >
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <AlertTriangle className="text-red-600 mr-2" />
            {activeAlert ? 'Emergency Alert Active' : 'Send Emergency Alert'}
          </h1>
          <button
            onClick={() => navigate('/')}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        {activeAlert ? (
          <div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-800 font-medium">
                Your emergency alert is active. Help is on the way.
              </p>
              <p className="text-gray-700 mt-2">
                Alert type: {activeAlert.type.charAt(0).toUpperCase() + activeAlert.type.slice(1)}
              </p>
              {activeAlert.description && (
                <p className="text-gray-700 mt-1">
                  Description: {activeAlert.description}
                </p>
              )}
              <p className="text-gray-700 mt-1">
                Sent at: {new Date(activeAlert.created_at).toLocaleTimeString()}
              </p>
            </div>

            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Your Location</h2>
              <Map userLocation={currentLocation} />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <button className="flex items-center justify-center bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors">
                <Phone className="mr-2" size={20} />
                Call Help
              </button>
              <button className="flex items-center justify-center bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                <MessageSquare className="mr-2" size={20} />
                Message
              </button>
            </div>

            <button
              onClick={handleCancelAlert}
              className="w-full bg-red-100 text-red-700 py-3 px-4 rounded-lg font-medium hover:bg-red-200 transition-colors"
            >
              Cancel Emergency Alert
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Emergency Type</h2>
              <div className="grid grid-cols-2 gap-3">
                {alertTypes.map((type) => (
                  <button
                    key={type.id}
                    className={`py-3 px-4 rounded-lg border ${
                      alertType === type.id
                        ? 'bg-red-600 text-white border-red-600'
                        : 'bg-white border-gray-300 hover:bg-gray-50'
                    } transition-colors`}
                    onClick={() => setAlertType(type.id as any)}
                  >
                    <div className="flex items-center justify-center">
                      <span className="mr-2 text-xl">{type.icon}</span>
                      <span>{type.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Description (Optional)</h2>
              <textarea
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                rows={3}
                placeholder="Describe your emergency situation..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </div>

            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Your Location</h2>
              <Map userLocation={currentLocation} />
            </div>

            <button
              onClick={handleSendAlert}
              className="w-full bg-red-600 text-white py-4 px-6 rounded-lg font-bold text-lg hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <AlertTriangle className="mr-2" size={24} />
              Send Emergency Alert
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AlertPage;