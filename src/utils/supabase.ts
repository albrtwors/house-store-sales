import { createClient } from "@supabase/supabase-js/dist/index.mjs";


// Create a single supabase client for interacting with your database
export const supabase = createClient(process.env.SUPABASE_URL ?? '', process.env.SUPABASE_PUBLISHABLE_DEFAULT_KEY ?? '')
export const clientSupabase = createClient('https://pgerjorhnyiphgvjigng.supabase.co', 'sb_publishable_UrMVXbPJyWJSIQVLFYhvQA_C7bvNfz9')