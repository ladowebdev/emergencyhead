import React, { useEffect, useState } from 'react';
import { MapPin, Share2, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import Map from '../components/Map';
import { useLocationStore } from '../store/locationStore';
import { UserLocation } from '../types';
import toast from 'react-hot-toast';

const TrackingPage: React.FC = () => {
  const { currentLocation, trackingEnabled, startTracking, stopTracking } = useLocationStore();
  const [sharedWith, setSharedWith] = useState<string[]>([]);
  const [mockLocations, setMockLocations] = useState<UserLocation[]>([]);

  useEffect(() => {
    if (!trackingEnabled) {
      startTracking();
    }

    // Mock data for demonstration
    if (currentLocation) {
      const mockData: UserLocation[] = [
        {
          latitude: currentLocation.latitude + 0.001,
          longitude: currentLocation.longitude + 0.001,
          timestamp: new Date().toISOString()
        },
        {
          latitude: currentLocation.latitude - 0.002,
          longitude: currentLocation.longitude + 0.002,
          timestamp: new Date().toISOString()
        }
      ];
      setMockLocations(mockData);
    }

    return () => {
      // Don't stop tracking when leaving the page
      // as we want to keep tracking in the background
    };
  }, [currentLocation, trackingEnabled, startTracking]);

  const handleShareLocation = () => {
    // In a real app, this would open a contact picker or similar
    toast.success('Location sharing invitation sent');
    setSharedWith(['Emergency Contact 1', 'Emergency Contact 2']);
  };

  if (!currentLocation) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <MapPin size={48} className="text-red-600 mb-4" />
        <p className="text-gray-700 text-center">
          Waiting for location services...
          <br />
          Please enable location access to use tracking features.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-md p-6 mb-6"
      >
        <h1 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
          <MapPin className="text-red-600 mr-2" />
          Location Tracking
        </h1>
        
        <div className="mb-6">
          <Map userLocation={currentLocation} otherLocations={mockLocations} showRoute={true} />
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <button
            onClick={handleShareLocation}
            className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center"
          >
            <Share2 className="mr-2" size={20} />
            Share Location
          </button>
          <button
            onClick={trackingEnabled ? stopTracking : startTracking}
            className={`flex-1 py-3 px-4 rounded-lg font-medium flex items-center justify-center ${
              trackingEnabled
                ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                : 'bg-green-600 text-white hover:bg-green-700'
            } transition-colors`}
          >
            <MapPin className="mr-2" size={20} />
            {trackingEnabled ? 'Pause Tracking' : 'Resume Tracking'}
          </button>
        </div>

        {sharedWith.length > 0 && (
          <div className="border-t border-gray-200 pt-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
              <Users className="text-gray-600 mr-2" size={20} />
              Shared With
            </h2>
            <ul className="space-y-2">
              {sharedWith.map((contact, index) => (
                <li key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                  <span>{contact}</span>
                  <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                    Stop Sharing
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-4 text-sm text-gray-500">
          <p>Your location is updated in real-time and only shared with your emergency contacts.</p>
        </div>
      </motion.div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Location History</h2>
        <div className="space-y-3">
          {[...Array(3)].map((_, index) => {
            const date = new Date();
            date.setHours(date.getHours() - index);
            
            return (
              <div key={index} className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center">
                  <MapPin className="text-gray-400 mr-2" size={16} />
                  <div>
                    <p className="text-gray-800">Location update</p>
                    <p className="text-xs text-gray-500">{date.toLocaleString()}</p>
                  </div>
                </div>
                <button className="text-blue-600 hover:text-blue-800 text-sm">View</button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TrackingPage;