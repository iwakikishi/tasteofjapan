import { supabase } from '@/lib/supabase-client';

type Vendor = {
  name: string;
  categories: string[];
  links: { instagram: string; website: string; facebook: string; tiktok: string; x: string; youtube: string };
  images: { uri: string }[];
};

type Vendors = Vendor[];

export const fetchVendors = async (): Promise<Vendors | undefined> => {
  const { data: vendors, error } = await supabase.from('vendors').select('*');
  if (error) {
    console.error('Error fetching vendors:', error);
    return;
  }
  if (vendors) {
    return vendors;
  }
};