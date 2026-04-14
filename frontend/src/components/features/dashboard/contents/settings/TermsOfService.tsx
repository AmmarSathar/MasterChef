import { Badge } from "@/components/ui/badge";
import { ScrollText } from "lucide-react";

const SECTIONS = [
  {
    title: "1. Acceptance of Terms",
    body: `By accessing or using MasterChef ("the Service"), you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any part of these terms, you may not use the Service.

These Terms apply to all users of the Service, including without limitation users who are browsers, contributors, and/or content creators.`,
  },
  {
    title: "2. Use of Service",
    body: `MasterChef grants you a limited, non-exclusive, non-transferable license to access and use the Service solely for your personal, non-commercial purposes. You agree not to reproduce, duplicate, copy, sell, resell, or exploit any portion of the Service without express written permission.

We reserve the right to modify, suspend, or discontinue the Service at any time without notice or liability. We may also impose limits on certain features or restrict your access to parts or all of the Service without notice or liability.`,
  },
  {
    title: "3. User Accounts",
    body: `You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.

You must provide accurate and complete information when creating your account. You may not use another person's account without permission. We reserve the right to terminate accounts that violate these Terms.`,
  },
  {
    title: "4. User Content",
    body: `You retain ownership of any content you submit to the Service, including recipes, images, and reviews. By submitting content, you grant MasterChef a worldwide, royalty-free license to use, display, and distribute your content in connection with operating and improving the Service.

You represent and warrant that your content does not infringe any third-party rights and complies with these Terms. We may remove any content that we determine, in our sole discretion, violates these Terms or is otherwise objectionable.`,
  },
  {
    title: "5. Prohibited Conduct",
    body: `You agree not to: (a) use the Service for any unlawful purpose; (b) upload or transmit viruses or other malicious code; (c) attempt to gain unauthorized access to any portion of the Service; (d) interfere with or disrupt the Service or servers connected to the Service; (e) collect or harvest any personally identifiable information from the Service; or (f) use the Service to send unsolicited communications.

Violations of these prohibitions may result in immediate termination of your account and may subject you to civil or criminal liability.`,
  },
  {
    title: "6. Intellectual Property",
    body: `The Service and its original content, features, and functionality are and will remain the exclusive property of MasterChef and its licensors. The Service is protected by copyright, trademark, and other laws. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of MasterChef.`,
  },
  {
    title: "7. Disclaimer of Warranties",
    body: `The Service is provided on an "AS IS" and "AS AVAILABLE" basis without any warranties of any kind, either express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, or non-infringement.

MasterChef does not warrant that the Service will be uninterrupted, error-free, or free of viruses or other harmful components. Nutritional information and dietary advice provided through the Service is for informational purposes only and is not a substitute for professional medical advice.`,
  },
  {
    title: "8. Limitation of Liability",
    body: `To the fullest extent permitted by applicable law, MasterChef shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or goodwill, arising out of or in connection with your use of the Service.

In no event shall MasterChef's total liability to you for all claims arising from or related to the Service exceed the amount you paid to MasterChef in the twelve months preceding the claim.`,
  },
  {
    title: "9. Termination",
    body: `We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason, including if you breach these Terms. Upon termination, your right to use the Service will immediately cease.

All provisions of these Terms that by their nature should survive termination shall survive, including ownership provisions, warranty disclaimers, indemnity, and limitations of liability.`,
  },
  {
    title: "10. Changes to Terms",
    body: `We reserve the right to modify these Terms at any time. We will provide notice of significant changes by updating the "Last updated" date at the top of this page and, where appropriate, by notifying you via email or through the Service.

Your continued use of the Service after any changes constitutes your acceptance of the new Terms. If you do not agree to the modified Terms, you must stop using the Service.`,
  },
  {
    title: "11. Contact",
    body: `If you have any questions about these Terms of Service, please contact us at:

MasterChef Support Team
Email: support@masterchef.app
Address: 1234 Culinary Avenue, Montreal, QC H3A 0G4, Canada

We aim to respond to all inquiries within 2 business days.`,
  },
];

export default function TermsOfService() {
  return (
    <div className="w-full h-auto flex flex-col gap-10 items-center justify-start p-5 py-6 relative">
      <div className="option-group w-full py-3 flex flex-col gap-5 px-3">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <label className="pointer-events-none select-none text-xl text-left font-bold text-accent">
              Terms of Service
            </label>
            <Badge className="bg-secondary/60 text-muted-foreground border border-border/60 text-xs font-normal">
              Last updated: April 10, 2026
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">
            Please read these terms carefully before using MasterChef.
          </p>
        </div>

        <div className="flex gap-2 items-center mt-5">
          <ScrollText size={20} className="text-accent/80" />
          <label className="pointer-events-none select-none text-foreground/90 text-base font-semibold ml-1">
            Agreement
          </label>
        </div>
      </div>

      <div className="option-group w-full flex flex-col gap-4 px-3 pb-10">
        {SECTIONS.map((section) => (
          <div
            key={section.title}
            className="w-full flex flex-col gap-3 bg-linear-to-br from-secondary/5 to-secondary/60 border border-border/70 rounded-2xl px-8 py-6"
          >
            <span className="text-foreground/90 text-sm font-bold tracking-wide">
              {section.title}
            </span>
            <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
              {section.body}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
