import React, { useEffect, useRef } from 'react';
import { UserLocation } from '../types';

interface MapProps {
  userLocation: UserLocation;
  otherLocations?: UserLocation[];
  showRoute?: boolean;
}

const Map: React.FC<MapProps> = ({ userLocation, otherLocations = [], showRoute = false }) => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // In a real application, you would initialize a map library here
    // such as Google Maps, Mapbox, or Leaflet
    
    // For this example, we'll just display the coordinates
    if (mapRef.current) {
      const mapElement = mapRef.current;
      mapElement.innerHTML = `
        <div class="p-4 bg-white rounded-lg shadow">
          <h3 class="font-bold text-lg mb-2">Current Location</h3>
          <p>Latitude: ${userLocation.latitude.toFixed(6)}</p>
          <p>Longitude: ${userLocation.longitude.toFixed(6)}</p>
          <p>Accuracy: ${userLocation.accuracy ? `${userLocation.accuracy.toFixed(1)} meters` : 'Unknown'}</p>
          <p>Last Updated: ${new Date(userLocation.timestamp).toLocaleTimeString()}</p>
        </div>
      `;

      if (otherLocations.length > 0) {
        otherLocations.forEach((location, index) => {
          const locationElement = document.createElement('div');
          locationElement.className = 'p-4 bg-white rounded-lg shadow mt-4';
          locationElement.innerHTML = `
            <h3 class="font-bold text-lg mb-2">Location ${index + 1}</h3>
            <p>Latitude: ${location.latitude.toFixed(6)}</p>
            <p>Longitude: ${location.longitude.toFixed(6)}</p>
            <p>Last Updated: ${new Date(location.timestamp).toLocaleTimeString()}</p>
          `;
          mapElement.appendChild(locationElement);
        });
      }
    }
  }, [userLocation, otherLocations, showRoute]);

  return (
    <div className="w-full h-64 md:h-96 bg-gray-200 rounded-lg overflow-hidden">
      <div ref={mapRef} className="w-full h-full p-4">
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">Loading map...</p>
        </div>
      </div>
    </div>
  );
};

export default Map;