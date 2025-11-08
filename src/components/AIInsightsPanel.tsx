import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, AlertCircle, Info, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface Insight {
  title: string;
  description: string;
  type: "success" | "warning" | "info" | "error";
  priority: "high" | "medium" | "low";
  metric?: string;
}

const AIInsightsPanel = () => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-insights', {
        body: {}
      });

      if (error) {
        console.error('Error fetching insights:', error);
        return;
      }

      if (data.error) {
        console.error('AI error:', data.error);
        return;
      }

      // Parse the AI response
      let parsedInsights: Insight[] = [];
      try {
        const content = data.insights;
        
        // Try to extract JSON from the response
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          parsedInsights = JSON.parse(jsonMatch[0]);
        } else {
          // Fallback to a simple insight
          parsedInsights = [{
            title: "AI Analysis Complete",
            description: content.substring(0, 150),
            type: "info",
            priority: "medium"
          }];
        }
      } catch (parseError) {
        console.error('Error parsing insights:', parseError);
        parsedInsights = [{
          title: "Business Overview",
          description: data.insights.substring(0, 150),
          type: "info",
          priority: "medium"
        }];
      }

      setInsights(parsedInsights.slice(0, 5)); // Show top 5 insights
    } catch (error) {
      console.error('Error in fetchInsights:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-500/10 border-green-500/20";
      case "warning":
        return "bg-yellow-500/10 border-yellow-500/20";
      case "error":
        return "bg-red-500/10 border-red-500/20";
      default:
        return "bg-blue-500/10 border-blue-500/20";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
              </div>
            ))}
          </div>
        ) : insights.length > 0 ? (
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border ${getTypeColor(insight.type)}`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{getTypeIcon(insight.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-sm">{insight.title}</h4>
                      {insight.priority === "high" && (
                        <Badge variant="destructive" className="text-xs">High Priority</Badge>
                      )}
                      {insight.metric && (
                        <span className="text-xs font-mono text-muted-foreground ml-auto">
                          {insight.metric}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{insight.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No insights available yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIInsightsPanel;
