import { createClient } from "@/lib/supabase/server";
import { SidebarAuthButton } from "./sidebar-auth-button";

export async function AuthButton() {
  const supabase = await createClient();

  // You can also use getUser() which will be slower.
  const { data } = await supabase.auth.getClaims();

  const isLoggedIn = !!data?.claims;

  return <SidebarAuthButton isLoggedIn={isLoggedIn} />;
}
