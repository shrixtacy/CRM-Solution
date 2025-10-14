import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || 'https://cekhahbluzicilrtkyvz.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNla2hhaGJsdXppY2lscnRreXZ6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDI3NDk5MSwiZXhwIjoyMDc1ODUwOTkxfQ.Bh_Z1r5iFZICmSfnWYwYVyIFniebejg12oy_7HIQ1gE'

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Alternative database connection using Supabase client
export { supabase as db }

