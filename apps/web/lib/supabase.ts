import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rlgtrbfnfhashapobope.supabase.co';
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_PKbOkYe0nxuICb2e1-ZQ1Q_ZdC2jFPB';

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function uploadImageToSupabase(file: File | Blob): Promise<string | null> {
  try {
    const fileExt = file instanceof File && file.name ? file.name.split('.').pop() : 'png';
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    const { data, error } = await supabase.storage
      .from('cali')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type || 'image/png',
      });

    if (error) {
      console.error('Error uploading image to Supabase:', error);
      return null;
    }

    const { data: publicUrlData } = supabase.storage
      .from('cali')
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  } catch (err) {
    console.error('Unexpected error uploading image:', err);
    return null;
  }
}
