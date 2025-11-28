import { auth } from "@clerk/nextjs/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const createServerSupabaseClient = async (): Promise<SupabaseClient> => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      accessToken: async () => (await auth()).getToken() ?? null,
    }
  );
};

export const createBrowserSupabaseClient = (
  getToken: () => Promise<string | null>
): SupabaseClient => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      accessToken: async () => getToken() ?? null,
    }
  );
};
