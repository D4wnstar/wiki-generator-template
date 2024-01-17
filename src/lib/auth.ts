import type { SupabaseClient } from "@supabase/supabase-js"

export async function signUp(supabase: SupabaseClient, email: string, password: string, username: string) {
    const { data, error } = await supabase
        .auth
        .signUp({
            email,
            password,
            options: {
                data: {
                    username
                },
            }
    })

    if (!error) {
        return data.user
    } else {
        return error
    }
}

export async function logIn(supabase: SupabaseClient, email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })
  
    if (!error) {
        return data.user
    } else {
        return error
    }
}