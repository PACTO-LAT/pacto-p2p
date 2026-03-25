import { supabase } from '@/lib/supabase';

const RECEIPTS_BUCKET = 'receipts';
const MAX_FILE_SIZE_MB = 10;
const ACCEPTED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
];

export async function uploadReceipt(
  escrowId: string,
  file: File
): Promise<string> {
  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
    throw new Error(`File too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`);
  }

  if (!ACCEPTED_TYPES.includes(file.type)) {
    throw new Error('Invalid file type. Use JPEG, PNG, WebP, or PDF.');
  }

  const ext = file.name.split('.').pop() || 'bin';
  const path = `${escrowId}/${Date.now()}_${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from(RECEIPTS_BUCKET)
    .upload(path, file, { upsert: false });

  if (error) throw error;

  const { data } = supabase.storage.from(RECEIPTS_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
