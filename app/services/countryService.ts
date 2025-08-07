import { supabase } from "@/app/services/supabase";

export interface Country {
  id: number;
  name: string;
}

export const fetchCountries = async (): Promise<{ data: Country[] | null; error: any }> => {
  try {
    const { data, error } = await supabase
      .from('countries')
      .select('id, name')
      .order('name', { ascending: true });
    
    if (error) {
      console.error('Error fetching countries:', error);
      return { data: null, error };
    }
    
    return { data: data || [], error: null };
  } catch (err) {
    console.error('Unexpected error fetching countries:', err);
    return { data: null, error: err };
  }
};