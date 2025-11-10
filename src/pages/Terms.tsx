import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Terms = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-primary/10 rounded-full">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Terms and Conditions</h1>
          </div>
          <Button variant="outline" onClick={() => navigate(-1)}>
            Back
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>PharmaCare Terms of Service</CardTitle>
            <CardDescription>
              Last updated: {new Date().toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 text-sm">
            <section>
              <h2 className="text-lg font-semibold mb-3">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground">
                By accessing and using PharmaCare ("the Service"), you accept and agree to be bound by these Terms and Conditions. 
                If you do not agree to these terms, please do not use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">2. Use of Service</h2>
              <div className="space-y-2 text-muted-foreground">
                <p><strong>2.1 Eligibility:</strong> You must be authorized by your pharmacy organization to use this Service. 
                Users must be healthcare professionals or authorized pharmacy staff.</p>
                
                <p><strong>2.2 Account Security:</strong> You are responsible for maintaining the confidentiality of your account 
                credentials and for all activities that occur under your account.</p>
                
                <p><strong>2.3 Proper Use:</strong> You agree to use the Service only for lawful purposes and in accordance with 
                applicable pharmacy regulations and healthcare laws.</p>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">3. Data Privacy and Security</h2>
              <div className="space-y-2 text-muted-foreground">
                <p><strong>3.1 Patient Data:</strong> You acknowledge that patient information stored in the Service is subject 
                to healthcare privacy regulations (including HIPAA where applicable). You agree to handle all patient data with 
                appropriate care and confidentiality.</p>
                
                <p><strong>3.2 Data Storage:</strong> We employ industry-standard security measures to protect your data. However, 
                no system is completely secure, and we cannot guarantee absolute security.</p>
                
                <p><strong>3.3 Data Ownership:</strong> You retain ownership of all data you input into the Service. We do not 
                claim ownership of your pharmacy or patient data.</p>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">4. Service Availability</h2>
              <div className="space-y-2 text-muted-foreground">
                <p><strong>4.1 Uptime:</strong> We strive to maintain high availability of the Service but do not guarantee 
                uninterrupted access. The Service may be temporarily unavailable for maintenance or updates.</p>
                
                <p><strong>4.2 Modifications:</strong> We reserve the right to modify, suspend, or discontinue any aspect of 
                the Service at any time with reasonable notice.</p>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">5. Medication Management</h2>
              <div className="space-y-2 text-muted-foreground">
                <p><strong>5.1 Accuracy:</strong> You are responsible for ensuring the accuracy of all medication information 
                entered into the System. We provide tools to assist with inventory management but do not verify the accuracy 
                of medication data.</p>
                
                <p><strong>5.2 Compliance:</strong> You must ensure all medication dispensing and inventory practices comply with 
                local, state, and federal regulations.</p>
                
                <p><strong>5.3 AI Recommendations:</strong> AI-generated insights and recommendations are provided as guidance only 
                and should not replace professional judgment. Always verify AI suggestions before taking action.</p>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">6. User Responsibilities</h2>
              <div className="space-y-2 text-muted-foreground">
                <p>You agree to:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Provide accurate and complete information when using the Service</li>
                  <li>Maintain the security and confidentiality of your account</li>
                  <li>Notify us immediately of any unauthorized access to your account</li>
                  <li>Comply with all applicable laws and regulations</li>
                  <li>Not attempt to access unauthorized areas of the Service</li>
                  <li>Not interfere with the proper functioning of the Service</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">7. Intellectual Property</h2>
              <p className="text-muted-foreground">
                The Service, including its design, features, and functionality, is owned by PharmaCare and is protected by 
                copyright, trademark, and other intellectual property laws. You may not copy, modify, or distribute any part 
                of the Service without our express written permission.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">8. Limitation of Liability</h2>
              <div className="space-y-2 text-muted-foreground">
                <p><strong>8.1 Service Provided "As Is":</strong> The Service is provided on an "as is" and "as available" basis 
                without warranties of any kind, either express or implied.</p>
                
                <p><strong>8.2 Limitation:</strong> To the maximum extent permitted by law, PharmaCare shall not be liable for 
                any indirect, incidental, special, consequential, or punitive damages resulting from your use of the Service.</p>
                
                <p><strong>8.3 Professional Responsibility:</strong> We are not responsible for medication dispensing errors, 
                inventory discrepancies, or patient care decisions made using the Service. Professional judgment and verification 
                remain your responsibility.</p>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">9. Termination</h2>
              <p className="text-muted-foreground">
                We reserve the right to terminate or suspend your access to the Service at any time for violations of these 
                Terms or for any other reason at our discretion. Upon termination, your right to use the Service will cease 
                immediately.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">10. Changes to Terms</h2>
              <p className="text-muted-foreground">
                We reserve the right to modify these Terms at any time. We will notify users of material changes via email or 
                through the Service. Your continued use of the Service after changes are posted constitutes acceptance of the 
                modified Terms.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">11. Governing Law</h2>
              <p className="text-muted-foreground">
                These Terms shall be governed by and construed in accordance with applicable laws, without regard to conflict 
                of law principles.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">12. Contact Information</h2>
              <p className="text-muted-foreground">
                If you have questions about these Terms, please contact us through the Help page or at support@pharmacare.com.
              </p>
            </section>

            <div className="pt-6 border-t">
              <p className="text-muted-foreground font-semibold">
                By using PharmaCare, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Terms;
