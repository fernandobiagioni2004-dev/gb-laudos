import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify caller is admin
    const callerClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await callerClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Token inválido" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const callerUid = claimsData.claims.sub;
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const { data: callerUser } = await adminClient
      .from("app_users")
      .select("papel")
      .eq("auth_uid", callerUid)
      .single();

    if (callerUser?.papel !== "admin") {
      return new Response(JSON.stringify({ error: "Apenas administradores podem excluir usuários" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { userId } = await req.json();

    if (!userId) {
      return new Response(JSON.stringify({ error: "userId é obrigatório" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch the user's auth_uid
    const { data: targetUser, error: fetchError } = await adminClient
      .from("app_users")
      .select("auth_uid")
      .eq("id", userId)
      .single();

    if (fetchError || !targetUser) {
      return new Response(JSON.stringify({ error: "Usuário não encontrado" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Nullify radiologista_id in exams to avoid FK constraint violation
    await adminClient
      .from("exams")
      .update({ radiologista_id: null })
      .eq("radiologista_id", userId);

    // Nullify user_id in meeting_participants
    await adminClient
      .from("meeting_participants")
      .delete()
      .eq("user_id", userId);

    // Delete vacations
    await adminClient
      .from("vacations")
      .delete()
      .eq("user_id", userId);

    // Delete price table entries
    await adminClient
      .from("price_table_radiologist")
      .delete()
      .eq("radiologista_id", userId);

    // Delete from app_users
    const { error: deleteDbError } = await adminClient
      .from("app_users")
      .delete()
      .eq("id", userId);

    if (deleteDbError) {
      return new Response(JSON.stringify({ error: deleteDbError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Delete from auth
    const { error: deleteAuthError } = await adminClient.auth.admin.deleteUser(targetUser.auth_uid);

    if (deleteAuthError) {
      return new Response(JSON.stringify({ error: deleteAuthError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
