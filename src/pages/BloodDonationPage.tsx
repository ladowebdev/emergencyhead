import React, { useState, useEffect } from 'react';
import { Droplet, Search, MapPin, AlertCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import BloodTypeSelector from '../components/BloodTypeSelector';
import { useLocationStore } from '../store/locationStore';
import { useEmergencyStore } from '../store/emergencyStore';
import { useAuthStore } from '../store/authStore';
import { BloodType, BloodBank } from '../types';
import toast from 'react-hot-toast';

const BloodDonationPage: React.FC = () => {
  const { currentLocation } = useLocationStore();
  const { createBloodRequest, bloodRequests, fetchNearbyBloodRequests } = useEmergencyStore();
  const { user } = useAuthStore();
  
  const [activeTab, setActiveTab] = useState<'find-donors' | 'blood-banks' | 'requests' | 'history'>('find-donors');
  const [selectedBloodType, setSelectedBloodType] = useState<BloodType | ''>('');
  const [urgency, setUrgency] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [units, setUnits] = useState(1);
  const [hospital, setHospital] = useState('');
  const [description, setDescription] = useState('');
  const [searchRadius, setSearchRadius] = useState(10);
  
  // Mock data for demonstration
  const [donors, setDonors] = useState<any[]>([]);
  const [bloodBanks, setBloodBanks] = useState<BloodBank[]>([]);
  const [donationHistory, setDonationHistory] = useState<any[]>([]);

  useEffect(() => {
    fetchNearbyBloodRequests();
    
    // Mock data for demonstration
    const mockDonors = [
      { id: 1, name: 'John Doe', bloodType: 'O+', distance: 2.3, lastDonation: '2023-10-15' },
      { id: 2, name: 'Jane Smith', bloodType: 'A-', distance: 3.7, lastDonation: '2023-11-20' },
      { id: 3, name: 'Robert Johnson', bloodType: 'B+', distance: 1.5, lastDonation: '2023-09-05' },
      { id: 4, name: 'Emily Davis', bloodType: 'AB+', distance: 4.2, lastDonation: '2023-12-10' },
    ];
    
    const mockBloodBanks: BloodBank[] = [
      {
        id: '1',
        name: 'City General Hospital',
        address: '123 Main St, Cityville',
        phone: '(555) 123-4567',
        location: {
          latitude: 37.7749,
          longitude: -122.4194,
          timestamp: new Date().toISOString()
        },
        available_blood: [
          { blood_type: 'A+', units_available: 15, last_updated: new Date().toISOString() },
          { blood_type: 'O+', units_available: 8, last_updated: new Date().toISOString() },
          { blood_type: 'B-', units_available: 3, last_updated: new Date().toISOString() },
        ]
      },
      {
        id: '2',
        name: 'Community Blood Center',
        address: '456 Oak Ave, Townsburg',
        phone: '(555) 987-6543',
        location: {
          latitude: 37.7749,
          longitude: -122.4194,
          timestamp: new Date().toISOString()
        },
        available_blood: [
          { blood_type: 'A-', units_available: 5, last_updated: new Date().toISOString() },
          { blood_type: 'O-', units_available: 12, last_updated: new Date().toISOString() },
          { blood_type: 'AB+', units_available: 7, last_updated: new Date().toISOString() },
        ]
      }
    ];
    
    const mockHistory = [
      { id: 1, date: '2023-12-15', location: 'City General Hospital', units: 1 },
      { id: 2, date: '2023-09-20', location: 'Community Blood Drive', units: 1 },
      { id: 3, date: '2023-06-05', location: 'Red Cross Center', units: 1 },
    ];
    
    setDonors(mockDonors);
    setBloodBanks(mockBloodBanks);
    setDonationHistory(mockHistory);
  }, [fetchNearbyBloodRequests]);

  const handleSearch = () => {
    if (!selectedBloodType) {
      toast.error('Please select a blood type');
      return;
    }
    
    toast.success(`Searching for ${selectedBloodType} donors within ${searchRadius} km`);
    // In a real app, this would filter donors based on blood type and location
  };

  const handleCreateRequest = async () => {
    if (!selectedBloodType) {
      toast.error('Please select a blood type');
      return;
    }
    
    if (!currentLocation) {
      toast.error('Location services are required for blood requests');
      return;
    }
    
    try {
      await createBloodRequest({
        blood_type: selectedBloodType,
        units_needed: units,
        hospital_name: hospital,
        urgency,
        description
      });
      
      toast.success('Blood request created successfully');
      setSelectedBloodType('');
      setUrgency('medium');
      setUnits(1);
      setHospital('');
      setDescription('');
      setActiveTab('requests');
    } catch (error) {
      toast.error('Failed to create blood request');
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'find-donors':
        return (
          <div>
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Find Blood Donors</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Blood Type Needed
                  </label>
                  <BloodTypeSelector
                    selectedType={selectedBloodType}
                    onChange={setSelectedBloodType}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Search Radius (km)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={searchRadius}
                    onChange={(e) => setSearchRadius(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>1 km</span>
                    <span>{searchRadius} km</span>
                    <span>50 km</span>
                  </div>
                </div>
                
                <button
                  onClick={handleSearch}
                  className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center"
                >
                  <Search className="mr-2" size={20} />
                  Search for Donors
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Available Donors</h2>
              
              {donors.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No donors found matching your criteria</p>
              ) : (
                <div className="space-y-3">
                  {donors.map((donor) => (
                    <div key={donor.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900">{donor.name}</h3>
                          <div className="flex items-center mt-1 text-sm text-gray-500">
                            <MapPin size={14} className="mr-1" />
                            <span>{donor.distance} km away</span>
                          </div>
                          <div className="flex items-center mt-1 text-sm text-gray-500">
                            <Clock size={14} className="mr-1" />
                            <span>Last donation: {new Date(donor.lastDonation).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="bg-red-100 text-red-800 text-sm font-medium px-3 py-1 rounded-full">
                            {donor.bloodType}
                          </span>
                          <button className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium">
                            Contact
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="mt-6">
                <button
                  onClick={() => setActiveTab('requests')}
                  className="w-full bg-red-100 text-red-700 py-3 px-4 rounded-lg font-medium hover:bg-red-200 transition-colors"
                >
                  Create Blood Request
                </button>
              </div>
            </div>
          </div>
        );
        
      case 'blood-banks':
        return (
          <div>
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Blood Banks & Hospitals</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Filter by Blood Type
                  </label>
                  <BloodTypeSelector
                    selectedType={selectedBloodType}
                    onChange={setSelectedBloodType}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Search Radius (km)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={searchRadius}
                    onChange={(e) => setSearchRadius(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>1 km</span>
                    <span>{searchRadius} km</span>
                    <span>50 km</span>
                  </div>
                </div>
                
                <button
                  onClick={handleSearch}
                  className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center"
                >
                  <Search className="mr-2" size={20} />
                  Search Blood Banks
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Available Blood Banks</h2>
              
              {bloodBanks.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No blood banks found matching your criteria</p>
              ) : (
                <div className="space-y-4">
                  {bloodBanks.map((bank) => (
                    <div key={bank.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900">{bank.name}</h3>
                          <p className="text-sm text-gray-500 mt-1">{bank.address}</p>
                          <p className="text-sm text-gray-500 mt-1">{bank.phone}</p>
                        </div>
                        <button className="text-sm text-red-600 hover:text-red-800 font-medium">
                          Directions
                        </button>
                      </div>
                      
                      <div className="mt-3">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Available Blood Types:</h4>
                        <div className="flex flex-wrap gap-2">
                          {bank.available_blood.map((blood, index) => (
                            <div 
                              key={index} 
                              className={`text-xs px-3 py-1 rounded-full ${
                                selectedBloodType === blood.blood_type
                                  ? 'bg-red-600 text-white'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {blood.blood_type}: {blood.units_available} units
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
        
      case 'requests':
        return (
          <div>
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Create Blood Request</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Blood Type Needed
                  </label>
                  <BloodTypeSelector
                    selectedType={selectedBloodType}
                    onChange={setSelectedBloodType}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Units Needed
                  </label>
                  <div className="flex items-center">
                    <button
                      className="bg-gray-200 px-3 py-1 rounded-l-md"
                      onClick={() => setUnits(Math.max(1, units - 1))}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={units}
                      onChange={(e) => setUnits(parseInt(e.target.value) || 1)}
                      className="w-16 text-center border-y border-gray-300 py-1"
                    />
                    <button
                      className="bg-gray-200 px-3 py-1 rounded-r-md"
                      onClick={() => setUnits(units + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Urgency Level
                  </label>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value as any)}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="low">Low - Within a few days</option>
                    <option value="medium">Medium - Within 24 hours</option>
                    <option value="high">High - Within a few hours</option>
                    <option value="critical">Critical - Immediate need</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hospital/Location (Optional)
                  </label>
                  <input
                    type="text"
                    value={hospital}
                    onChange={(e) => setHospital(e.target.value)}
                    placeholder="Enter hospital or location name"
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Details (Optional)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide any additional information"
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    rows={3}
                  />
                </div>
                
                <button
                  onClick={handleCreateRequest}
                  className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center"
                >
                  <AlertCircle className="mr-2" size={20} />
                  Create Blood Request
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Active Blood Requests</h2>
              
              {bloodRequests.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No active blood requests</p>
              ) : (
                <div className="space-y-4">
                  {bloodRequests.map((request) => (
                    <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                      {/* Request details would go here */}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
        
      case 'history':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Donation History</h2>
            
            {donationHistory.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No donation history found</p>
            ) : (
              <div className="space-y-4">
                {donationHistory.map((donation) => (
                  <div key={donation.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium text-gray-900">{donation.location}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {new Date(donation.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <Droplet className="text-red-600 mr-1" size={16} />
                        <span className="text-sm font-medium text-gray-700">
                          {donation.units} unit{donation.units > 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Blood Donation</h1>
        <div className="flex space-x-2">
          {['find-donors', 'blood-banks', 'requests', 'history'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 rounded-lg font-medium ${
                activeTab === tab
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </button>
          ))}
        </div>
      </div>
      
      {renderTabContent()}
    </div>
  );
};

export default BloodDonationPage;