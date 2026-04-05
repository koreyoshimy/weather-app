import { createClient } from '@supabase/supabase-js';

// 1. Load the variables from your .env file
const supabaseUrl = import.meta.env.example.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.example.VITE_SUPABASE_ANON_KEY;

// 2. Initialize the Supabase Client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 3. Define your TypeScript Interface (Your Data Model)
export interface WeatherHistoryRecord {
  id?: string;
  created_at?: string;
  city_name: string; // Will be 'Kuala Lumpur', 'Masai', or 'Batu Pahat'
  temperature: number;
  description: string;
  humidity: number;
  wind_speed: number;
}