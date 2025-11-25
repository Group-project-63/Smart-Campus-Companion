import { createClient } from "@supabase/supabase-js";

// Provide these via env vars in production / dev container
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || "";

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // it's OK in dev to warn — make sure you set env vars before running
  // (Don't commit secrets into repo)
  console.warn("Supabase URL or anon key is not set. Set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY.");
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Convenience wrappers used by the app
export const auth = {
  onAuthStateChange: (cb) => supabase.auth.onAuthStateChange(cb),
  getUser: async () => {
    const { data, error } = await supabase.auth.getUser();
    return { data, error };
  },
  signInWithPassword: async ({ email, password }) => supabase.auth.signInWithPassword({ email, password }),
  signUp: async ({ email, password, options }) => supabase.auth.signUp({ email, password, options }),
  signInWithOAuth: async (provider) => supabase.auth.signInWithOAuth({ provider }),
  signOut: async () => supabase.auth.signOut(),
  resetPasswordForEmail: async (email) => supabase.auth.resetPasswordForEmail(email),
  // user metadata helpers
  getSession: () => supabase.auth.getSession(),
};

export default supabase;
