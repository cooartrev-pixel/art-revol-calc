import robotoUrl from '@/assets/fonts/Roboto-Regular.ttf';

let cachedBase64: string | null = null;

export async function loadRobotoFont(): Promise<string> {
  if (cachedBase64) return cachedBase64;
  
  const response = await fetch(robotoUrl);
  const buffer = await response.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  
  cachedBase64 = btoa(binary);
  return cachedBase64;
}
