"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { pendoTrackServer } from "@/lib/pendo";

export async function login(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error, data: authData } = await supabase.auth.signInWithPassword(data);

  if (error) {
    return { error: error.message };
  }

  const emailDomain = data.email.split("@")[1] ?? "unknown";
  await pendoTrackServer("user_logged_in", authData.user.id, {
    email_domain: emailDomain,
    login_method: "password",
  });

  revalidatePath("/", "layout");
  redirect("/create");
}

export async function register(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error, data: authData } = await supabase.auth.signUp(data);

  if (error) {
    return { error: error.message };
  }

  const emailDomain = data.email.split("@")[1] ?? "unknown";
  await pendoTrackServer("user_registered", authData.user?.id ?? "unknown", {
    email_domain: emailDomain,
    signup_source: "registration_form",
  });

  // When email confirmation is enabled, signUp returns a user but no session,
  // and `identities` is empty. Tell the client to show "check your email"
  // instead of redirecting to a protected page the user can't reach yet.
  const needsConfirmation = !authData.session;
  if (needsConfirmation) {
    return { needsConfirmation: true, email: data.email };
  }

  revalidatePath("/", "layout");
  redirect("/create");
}

export async function logout() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  await supabase.auth.signOut();

  if (user) {
    await pendoTrackServer("user_logged_out", user.id);
  }

  revalidatePath("/", "layout");
  redirect("/");
}
