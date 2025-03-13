export interface User {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  blood_type?: BloodType;
  is_donor?: boolean;
  last_donation_date?: string;
  location?: UserLocation;
  emergency_contacts?: EmergencyContact[];
}

export interface EmergencyContact {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  relationship: string;
}

export interface UserLocation {
  latitude: number;
  longitude: number;
  timestamp: string;
  accuracy?: number;
}

export interface EmergencyAlert {
  id: string;
  user_id: string;
  type: 'medical' | 'fire' | 'police' | 'blood_request' | 'other';
  status: 'active' | 'responded' | 'resolved';
  location: UserLocation;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface BloodRequest {
  id: string;
  requester_id: string;
  blood_type: BloodType;
  units_needed: number;
  hospital_name?: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'fulfilled' | 'cancelled';
  location: UserLocation;
  description?: string;
  created_at: string;
  expires_at: string;
}

export interface BloodBank {
  id: string;
  name: string;
  address: string;
  phone: string;
  location: UserLocation;
  available_blood: BloodInventory[];
}

export interface BloodInventory {
  blood_type: BloodType;
  units_available: number;
  last_updated: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'alert' | 'blood_request' | 'system' | 'donation_reminder';
  read: boolean;
  created_at: string;
}

export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';