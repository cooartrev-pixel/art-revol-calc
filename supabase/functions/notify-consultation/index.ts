import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const telegramBotToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
const telegramChatId = Deno.env.get("TELEGRAM_CHAT_ID");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ConsultationRequest {
  name: string;
  phone: string;
  email?: string;
  loanAmount?: number;
  propertyValue?: number;
  loanTerm?: number;
  interestRate?: number;
  isYeoselya?: boolean;
  selectedBank?: string;
  message?: string;
}

const formatCurrency = (value: number | undefined) => {
  if (!value) return "Не вказано";
  return new Intl.NumberFormat("uk-UA", { style: "currency", currency: "UAH", maximumFractionDigits: 0 }).format(value);
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: ConsultationRequest = await req.json();
    console.log("Received consultation request:", data);

    const programType = data.isYeoselya ? "єОселя" : "Комерційна іпотека";
    const timestamp = new Date().toLocaleString("uk-UA", { timeZone: "Europe/Kyiv" });

    const results = { email: false, telegram: false };

    // Send Email via Resend API
    if (RESEND_API_KEY) {
      try {
        const emailHtml = `
          <h2>🏠 Нова заявка на консультацію</h2>
          <p><strong>Дата:</strong> ${timestamp}</p>
          <hr />
          <h3>Контактна інформація:</h3>
          <p><strong>Ім'я:</strong> ${data.name}</p>
          <p><strong>Телефон:</strong> ${data.phone}</p>
          <p><strong>Email:</strong> ${data.email || "Не вказано"}</p>
          <hr />
          <h3>Параметри кредиту:</h3>
          <p><strong>Програма:</strong> ${programType}</p>
          <p><strong>Банк:</strong> ${data.selectedBank || "Не вибрано"}</p>
          <p><strong>Вартість нерухомості:</strong> ${formatCurrency(data.propertyValue)}</p>
          <p><strong>Сума кредиту:</strong> ${formatCurrency(data.loanAmount)}</p>
          <p><strong>Термін:</strong> ${data.loanTerm ? `${data.loanTerm} років` : "Не вказано"}</p>
          <p><strong>Ставка:</strong> ${data.interestRate ? `${data.interestRate}%` : "Не вказано"}</p>
          ${data.message ? `<hr /><h3>Повідомлення:</h3><p>${data.message}</p>` : ""}
        `;

        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: "Іпотечний Калькулятор <onboarding@resend.dev>",
            to: ["agent@revolution.ua"],
            subject: `🏠 Нова заявка: ${data.name} - ${programType}`,
            html: emailHtml,
          }),
        });

        const emailResult = await emailResponse.json();
        console.log("Email response:", emailResult);
        results.email = emailResponse.ok;
      } catch (emailError) {
        console.error("Error sending email:", emailError);
      }
    } else {
      console.log("Resend API key not configured");
    }

    // Send Telegram notification
    if (telegramBotToken && telegramChatId) {
      try {
        const telegramMessage = `
🏠 *Нова заявка на консультацію*
📅 ${timestamp}

*Контакти:*
👤 ${data.name}
📞 ${data.phone}
📧 ${data.email || "Не вказано"}

*Параметри кредиту:*
📋 Програма: ${programType}
🏦 Банк: ${data.selectedBank || "Не вибрано"}
💰 Вартість: ${formatCurrency(data.propertyValue)}
💳 Сума кредиту: ${formatCurrency(data.loanAmount)}
📆 Термін: ${data.loanTerm ? `${data.loanTerm} років` : "Не вказано"}
📊 Ставка: ${data.interestRate ? `${data.interestRate}%` : "Не вказано"}
${data.message ? `\n💬 Повідомлення: ${data.message}` : ""}
        `.trim();

        const telegramResponse = await fetch(
          `https://api.telegram.org/bot${telegramBotToken}/sendMessage`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: telegramChatId,
              text: telegramMessage,
              parse_mode: "Markdown",
            }),
          }
        );
        const telegramResult = await telegramResponse.json();
        console.log("Telegram response:", telegramResult);
        results.telegram = telegramResult.ok === true;
      } catch (telegramError) {
        console.error("Error sending Telegram:", telegramError);
      }
    } else {
      console.log("Telegram credentials not configured");
    }

    return new Response(JSON.stringify({ success: true, results }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in notify-consultation function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
