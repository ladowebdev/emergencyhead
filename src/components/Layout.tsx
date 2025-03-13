import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './Navbar';
import { useAuthStore } from '../store/authStore';
import { useLocationStore } from '../store/locationStore';
import { useEmergencyStore } from '../store/emergencyStore';
import { useNotificationStore } from '../store/notificationStore';

const Layout: React.FC = () => {
  const { user, session, refreshUser } = useAuthStore();
  const { startTracking, stopTracking } = useLocationStore();
  const { subscribeToUpdates: subscribeToEmergencyUpdates, unsubscribeFromUpdates: unsubscribeFromEmergencyUpdates } = useEmergencyStore();
  const { subscribeToNotifications, unsubscribeFromNotifications } = useNotificationStore();
  const navigate = useNavigate();

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  useEffect(() => {
    if (session && user) {
      startTracking();
      subscribeToEmergencyUpdates();
      subscribeToNotifications();
    } else if (!session) {
      navigate('/login');
    }

    return () => {
      stopTracking();
      unsubscribeFromEmergencyUpdates();
      unsubscribeFromNotifications();
    };
  }, [session, user, startTracking, stopTracking, subscribeToEmergencyUpdates, unsubscribeFromEmergencyUpdates, subscribeToNotifications, unsubscribeFromNotifications, navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      {user && <Navbar />}
      <main className="container mx-auto px-4 py-4 pb-20">
        <Outlet />
      </main>
      <Toaster position="top-center" />
    </div>
  );
};

export default Layout;