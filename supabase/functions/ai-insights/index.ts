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

    // Fetch comprehensive business data
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Sales statistics
    const { data: recentSales } = await supabase
      .from('sales')
      .select('total_amount, created_at, payment_method')
      .eq('organization', organization)
      .gte('created_at', thirtyDaysAgo.toISOString());

    // Inventory status
    const { data: inventoryStatus } = await supabase
      .from('inventory')
      .select(`
        current_stock,
        minimum_stock,
        medications (
          name,
          category,
          price,
          expiry_date
        )
      `)
      .eq('organization', organization);

    // Customer statistics
    const { data: customers, count: totalCustomers } = await supabase
      .from('customers')
      .select('id', { count: 'exact' })
      .eq('organization', organization);

    // Active alerts
    const { data: alerts, count: alertCount } = await supabase
      .from('alerts')
      .select('type, severity', { count: 'exact' })
      .eq('organization', organization)
      .eq('is_read', false);

    // Calculate metrics
    const totalRevenue = recentSales?.reduce((sum, sale) => sum + Number(sale.total_amount), 0) || 0;
    const lowStockItems = inventoryStatus?.filter(item => item.current_stock <= item.minimum_stock).length || 0;
    const criticalItems = inventoryStatus?.filter(item => item.current_stock < item.minimum_stock * 0.5).length || 0;

    const contextData = {
      timeframe: '30 days',
      totalRevenue,
      totalSales: recentSales?.length || 0,
      totalCustomers: totalCustomers || 0,
      lowStockItems,
      criticalItems,
      totalInventoryItems: inventoryStatus?.length || 0,
      activeAlerts: alertCount || 0,
      organization,
    };

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = `You are a pharmacy business intelligence analyst. Provide concise, actionable insights based on the pharmacy's operational data.

Focus on:
- Business performance trends
- Critical operational issues
- Revenue optimization opportunities
- Inventory efficiency
- Customer service improvements
- Risk alerts

Keep insights brief, specific, and actionable.`;

    const userPrompt = `Analyze this pharmacy's business data for the last 30 days and provide 5 key insights:

Business Metrics:
- Total Revenue: $${totalRevenue.toFixed(2)}
- Total Sales: ${contextData.totalSales}
- Total Customers: ${contextData.totalCustomers}
- Total Inventory Items: ${contextData.totalInventoryItems}
- Low Stock Items: ${contextData.lowStockItems}
- Critical Stock Items: ${contextData.criticalItems}
- Active Alerts: ${contextData.activeAlerts}

Provide insights in this JSON format:
[
  {
    "title": "string (brief, 5-8 words)",
    "description": "string (actionable insight, 20-30 words)",
    "type": "success" | "warning" | "info" | "error",
    "priority": "high" | "medium" | "low",
    "metric": "string (relevant number or percentage)"
  }
]`;

    console.log('Calling Lovable AI for business insights...');

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
    const insights = aiResult.choices[0].message.content;

    console.log('AI insights generated successfully');

    return new Response(JSON.stringify({ 
      insights,
      metadata: contextData
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-insights:', error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
