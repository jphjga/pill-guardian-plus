import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
      },
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get user's organization
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization')
      .eq('user_id', user.id)
      .single();

    if (!profile?.organization) {
      return new Response(JSON.stringify({ error: 'Organization not found' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const organization = profile.organization;

    // Fetch sales data from last 90 days
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const { data: salesData } = await supabase
      .from('sale_items')
      .select(`
        medication_id,
        quantity,
        created_at,
        medications (
          name,
          generic_name,
          category,
          price
        )
      `)
      .gte('created_at', ninetyDaysAgo.toISOString());

    // Fetch current inventory
    const { data: inventoryData } = await supabase
      .from('inventory')
      .select(`
        medication_id,
        current_stock,
        minimum_stock,
        medications (
          name,
          generic_name,
          category,
          price,
          expiry_date
        )
      `)
      .eq('organization', organization);

    // Fetch alerts
    const { data: alertsData } = await supabase
      .from('alerts')
      .select('type, message, severity')
      .eq('organization', organization)
      .eq('is_read', false);

    // Prepare context for AI
    const contextData = {
      salesData: salesData || [],
      inventoryData: inventoryData || [],
      alertsData: alertsData || [],
      organization,
      analysisDate: new Date().toISOString(),
    };

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = `You are a pharmacy inventory management expert. Analyze the provided sales and inventory data to generate actionable stocking recommendations.

Consider:
- Sales velocity (how fast items sell)
- Current stock levels vs minimum stock
- Seasonal trends and patterns
- Risk of stockouts for critical items
- Medications that are frequently low in stock
- Expiry dates approaching

Provide clear, actionable recommendations with reasoning.`;

    const userPrompt = `Analyze this pharmacy inventory data and provide the top 10 medication stocking recommendations:

Sales Data (last 90 days):
${JSON.stringify(contextData.salesData.slice(0, 50), null, 2)}

Current Inventory:
${JSON.stringify(contextData.inventoryData.slice(0, 50), null, 2)}

Active Alerts:
${JSON.stringify(contextData.alertsData, null, 2)}

For each recommendation, provide:
1. Medication name
2. Recommended reorder quantity
3. Reasoning (based on sales velocity, current stock, alerts)
4. Priority (high/medium/low)
5. Estimated days until stockout

Format as JSON array with this structure:
[
  {
    "medicationName": "string",
    "currentStock": number,
    "recommendedQuantity": number,
    "reasoning": "string",
    "priority": "high" | "medium" | "low",
    "daysUntilStockout": number
  }
]`;

    console.log('Calling Lovable AI for stock recommendations...');

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI gateway error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please add credits to your workspace.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      throw new Error(`AI gateway error: ${aiResponse.status}`);
    }

    const aiResult = await aiResponse.json();
    const recommendations = aiResult.choices[0].message.content;

    console.log('AI recommendations generated successfully');

    return new Response(JSON.stringify({ 
      recommendations,
      metadata: {
        analyzedSales: salesData?.length || 0,
        analyzedInventory: inventoryData?.length || 0,
        activeAlerts: alertsData?.length || 0,
        generatedAt: new Date().toISOString(),
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-stock-recommendations:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
