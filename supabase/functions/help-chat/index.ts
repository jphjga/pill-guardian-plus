import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are a helpful AI assistant for PharmaCare, a pharmacy inventory management system. You help users with questions about:

**Key Features:**
- Inventory Management: Track medications, set min/max stock levels, receive low stock alerts
- Medication Database: Add medications manually or via barcode scanning, manage expiry dates
- Patient Management: Create patient profiles, track medical history, allergies, and insurance
- Checkout & Orders: Process prescriptions, apply insurance coverage, print receipts
- Dashboard & Analytics: View sales trends, inventory status, expiring medications
- Alerts & Notifications: Automated alerts for low stock, expiring meds, role requests
- AI Insights: Get stock recommendations, demand forecasting, inventory optimization
- Multi-user Organizations: Role-based access (Administrator, Manager, Pharmacist, Technician)

**Common Tasks:**
- Adding medications: Go to Medications page → Add Medication button → Fill details or scan barcode
- Processing orders: Checkout page → Select patient → Add medications → Process payment
- Managing inventory: Inventory page → View stock levels → Update stock or set thresholds
- Viewing alerts: Alerts page shows low stock, expiring medications, system notifications
- Requesting role changes: Profile page → Request Role Change → Submit with reason
- Exporting data: Look for export buttons on Inventory and Patient pages

**Security & Access:**
- All data is encrypted and protected with row-level security
- Users can only access data from their organization
- Administrators can approve role changes and manage users
- Patient data is confidential and HIPAA-compliant

Provide clear, concise answers. If users need to escalate to human support, acknowledge their request and let them know support will contact them.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const assistantResponse = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ response: assistantResponse }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Help chat error:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
