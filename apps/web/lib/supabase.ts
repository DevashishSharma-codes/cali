import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rlgtrbfnfhashapobope.supabase.co';
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_PKbOkYe0nxuICb2e1-ZQ1Q_ZdC2jFPB';

export const supabase = createClient(supabaseUrl, supabaseKey);

export function fileToDataUrl(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

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
      console.warn('Supabase storage upload failed (check RLS policies on bucket "cali"):', error.message);
      // Fallback to data URL so the user can continue drawing without blockage
      return await fileToDataUrl(file);
    }

    const { data: publicUrlData } = supabase.storage
      .from('cali')
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  } catch (err) {
    console.error('Unexpected error uploading image, falling back to local data URL:', err);
    try {
      return await fileToDataUrl(file);
    } catch {
      return null;
    }
  }
}

export async function deleteImageFromSupabase(src: string): Promise<boolean> {
  try {
    if (!src || !src.includes('/storage/v1/object/public/cali/')) {
      return false;
    }
    const parts = src.split('/storage/v1/object/public/cali/');
    const filePath = parts[1];
    if (!filePath) return false;

    const { error } = await supabase.storage
      .from('cali')
      .remove([decodeURIComponent(filePath)]);

    if (error) {
      console.warn('Error deleting image from Supabase bucket:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed to delete image from Supabase:', err);
    return false;
  }
}
