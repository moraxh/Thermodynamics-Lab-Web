import { createClient } from '@supabase/supabase-js';
import { env } from './env';

// Verificar si las credenciales de Supabase están disponibles
const hasSupabaseCredentials = !!(
  env.NEXT_PUBLIC_SUPABASE_URL && 
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY && 
  env.SUPABASE_SERVICE_ROLE_KEY
);

// Cliente para el navegador (con anon key)
export const supabase = hasSupabaseCredentials
  ? createClient(
      env.NEXT_PUBLIC_SUPABASE_URL!,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  : null;

// Cliente para el servidor con privilegios elevados (service role)
export const supabaseAdmin = hasSupabaseCredentials
  ? createClient(
      env.NEXT_PUBLIC_SUPABASE_URL!,
      env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )
  : null;
