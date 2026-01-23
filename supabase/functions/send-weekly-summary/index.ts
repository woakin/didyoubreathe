import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface UserStats {
  sessions: number;
  minutes: number;
  streak: number;
  displayName: string;
}

function getActiveUserEmail(stats: UserStats, appUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #F9F8F5; font-family: 'Georgia', serif;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 500px; width: 100%; border-collapse: collapse;">
          
          <!-- Header -->
          <tr>
            <td align="center" style="padding-bottom: 32px;">
              <h1 style="margin: 0; font-size: 28px; color: #3D3530; font-weight: normal; letter-spacing: 0.5px;">
                Did You Breathe?
              </h1>
            </td>
          </tr>
          
          <!-- Greeting -->
          <tr>
            <td style="padding-bottom: 24px;">
              <p style="margin: 0; font-size: 18px; color: #3D3530; line-height: 1.6;">
                Hola ${stats.displayName},
              </p>
            </td>
          </tr>
          
          <!-- Title -->
          <tr>
            <td style="padding-bottom: 24px;">
              <h2 style="margin: 0; font-size: 22px; color: #6B7B4C; font-weight: normal;">
                Tu semana en números ✨
              </h2>
            </td>
          </tr>
          
          <!-- Stats Card -->
          <tr>
            <td style="padding-bottom: 32px;">
              <table role="presentation" style="width: 100%; background-color: #F0EDE6; border-radius: 16px; border-collapse: collapse;">
                <tr>
                  <td style="padding: 24px; text-align: center;">
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="width: 33%; text-align: center; padding: 8px;">
                          <div style="font-size: 32px; color: #6B7B4C; font-weight: bold; margin-bottom: 4px;">
                            ${stats.sessions}
                          </div>
                          <div style="font-size: 14px; color: #5C5650; text-transform: uppercase; letter-spacing: 1px;">
                            sesiones
                          </div>
                        </td>
                        <td style="width: 33%; text-align: center; padding: 8px; border-left: 1px solid #E5E0D8; border-right: 1px solid #E5E0D8;">
                          <div style="font-size: 32px; color: #6B7B4C; font-weight: bold; margin-bottom: 4px;">
                            ${stats.minutes}
                          </div>
                          <div style="font-size: 14px; color: #5C5650; text-transform: uppercase; letter-spacing: 1px;">
                            minutos
                          </div>
                        </td>
                        <td style="width: 33%; text-align: center; padding: 8px;">
                          <div style="font-size: 32px; color: #6B7B4C; font-weight: bold; margin-bottom: 4px;">
                            ${stats.streak}
                          </div>
                          <div style="font-size: 14px; color: #5C5650; text-transform: uppercase; letter-spacing: 1px;">
                            racha
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Message -->
          <tr>
            <td style="padding-bottom: 32px;">
              <p style="margin: 0; font-size: 16px; color: #3D3530; line-height: 1.7;">
                🎉 <strong>¡Celebramos contigo!</strong> Mantuviste tu práctica constante esta semana. 
                Cada respiración consciente es un regalo que te das a ti mismo.
              </p>
            </td>
          </tr>
          
          <!-- CTA Button -->
          <tr>
            <td align="center" style="padding-bottom: 40px;">
              <a href="${appUrl}/techniques" 
                 style="display: inline-block; background-color: #6B7B4C; color: #FFFFFF; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-size: 16px; letter-spacing: 0.5px;">
                Seguir practicando
              </a>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td align="center" style="border-top: 1px solid #E5E0D8; padding-top: 24px;">
              <p style="margin: 0; font-size: 13px; color: #8B8580; line-height: 1.6;">
                Respira. Siente. Vive.<br>
                — El equipo de Did You Breathe?
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

function getInactiveUserEmail(displayName: string, appUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #F9F8F5; font-family: 'Georgia', serif;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 500px; width: 100%; border-collapse: collapse;">
          
          <!-- Header -->
          <tr>
            <td align="center" style="padding-bottom: 32px;">
              <h1 style="margin: 0; font-size: 28px; color: #3D3530; font-weight: normal; letter-spacing: 0.5px;">
                Did You Breathe?
              </h1>
            </td>
          </tr>
          
          <!-- Greeting -->
          <tr>
            <td style="padding-bottom: 24px;">
              <p style="margin: 0; font-size: 18px; color: #3D3530; line-height: 1.6;">
                Hola ${displayName},
              </p>
            </td>
          </tr>
          
          <!-- Title -->
          <tr>
            <td style="padding-bottom: 24px;">
              <h2 style="margin: 0; font-size: 22px; color: #6B7B4C; font-weight: normal;">
                Te extrañamos 💚
              </h2>
            </td>
          </tr>
          
          <!-- Message Card -->
          <tr>
            <td style="padding-bottom: 32px;">
              <table role="presentation" style="width: 100%; background-color: #F0EDE6; border-radius: 16px; border-collapse: collapse;">
                <tr>
                  <td style="padding: 28px;">
                    <p style="margin: 0 0 16px 0; font-size: 16px; color: #3D3530; line-height: 1.7;">
                      Esta semana no registramos ninguna sesión de respiración, y queremos recordarte que estamos aquí para ti.
                    </p>
                    <p style="margin: 0; font-size: 16px; color: #3D3530; line-height: 1.7; font-style: italic;">
                      🌿 <strong>Solo 3 minutos</strong> son suficientes para reconectar con tu bienestar y encontrar un momento de calma en tu día.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Benefits reminder -->
          <tr>
            <td style="padding-bottom: 32px;">
              <p style="margin: 0; font-size: 15px; color: #5C5650; line-height: 1.7;">
                La respiración consciente reduce el estrés, mejora la concentración y te ayuda a sentirte más presente. Tu cuerpo y mente te lo agradecerán.
              </p>
            </td>
          </tr>
          
          <!-- CTA Button -->
          <tr>
            <td align="center" style="padding-bottom: 40px;">
              <a href="${appUrl}/techniques" 
                 style="display: inline-block; background-color: #6B7B4C; color: #FFFFFF; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-size: 16px; letter-spacing: 0.5px;">
                Retomar mi práctica
              </a>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td align="center" style="border-top: 1px solid #E5E0D8; padding-top: 24px;">
              <p style="margin: 0; font-size: 13px; color: #8B8580; line-height: 1.6;">
                Respira. Siente. Vive.<br>
                — El equipo de Did You Breathe?
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting weekly summary email job...");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const appUrl = "https://didyoubreathe.lovable.app";

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Get all users
    const { data: usersData, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (usersError) {
      console.error("Error fetching users:", usersError);
      throw usersError;
    }

    const users = usersData.users;
    console.log(`Found ${users.length} users to process`);

    // Calculate date range for the past week
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoISO = weekAgo.toISOString();

    let emailsSent = 0;
    let errors: string[] = [];

    for (const user of users) {
      if (!user.email) {
        console.log(`Skipping user ${user.id} - no email`);
        continue;
      }

      try {
        // Get sessions for the past week
        const { data: sessions, error: sessionsError } = await supabaseAdmin
          .from("breathing_sessions")
          .select("duration_seconds, technique")
          .eq("user_id", user.id)
          .gte("completed_at", weekAgoISO);

        if (sessionsError) {
          console.error(`Error fetching sessions for user ${user.id}:`, sessionsError);
          errors.push(`Sessions error for ${user.id}: ${sessionsError.message}`);
          continue;
        }

        // Get current streak
        const { data: streakData, error: streakError } = await supabaseAdmin
          .from("daily_streaks")
          .select("current_streak")
          .eq("user_id", user.id)
          .maybeSingle();

        if (streakError) {
          console.error(`Error fetching streak for user ${user.id}:`, streakError);
        }

        // Get display name from profile
        const { data: profileData } = await supabaseAdmin
          .from("profiles")
          .select("display_name")
          .eq("user_id", user.id)
          .maybeSingle();

        const displayName = profileData?.display_name || user.user_metadata?.name || user.email.split("@")[0];
        const hasActivity = sessions && sessions.length > 0;
        const totalMinutes = sessions?.reduce((acc, s) => acc + (s.duration_seconds / 60), 0) || 0;

        const stats: UserStats = {
          sessions: sessions?.length || 0,
          minutes: Math.round(totalMinutes),
          streak: streakData?.current_streak || 0,
          displayName
        };

        // Generate appropriate email
        const emailHtml = hasActivity 
          ? getActiveUserEmail(stats, appUrl)
          : getInactiveUserEmail(displayName, appUrl);

        const subject = hasActivity 
          ? `🌿 Tu resumen semanal: ${stats.sessions} sesiones y ${stats.minutes} minutos de calma`
          : "💚 Te extrañamos - ¿Respiramos juntos?";

        // Send email via Resend
        const emailResponse = await resend.emails.send({
          from: "Did You Breathe? <notifications@updates.alasha.biz>",
          to: [user.email],
          subject,
          html: emailHtml,
        });

        console.log(`Email sent to ${user.email} (${hasActivity ? 'active' : 'inactive'}):`, emailResponse);
        emailsSent++;

      } catch (userError: any) {
        console.error(`Error processing user ${user.id}:`, userError);
        errors.push(`User ${user.id}: ${userError.message}`);
      }
    }

    console.log(`Weekly summary complete. Sent ${emailsSent} emails. Errors: ${errors.length}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        emailsSent, 
        totalUsers: users.length,
        errors: errors.length > 0 ? errors : undefined 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in send-weekly-summary:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
