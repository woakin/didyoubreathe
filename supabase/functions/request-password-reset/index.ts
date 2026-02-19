import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

interface RequestBody {
  email: string;
  redirectUrl: string;
}

function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function getEmailHtml(displayName: string, resetLink: string): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Restablecer contraseña</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F9F8F5; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 480px; width: 100%; border-collapse: collapse;">
          
          <!-- Logo/Header -->
          <tr>
            <td align="center" style="padding-bottom: 32px;">
              <div style="width: 56px; height: 56px; background: linear-gradient(135deg, #6B7B4C 0%, #8B9B6C 100%); border-radius: 50%; display: inline-block;"></div>
              <h1 style="color: #3D3530; font-size: 24px; font-weight: 600; margin: 16px 0 0 0;">Did You Breathe?</h1>
            </td>
          </tr>

          <!-- Main Card -->
          <tr>
            <td>
              <table role="presentation" style="width: 100%; background: #FFFFFF; border-radius: 16px; box-shadow: 0 4px 24px rgba(61, 53, 48, 0.08);">
                <tr>
                  <td style="padding: 40px 32px;">
                    
                    <!-- Greeting -->
                    <p style="color: #3D3530; font-size: 18px; font-weight: 500; margin: 0 0 8px 0;">
                      Hola${displayName ? `, ${displayName}` : ""}
                    </p>
                    
                    <!-- Message -->
                    <p style="color: #5C534D; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
                      Recibimos una solicitud para restablecer la contraseña de tu cuenta. Haz clic en el botón de abajo para crear una nueva contraseña.
                    </p>

                    <!-- CTA Button -->
                    <table role="presentation" style="width: 100%;">
                      <tr>
                        <td align="center" style="padding: 8px 0 24px 0;">
                          <a href="${resetLink}" 
                             style="display: inline-block; background: linear-gradient(135deg, #6B7B4C 0%, #7A8A5C 100%); color: #FFFFFF; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-size: 15px; font-weight: 600; box-shadow: 0 4px 12px rgba(107, 123, 76, 0.3);">
                            Restablecer contraseña
                          </a>
                        </td>
                      </tr>
                    </table>

                    <!-- Expiry Notice -->
                    <p style="color: #8B8580; font-size: 13px; line-height: 1.5; margin: 0 0 16px 0; text-align: center;">
                      Este enlace expirará en <strong style="color: #5C534D;">1 hora</strong>.
                    </p>

                    <!-- Divider -->
                    <div style="height: 1px; background: #E8E6E3; margin: 24px 0;"></div>

                    <!-- Ignore Notice -->
                    <p style="color: #8B8580; font-size: 13px; line-height: 1.5; margin: 0;">
                      Si no solicitaste este cambio, puedes ignorar este correo. Tu contraseña no será modificada.
                    </p>

                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top: 32px;">
              <p style="color: #8B8580; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} Did You Breathe? • Tu práctica de respiración
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, redirectUrl }: RequestBody = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email) || email.length > 255) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate redirectUrl against allowed domains
    const allowedDomains = [
      "didyoubreathe.lovable.app",
      "localhost",
    ];
    try {
      const url = new URL(redirectUrl);
      if (!allowedDomains.some(domain => url.hostname === domain || url.hostname.endsWith(`.${domain}`))) {
        return new Response(
          JSON.stringify({ error: "Invalid redirect URL" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid redirect URL" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Check if user exists
    const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) {
      console.error("Error listing users:", userError);
      // Don't reveal if user exists or not for security
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const user = userData.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      // Don't reveal if user exists - return success anyway
      console.log("User not found, returning success for security");
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user's display name from profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("user_id", user.id)
      .single();

    const displayName = profile?.display_name || "";

    // Generate secure token
    const token = generateToken();
    const tokenHash = await hashToken(token);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Delete any existing tokens for this user
    await supabase
      .from("password_reset_tokens")
      .delete()
      .eq("user_id", user.id);

    // Store hashed token
    const { error: insertError } = await supabase
      .from("password_reset_tokens")
      .insert({
        user_id: user.id,
        token_hash: tokenHash,
        email: email.toLowerCase(),
        expires_at: expiresAt.toISOString(),
      });

    if (insertError) {
      console.error("Error storing token:", insertError);
      throw new Error("Failed to create reset token");
    }

    // Build reset link
    const resetLink = `${redirectUrl}?token=${token}`;

    // Send email via Resend
    const emailResponse = await resend.emails.send({
      from: "Did You Breathe? <notifications@updates.alasha.biz>",
      to: [email],
      subject: "Restablecer tu contraseña",
      html: getEmailHtml(displayName, resetLink),
    });

    console.log("Password reset email sent:", emailResponse);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in request-password-reset:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
