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

    const displayName = record.display_name || 'respirador';
    
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Did You Breathe? <notifications@updates.alasha.biz>",
        to: [record.email],
        subject: "Bienvenido a tu práctica de respiración",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { 
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
                line-height: 1.7; 
                color: #3D3530; 
                background-color: #F9F8F5;
                margin: 0;
                padding: 0;
              }
              .container { 
                max-width: 560px; 
                margin: 0 auto; 
                padding: 48px 24px; 
              }
              .logo-section {
                text-align: center;
                margin-bottom: 32px;
              }
              .logo-text {
                font-size: 24px;
                font-weight: 600;
                color: #6B7B4C;
                letter-spacing: -0.5px;
              }
              h1 { 
                color: #3D3530; 
                font-size: 28px;
                font-weight: 600;
                margin-bottom: 16px;
                letter-spacing: -0.5px;
              }
              .intro { 
                color: #5C554E;
                font-size: 16px;
                margin-bottom: 32px;
              }
              .card { 
                background: #F0EDE6; 
                padding: 24px; 
                border-radius: 16px; 
                margin: 24px 0;
                border: 1px solid #E5E0D5;
              }
              .card-title {
                font-weight: 600;
                color: #6B7B4C;
                margin-bottom: 16px;
                font-size: 14px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
              }
              .technique-list { 
                list-style: none;
                padding: 0;
                margin: 0;
              }
              .technique-list li { 
                padding: 12px 0;
                border-bottom: 1px solid #E5E0D5;
                display: flex;
                align-items: center;
              }
              .technique-list li:last-child {
                border-bottom: none;
              }
              .technique-name {
                font-weight: 500;
                color: #3D3530;
              }
              .technique-desc {
                font-size: 14px;
                color: #7A746C;
                margin-left: 8px;
              }
              .cta-section {
                text-align: center;
                margin: 40px 0;
              }
              .cta-button {
                display: inline-block;
                background: #6B7B4C;
                color: white;
                padding: 14px 32px;
                border-radius: 12px;
                text-decoration: none;
                font-weight: 500;
                font-size: 15px;
              }
              .signature {
                margin-top: 32px;
                color: #7A746C;
              }
              .footer { 
                margin-top: 48px; 
                padding-top: 24px; 
                border-top: 1px solid #E5E0D5; 
                color: #9A948C; 
                font-size: 13px;
                text-align: center;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="logo-section">
                <span class="logo-text">Did You Breathe?</span>
              </div>
              
              <h1>Hola ${displayName}</h1>
              
              <p class="intro">
                Bienvenido a tu nueva práctica de respiración consciente. 
                Has dado el primer paso hacia una vida más equilibrada.
              </p>
              
              <div class="card">
                <div class="card-title">Tus técnicas disponibles</div>
                <ul class="technique-list">
                  <li>
                    <span class="technique-name">Respiración Diafragmática</span>
                    <span class="technique-desc">— Relajación profunda</span>
                  </li>
                  <li>
                    <span class="technique-name">Box Breathing</span>
                    <span class="technique-desc">— Enfoque y calma</span>
                  </li>
                  <li>
                    <span class="technique-name">Técnica 4-7-8</span>
                    <span class="technique-desc">— Mejor descanso</span>
                  </li>
                  <li>
                    <span class="technique-name">Nadi Shodhana</span>
                    <span class="technique-desc">— Equilibrio mental</span>
                  </li>
                </ul>
              </div>
              
              <div class="cta-section">
                <a href="https://didyoubreathe.lovable.app/techniques" class="cta-button">
                  Comenzar a respirar
                </a>
              </div>
              
              <p class="signature">
                Un respiro a la vez,<br>
                <strong>El equipo de Did You Breathe?</strong>
              </p>
              
              <div class="footer">
                <p>Este correo fue enviado desde Did You Breathe?</p>
                <p>Tu práctica de respiración guiada</p>
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
