import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Pill, Shield, Users, TrendingUp, Activity, Clock, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-primary/10 rounded-full">
              <Pill className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">About PharmaCare</h1>
          </div>
          <Button variant="outline" onClick={() => navigate(-1)}>
            Back
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>About Our Platform</CardTitle>
            <CardDescription>
              PharmaCare is a comprehensive pharmacy inventory management system designed to streamline operations and enhance patient care.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground">
              Built with modern technology and best practices, PharmaCare helps pharmacies manage their inventory, track patient records, 
              process orders efficiently, and gain valuable insights through AI-powered analytics.
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3 p-4 bg-muted/50 rounded-lg">
                <Activity className="h-6 w-6 text-primary shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Real-time Tracking</h3>
                  <p className="text-sm text-muted-foreground">Monitor inventory levels and receive automated alerts</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 bg-muted/50 rounded-lg">
                <Users className="h-6 w-6 text-primary shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Patient Management</h3>
                  <p className="text-sm text-muted-foreground">Comprehensive patient profiles and order history</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 bg-muted/50 rounded-lg">
                <TrendingUp className="h-6 w-6 text-primary shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">AI Insights</h3>
                  <p className="text-sm text-muted-foreground">Smart recommendations for stock optimization</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 bg-muted/50 rounded-lg">
                <Shield className="h-6 w-6 text-primary shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Secure & Compliant</h3>
                  <p className="text-sm text-muted-foreground">Built with healthcare compliance standards</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 bg-muted/50 rounded-lg">
                <Clock className="h-6 w-6 text-primary shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Expiry Management</h3>
                  <p className="text-sm text-muted-foreground">Automated tracking of medication expiration dates</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 bg-muted/50 rounded-lg">
                <Package className="h-6 w-6 text-primary shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Order Processing</h3>
                  <p className="text-sm text-muted-foreground">Streamlined checkout and prescription management</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>How do I add new medications to the system?</AccordionTrigger>
                <AccordionContent>
                  Navigate to the Medications page and click the "Add Medication" button. Fill in all required information including 
                  name, dosage, form, manufacturer, and pricing. You can also use the barcode scanner for faster entry.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger>How do inventory alerts work?</AccordionTrigger>
                <AccordionContent>
                  The system automatically monitors stock levels against your configured minimum and maximum thresholds. When stock 
                  falls below the minimum level or exceeds the maximum, an alert is automatically generated and displayed in the 
                  Alerts section. You'll also receive notifications for medications nearing expiration.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger>Can multiple users access the same organization?</AccordionTrigger>
                <AccordionContent>
                  Yes! PharmaCare supports multi-user organizations with role-based access control. You can have administrators, 
                  managers, pharmacists, and technicians, each with appropriate permissions. Users can join existing organizations 
                  during signup or request role changes through the system.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger>How do I process a patient order?</AccordionTrigger>
                <AccordionContent>
                  Use the Checkout page to create new orders. Select or add a patient, add medications to the order, enter 
                  prescription details if applicable, and process payment. The system automatically updates inventory levels 
                  and generates receipts that can be printed.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5">
                <AccordionTrigger>What AI insights does the system provide?</AccordionTrigger>
                <AccordionContent>
                  The AI Insights feature analyzes your sales patterns, inventory levels, and market trends to provide recommendations 
                  for stock optimization, identify slow-moving items, predict demand, and suggest reorder quantities. Access these 
                  insights from the Dashboard.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6">
                <AccordionTrigger>Is my data secure?</AccordionTrigger>
                <AccordionContent>
                  Yes, PharmaCare uses industry-standard encryption for data at rest and in transit. All sensitive information is 
                  protected with row-level security policies, and access is controlled through authentication. We comply with 
                  healthcare data protection regulations.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-7">
                <AccordionTrigger>Can I export data from the system?</AccordionTrigger>
                <AccordionContent>
                  Yes, you can export inventory lists, patient records, and sales reports. Look for export buttons on relevant pages, 
                  or contact support for bulk data export options.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-8">
                <AccordionTrigger>How do I change my role in the organization?</AccordionTrigger>
                <AccordionContent>
                  Go to your Profile page and click "Request Role Change". Submit your request with a reason, and an administrator 
                  in your organization will review and approve or deny it. You'll receive a notification once the request is processed.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Need More Help?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              For additional assistance, visit our Help page where you can chat with our AI assistant or connect with support staff.
            </p>
            <Button onClick={() => navigate('/help')}>
              Get Help
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default About;
