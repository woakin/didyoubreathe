import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

interface AuthEmailPayload {
  user: {
    email: string;
    user_metadata?: {
      name?: string;
    };
  };
  email_data: {
    token: string;
    token_hash: string;
    redirect_to: string;
    email_action_type: "signup" | "recovery" | "invite" | "magiclink" | "email_change";
  };
}

const getEmailTemplate = (type: string, displayName: string, actionLink: string): { subject: string; html: string } => {
  const baseStyles = `
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
      .info-list { 
        list-style: none;
        padding: 0;
        margin: 0;
      }
      .info-list li { 
        padding: 8px 0;
        color: #5C554E;
        font-size: 14px;
        display: flex;
        align-items: flex-start;
      }
      .info-list li::before {
        content: "•";
        color: #6B7B4C;
        font-weight: bold;
        margin-right: 12px;
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
      .warning-text {
        color: #7A746C;
        font-size: 13px;
        margin-top: 16px;
        text-align: center;
      }
    </style>
  `;

  if (type === "recovery") {
    return {
      subject: "Recupera tu acceso",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          ${baseStyles}
        </head>
        <body>
          <div class="container">
            <div class="logo-section">
              <span class="logo-text">Did You Breathe?</span>
            </div>
            
            <h1>Hola ${displayName}</h1>
            
            <p class="intro">
              Recibimos una solicitud para restablecer la contraseña de tu cuenta. 
              No te preocupes, estamos aquí para ayudarte.
            </p>
            
            <div class="card">
              <div class="card-title">Tu cuenta está segura</div>
              <ul class="info-list">
                <li>El enlace expira en 24 horas</li>
                <li>Solo funcionará una vez</li>
                <li>Si no solicitaste esto, puedes ignorar este correo</li>
              </ul>
            </div>
            
            <div class="cta-section">
              <a href="${actionLink}" class="cta-button">
                Restablecer contraseña
              </a>
            </div>
            
            <p class="warning-text">
              Si no solicitaste restablecer tu contraseña, puedes ignorar este mensaje. 
              Tu cuenta permanecerá segura.
            </p>
            
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
    };
  }

  // Default template for other email types (signup confirmation, etc.)
  return {
    subject: "Confirma tu cuenta",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        ${baseStyles}
      </head>
      <body>
        <div class="container">
          <div class="logo-section">
            <span class="logo-text">Did You Breathe?</span>
          </div>
          
          <h1>Hola ${displayName}</h1>
          
          <p class="intro">
            Gracias por unirte a Did You Breathe. 
            Por favor confirma tu cuenta haciendo clic en el botón de abajo.
          </p>
          
          <div class="cta-section">
            <a href="${actionLink}" class="cta-button">
              Confirmar cuenta
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
  };
};

const handler = async (req: Request): Promise<Response> => {
  try {
    const payload: AuthEmailPayload = await req.json();
    const { user, email_data } = payload;

    console.log("Received auth email request:", {
      email: user.email,
      type: email_data.email_action_type,
    });

    const displayName = user.user_metadata?.name || user.email.split("@")[0];
    
    // Construct the action link
    const actionLink = `${email_data.redirect_to}?token_hash=${email_data.token_hash}&type=${email_data.email_action_type}`;

    const { subject, html } = getEmailTemplate(
      email_data.email_action_type,
      displayName,
      actionLink
    );

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Did You Breathe? <notifications@updates.alasha.biz>",
        to: [user.email],
        subject,
        html,
      }),
    });

    const data = await emailResponse.json();
    console.log("Email sent successfully:", data);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error sending auth email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
