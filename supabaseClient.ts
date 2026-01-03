
import { createClient } from '@supabase/supabase-js';

// Credenciais fornecidas para conexão direta
const supabaseUrl = 'https://zxcfxujdbdiclqmfpjsy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4Y2Z4dWpkYmRpY2xxbWZwanN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3OTE3NjQsImV4cCI6MjA4MTM2Nzc2NH0.N0yRbaMKaQms1-pq6TY6BKvKrZEneOsmIZnPJ2Zqs5s';

// Inicialização do cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseKey);
