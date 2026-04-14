import { Badge } from "@/components/ui/badge";
import { ShieldCheck } from "lucide-react";

const SECTIONS = [
  {
    title: "1. Information We Collect",
    body: `We collect information you provide directly to us when you create an account, update your profile, or interact with the Service. This includes your name, email address, age, dietary preferences, allergies, and cooking skill level.

We also collect usage data automatically, such as the pages you visit, features you use, recipes you save, and your meal planning activity. This information is collected through cookies, log files, and similar tracking technologies.

We may collect device information including your IP address, browser type, operating system, and referring URLs to help us improve the Service.`,
  },
  {
    title: "2. How We Use Your Information",
    body: `We use the information we collect to: (a) provide, maintain, and improve the Service; (b) personalize your experience and serve tailored recipe recommendations based on your dietary preferences and skill level; (c) process and complete transactions; (d) send you technical notices and support messages; (e) respond to your comments and questions; and (f) monitor and analyze usage trends.

We may also use your information to detect and prevent fraudulent transactions and other illegal activities, and to protect the rights and property of MasterChef and others.`,
  },
  {
    title: "3. Information Sharing",
    body: `We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties without your consent, except in the following circumstances: (a) to trusted service providers who assist us in operating the Service, conducting our business, or serving you, so long as those parties agree to keep this information confidential; (b) to comply with legal obligations; or (c) to protect the rights, property, or safety of MasterChef, our users, or others.

Aggregated or de-identified information that cannot reasonably be used to identify you may be shared with partners for analytics, research, or marketing purposes.`,
  },
  {
    title: "4. Cookies & Tracking",
    body: `We use cookies and similar tracking technologies to track activity on the Service and to hold certain information. Cookies are files with a small amount of data that may include an anonymous unique identifier.

You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of the Service. We use session cookies to operate the Service and persistent cookies to remember your preferences, including your theme and language settings.`,
  },
  {
    title: "5. Data Retention",
    body: `We retain your personal information for as long as your account is active or as needed to provide you with the Service. If you wish to cancel your account or request that we no longer use your information, please contact us using the details below.

We will retain and use your information as necessary to comply with our legal obligations, resolve disputes, and enforce our agreements. We may retain anonymized or aggregated data for analytical purposes even after deleting your account.`,
  },
  {
    title: "6. Your Rights",
    body: `Depending on your location, you may have certain rights with respect to your personal information, including: (a) the right to access and receive a copy of the personal information we hold about you; (b) the right to request correction of inaccurate data; (c) the right to request deletion of your personal information; (d) the right to restrict or object to our processing of your information; and (e) the right to data portability.

To exercise any of these rights, please contact us at the address provided below. We will respond to your request within 30 days.`,
  },
  {
    title: "7. Data Security",
    body: `We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include encryption of data in transit and at rest, regular security assessments, and access controls.

However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your information, we cannot guarantee its absolute security.`,
  },
  {
    title: "8. Children's Privacy",
    body: `The Service is not directed to individuals under the age of 13, and we do not knowingly collect personal information from children under 13. If we become aware that a child under 13 has provided us with personal information, we will take steps to delete such information.

If you are a parent or guardian and you are aware that your child has provided us with personal information, please contact us so that we can take the necessary action.`,
  },
  {
    title: "9. Changes to This Policy",
    body: `We may update this Privacy Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any material changes by updating the "Last updated" date at the top of this page and, where required by law, by sending you a notification.

We encourage you to review this Privacy Policy periodically to stay informed about how we are protecting your information. Your continued use of the Service after any changes constitutes your acceptance of the updated policy.`,
  },
  {
    title: "10. Contact Us",
    body: `If you have any questions, concerns, or requests regarding this Privacy Policy or our privacy practices, please contact our Privacy Team at:

MasterChef Privacy Team
Email: privacy@masterchef.app
Address: 1234 Culinary Avenue, Montreal, QC H3A 0G4, Canada

You also have the right to lodge a complaint with your local data protection authority if you believe we have not adequately addressed your concerns.`,
  },
];

export default function PrivacyPolicy() {
  return (
    <div className="w-full h-auto flex flex-col gap-10 items-center justify-start p-5 py-6 relative">
      <div className="option-group w-full py-3 flex flex-col gap-5 px-3">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <label className="pointer-events-none select-none text-xl text-left font-bold text-accent">
              Privacy Policy
            </label>
            <Badge className="bg-secondary/60 text-muted-foreground border border-border/60 text-xs font-normal">
              Last updated: April 10, 2026
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">
            Your privacy matters to us. This policy explains how we collect, use, and protect your data.
          </p>
        </div>

        <div className="flex gap-2 items-center mt-5">
          <ShieldCheck size={20} className="text-accent/80" />
          <label className="pointer-events-none select-none text-foreground/90 text-base font-semibold ml-1">
            Our Commitment
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
