import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, AlertTriangle, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Recommendation {
  medicationName: string;
  currentStock: number;
  recommendedQuantity: number;
  reasoning: string;
  priority: "high" | "medium" | "low";
  daysUntilStockout: number;
}

const AIRecommendations = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [metadata, setMetadata] = useState<any>(null);
  const { toast } = useToast();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive";
      case "medium":
        return "default";
      case "low":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <AlertTriangle className="h-4 w-4" />;
      case "medium":
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-stock-recommendations', {
        body: {}
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      // Parse the AI response
      let parsedRecommendations: Recommendation[] = [];
      try {
        // The AI returns recommendations as a string, potentially with JSON
        const content = data.recommendations;
        
        // Try to extract JSON from the response
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          parsedRecommendations = JSON.parse(jsonMatch[0]);
        } else {
          // If no JSON found, create a simple structure from the text
          parsedRecommendations = [{
            medicationName: "AI Analysis Complete",
            currentStock: 0,
            recommendedQuantity: 0,
            reasoning: content,
            priority: "medium",
            daysUntilStockout: 0
          }];
        }
      } catch (parseError) {
        console.error('Error parsing recommendations:', parseError);
        parsedRecommendations = [{
          medicationName: "Analysis Result",
          currentStock: 0,
          recommendedQuantity: 0,
          reasoning: data.recommendations,
          priority: "medium",
          daysUntilStockout: 0
        }];
      }

      setRecommendations(parsedRecommendations);
      setMetadata(data.metadata);

      toast({
        title: "AI Recommendations Generated",
        description: `Analyzed ${data.metadata?.analyzedInventory || 0} inventory items and ${data.metadata?.analyzedSales || 0} sales records.`,
      });
    } catch (error: any) {
      console.error('Error fetching AI recommendations:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate recommendations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Stock Recommendations
            </CardTitle>
            <CardDescription>
              Intelligent insights based on sales patterns and inventory levels
            </CardDescription>
          </div>
          <Button 
            onClick={fetchRecommendations} 
            disabled={loading}
            className="gap-2"
          >
            <Sparkles className="h-4 w-4" />
            {loading ? "Analyzing..." : "Get Recommendations"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-5/6" />
              </div>
            ))}
          </div>
        )}

        {!loading && recommendations.length === 0 && (
          <Alert>
            <Sparkles className="h-4 w-4" />
            <AlertDescription>
              Click "Get Recommendations" to analyze your inventory and generate AI-powered stocking suggestions.
            </AlertDescription>
          </Alert>
        )}

        {!loading && recommendations.length > 0 && (
          <div className="space-y-4">
            {metadata && (
              <div className="text-sm text-muted-foreground mb-4">
                Analysis based on {metadata.analyzedSales} sales and {metadata.analyzedInventory} inventory items
                {metadata.activeAlerts > 0 && ` • ${metadata.activeAlerts} active alerts`}
              </div>
            )}

            {recommendations.map((rec, index) => (
              <Card key={index} className="border-l-4" style={{
                borderLeftColor: rec.priority === 'high' ? 'hsl(var(--destructive))' : 
                                rec.priority === 'medium' ? 'hsl(var(--primary))' : 
                                'hsl(var(--muted))'
              }}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{rec.medicationName}</h4>
                        <Badge variant={getPriorityColor(rec.priority)} className="gap-1">
                          {getPriorityIcon(rec.priority)}
                          {rec.priority}
                        </Badge>
                      </div>
                      
                      {rec.currentStock > 0 && (
                        <div className="grid grid-cols-3 gap-4 mb-3 text-sm">
                          <div>
                            <span className="text-muted-foreground">Current Stock:</span>
                            <p className="font-medium">{rec.currentStock}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Recommended:</span>
                            <p className="font-medium text-primary">{rec.recommendedQuantity}</p>
                          </div>
                          {rec.daysUntilStockout > 0 && (
                            <div>
                              <span className="text-muted-foreground">Days Until Stockout:</span>
                              <p className="font-medium">{rec.daysUntilStockout}</p>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <p className="text-sm text-muted-foreground">{rec.reasoning}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIRecommendations;
