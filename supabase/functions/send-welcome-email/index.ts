import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  record: {
    user_id: string;
    display_name: string | null;
    email: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { record }: WelcomeEmailRequest = await req.json();
    
    console.log("Sending welcome email to:", record.email);

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Breathe App <onboarding@resend.dev>",
        to: [record.email],
        subject: "¡Bienvenido a tu práctica de respiración!",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
              h1 { color: #1a1a2e; margin-bottom: 24px; }
              .highlight { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 12px; margin: 24px 0; }
              ul { padding-left: 20px; }
              li { margin: 8px 0; }
              .footer { margin-top: 32px; padding-top: 24px; border-top: 1px solid #eee; color: #666; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>¡Hola ${record.display_name || 'respirador'}! 🌬️</h1>
              
              <p>Gracias por unirte a nuestra comunidad de respiración consciente.</p>
              
              <div class="highlight">
                <strong>Ya tienes acceso a todas nuestras técnicas de respiración guiada:</strong>
              </div>
              
              <ul>
                <li>🫁 <strong>Respiración Diafragmática</strong> - Para relajación profunda</li>
                <li>📦 <strong>Box Breathing</strong> - Para enfoque y calma</li>
                <li>😴 <strong>Técnica 4-7-8</strong> - Para dormir mejor</li>
                <li>🌊 <strong>Nadi Shodhana</strong> - Para equilibrio mental</li>
              </ul>
              
              <p>Comienza tu práctica hoy y transforma tu bienestar un respiro a la vez.</p>
              
              <p><strong>Namaste 🙏</strong></p>
              
              <div class="footer">
                <p>Este correo fue enviado desde Breathe App.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      }),
    });

    const data = await emailResponse.json();
    console.log("Email sent successfully:", data);

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending welcome email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
