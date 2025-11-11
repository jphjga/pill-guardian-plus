import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { HelpCircle, Send, Bot, User as UserIcon, Phone, Search, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface KnowledgeArticle {
  id: string;
  title: string;
  category: string;
  content: string;
  keywords: string[];
}

const knowledgeBase: KnowledgeArticle[] = [
  {
    id: '1',
    title: 'How to add medications to inventory',
    category: 'Inventory Management',
    content: 'Navigate to the Medications page and click the "Add Medication" button. You can either fill in the details manually or use the barcode scanner to automatically populate medication information. Make sure to set minimum and maximum stock levels to receive low stock alerts.',
    keywords: ['add', 'medication', 'inventory', 'stock', 'barcode', 'scan']
  },
  {
    id: '2',
    title: 'Processing customer orders and checkout',
    category: 'Orders & Checkout',
    content: 'Go to the Checkout page, select or create a customer profile, add medications to the cart, and process the payment. You can apply insurance coverage if the customer has insurance information on file. After completing the transaction, you can print a receipt using the print button.',
    keywords: ['checkout', 'order', 'payment', 'customer', 'insurance', 'receipt', 'print']
  },
  {
    id: '3',
    title: 'Setting up low stock alerts',
    category: 'Inventory Management',
    content: 'In the Inventory page, click on any medication to edit it. Set the "Minimum Stock" field to your desired threshold. When stock falls below this level, you will receive an automatic alert in the Alerts section. You can also set a "Maximum Stock" level for reordering guidance.',
    keywords: ['alert', 'notification', 'low stock', 'minimum', 'threshold', 'reorder']
  },
  {
    id: '4',
    title: 'Managing customer profiles and medical history',
    category: 'Customer Management',
    content: 'Access the Customers page to view all patient profiles. You can add new customers, update their information, record medical history, allergies, and insurance details. All customer data is encrypted and HIPAA-compliant for security.',
    keywords: ['customer', 'patient', 'profile', 'medical history', 'allergies', 'insurance']
  },
  {
    id: '5',
    title: 'Understanding the dashboard analytics',
    category: 'Dashboard & Reports',
    content: 'The Dashboard shows key metrics including total sales revenue, low stock items, expiring medications, and recent transactions. Use the date filters to view data for different time periods. Charts display sales trends and inventory status for quick insights.',
    keywords: ['dashboard', 'analytics', 'reports', 'sales', 'metrics', 'charts']
  },
  {
    id: '6',
    title: 'Requesting role changes',
    category: 'User Management',
    content: 'Go to your Profile page and click "Request Role Change". Select the desired role and provide a reason for the request. Administrators in your organization will review and approve or deny the request. You will receive a notification once the request is processed.',
    keywords: ['role', 'permission', 'access', 'administrator', 'manager', 'request']
  },
  {
    id: '7',
    title: 'Using AI insights and recommendations',
    category: 'AI Features',
    content: 'The AI Insights panel on the Dashboard provides intelligent stock recommendations, demand forecasting, and inventory optimization suggestions. These insights are based on your sales patterns, seasonal trends, and current inventory levels to help you make better stocking decisions.',
    keywords: ['ai', 'insights', 'recommendations', 'forecast', 'optimization', 'smart']
  },
  {
    id: '8',
    title: 'Exporting data and reports',
    category: 'Data Management',
    content: 'Most pages with tables (Inventory, Customers, Orders) have an export button that allows you to download data as CSV or Excel files. This is useful for creating backup records or integrating with other systems.',
    keywords: ['export', 'download', 'csv', 'excel', 'backup', 'data']
  },
  {
    id: '9',
    title: 'Managing expired medications',
    category: 'Inventory Management',
    content: 'The system automatically tracks expiration dates and alerts you when medications are approaching expiry. Check the Alerts page regularly for expiring items. You can filter the inventory by expiration date to identify items that need to be removed or returned.',
    keywords: ['expiry', 'expiration', 'date', 'expired', 'alert', 'remove']
  },
  {
    id: '10',
    title: 'Security and data privacy',
    category: 'Security',
    content: 'PharmaCare uses enterprise-grade encryption for all data. Row-level security ensures users can only access data from their organization. All patient information is stored in compliance with HIPAA regulations. You can review our full security practices in the Terms & Conditions.',
    keywords: ['security', 'privacy', 'hipaa', 'encryption', 'compliance', 'data protection']
  }
];

const Help = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredArticles, setFilteredArticles] = useState(knowledgeBase);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I'm the PharmaCare AI Assistant. I can help you with questions about using the system, managing inventory, processing orders, and more. How can I assist you today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showEscalation, setShowEscalation] = useState(false);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredArticles(knowledgeBase);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const filtered = knowledgeBase.filter(article => 
      article.title.toLowerCase().includes(lowerQuery) ||
      article.content.toLowerCase().includes(lowerQuery) ||
      article.category.toLowerCase().includes(lowerQuery) ||
      article.keywords.some(keyword => keyword.toLowerCase().includes(lowerQuery))
    );
    setFilteredArticles(filtered);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('help-chat', {
        body: { messages: [...messages, userMessage] }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response
      };
      setMessages(prev => [...prev, assistantMessage]);
      
      // Show escalation option after 3 exchanges
      if (messages.length >= 6) {
        setShowEscalation(true);
      }
    } catch (error: any) {
      console.error('Help chat error:', error);
      toast({
        title: 'Error',
        description: 'Failed to get response. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEscalate = () => {
    toast({
      title: 'Support Request Sent',
      description: 'A support representative will contact you shortly via email.',
    });
    setShowEscalation(false);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-primary/10 rounded-full">
              <HelpCircle className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Help Center</h1>
              <p className="text-sm text-muted-foreground">Get assistance from our AI assistant</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => navigate(-1)}>
            Back
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => navigate('/about')}>
            <CardHeader>
              <CardTitle className="text-lg">About & FAQ</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Learn about PharmaCare features and common questions</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => navigate('/terms')}>
            <CardHeader>
              <CardTitle className="text-lg">Terms & Conditions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Review our terms of service and usage guidelines</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardHeader>
              <CardTitle className="text-lg">Contact Support</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Email: support@pharmacare.com</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <CardTitle>Knowledge Base</CardTitle>
            </div>
            <CardDescription>Search for answers before chatting with AI</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search for help articles..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {filteredArticles.length > 0 ? (
              <Accordion type="single" collapsible className="w-full">
                {filteredArticles.map((article) => (
                  <AccordionItem key={article.id} value={article.id}>
                    <AccordionTrigger className="text-left">
                      <div>
                        <div className="font-medium">{article.title}</div>
                        <Badge variant="secondary" className="mt-1 text-xs">
                          {article.category}
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm text-muted-foreground">{article.content}</p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No articles found matching your search.</p>
                <p className="text-sm mt-2">Try different keywords or chat with our AI assistant below.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="h-[600px] flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>AI Assistant</CardTitle>
                <CardDescription>
                  Ask questions about using PharmaCare
                </CardDescription>
              </div>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Bot className="h-3 w-3" />
                Online
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0">
            <ScrollArea className="flex-1 px-6">
              <div className="space-y-4 pb-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.role === 'assistant' && (
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                    {message.role === 'user' && (
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <UserIcon className="h-4 w-4 text-primary" />
                      </div>
                    )}
                  </div>
                ))}
                {loading && (
                  <div className="flex gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                    <div className="bg-muted rounded-lg p-3">
                      <div className="flex space-x-2">
                        <div className="h-2 w-2 bg-muted-foreground/50 rounded-full animate-bounce" />
                        <div className="h-2 w-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:0.2s]" />
                        <div className="h-2 w-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:0.4s]" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="border-t p-4 space-y-3">
              {showEscalation && (
                <div className="bg-muted/50 p-3 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-primary" />
                    <p className="text-sm">Need more help?</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={handleEscalate}>
                    Connect to Support
                  </Button>
                </div>
              )}
              
              <div className="flex gap-2">
                <Input
                  placeholder="Type your question..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  disabled={loading}
                />
                <Button onClick={handleSend} disabled={loading || !input.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Help;
