import React, { useState, useEffect } from 'react';
import { Settings, User, Phone, Bell, Shield, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import BloodTypeSelector from '../components/BloodTypeSelector';
import { BloodType } from '../types';
import toast from 'react-hot-toast';

const SettingsPage: React.FC = () => {
  const { user, updateProfile, signOut } = useAuthStore();
  
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [bloodType, setBloodType] = useState<BloodType | ''>(user?.blood_type || '');
  const [isDonor, setIsDonor] = useState(user?.is_donor || false);
  const [emergencyContacts, setEmergencyContacts] = useState<{name: string; phone: string; relationship: string}[]>(
    user?.emergency_contacts || []
  );

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setPhone(user.phone || '');
      setBloodType(user.blood_type || '');
      setIsDonor(user.is_donor || false);
      setEmergencyContacts(user.emergency_contacts || []);
    }
  }, [user]);

  const handleSaveProfile = async () => {
    try {
      await updateProfile({
        full_name: fullName,
        phone,
        blood_type: bloodType || undefined,
        is_donor: isDonor
      });
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleAddContact = () => {
    setEmergencyContacts([
      ...emergencyContacts,
      { name: '', phone: '', relationship: '' }
    ]);
  };

  const handleContactChange = (index: number, field: string, value: string) => {
    const updatedContacts = [...emergencyContacts];
    updatedContacts[index] = {
      ...updatedContacts[index],
      [field]: value
    };
    setEmergencyContacts(updatedContacts);
  };

  const handleRemoveContact = (index: number) => {
    const updatedContacts = [...emergencyContacts];
    updatedContacts.splice(index, 1);
    setEmergencyContacts(updatedContacts);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Failed to log out');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-md p-6 mb-6"
      >
        <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <Settings className="text-red-600 mr-2" />
          Settings
        </h1>

        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <User className="text-gray-600 mr-2" size={20} />
              Personal Information
            </h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Blood Type
                </label>
                <BloodTypeSelector
                  selectedType={bloodType}
                  onChange={(type) => setBloodType(type)}
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isDonor"
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  checked={isDonor}
                  onChange={(e) => setIsDonor(e.target.checked)}
                />
                <label htmlFor="isDonor" className="ml-2 block text-sm text-gray-700">
                  I am willing to donate blood
                </label>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Phone className="text-gray-600 mr-2" size={20} />
              Emergency Contacts
            </h2>
            <div className="space-y-4">
              {emergencyContacts.map((contact, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">Contact #{index + 1}</h3>
                    <button
                      type="button"
                      className="text-red-600 hover:text-red-800 text-sm"
                      onClick={() => handleRemoveContact(index)}
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        value={contact.name}
                        onChange={(e) => handleContactChange(index, 'name', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone
                      </label>
                      <input
                        type="tel"
                        className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        value={contact.phone}
                        onChange={(e) => handleContactChange(index, 'phone', e.target.value)}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Relationship
                      </label>
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        value={contact.relationship}
                        onChange={(e) => handleContactChange(index, 'relationship', e.target.value)}
                        placeholder="e.g., Family, Friend, Spouse"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button
                type="button"
                className="w-full border border-gray-300 border-dashed rounded-lg p-3 text-gray-600 hover:text-gray-800 hover:border-gray-400 transition-colors"
                onClick={handleAddContact}
              >
                + Add Emergency Contact
              </button>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Bell className="text-gray-600 mr-2" size={20} />
              Notification Preferences
            </h2>
            <div className="space-y-3">
              {['Emergency alerts', 'Blood donation requests', 'System updates'].map((item, index) => (
                <div key={index} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`notification-${index}`}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    defaultChecked={true}
                  />
                  <label htmlFor={`notification-${index}`} className="ml-2 block text-sm text-gray-700">
                    {item}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Shield className="text-gray-600 mr-2" size={20} />
              Privacy & Security
            </h2>
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="locationSharing"
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  defaultChecked={true}
                />
                <label htmlFor="locationSharing" className="ml-2 block text-sm text-gray-700">
                  Allow location sharing during emergencies
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="dataUsage"
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  defaultChecked={true}
                />
                <label htmlFor="dataUsage" className="ml-2 block text-sm text-gray-700">
                  Allow anonymous data usage for service improvement
                </label>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 pt-4">
            <button
              onClick={handleSaveProfile}
              className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              Save Changes
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 bg-gray-100 text-gray-800 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center"
            >
              <LogOut size={18} className="mr-2" />
              Log Out
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SettingsPage;