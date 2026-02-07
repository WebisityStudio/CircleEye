import { Header } from './Header';
import { Footer } from './Footer';
import { SEO } from './SEO';

export function PrivacyPolicy(): React.JSX.Element {
  return (
    <div className="min-h-screen bg-brand-background flex flex-col">
      <SEO
        title="Privacy Policy"
        description="Learn how CircleOverwatch collects, uses, and protects your personal information. Our privacy policy explains data handling for UK users."
        canonical="/privacy"
      />
      <Header />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card">
          <h1 className="text-4xl md:text-5xl font-bold text-brand-text mb-4">Privacy Policy</h1>
          <p className="text-brand-textGrey mb-8">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <div className="space-y-8 text-brand-textGrey">
            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-brand-text mb-4">Introduction</h2>
              <p className="mb-4 leading-relaxed">
                Welcome to Circle Overwatch ("we," "our," or "us"). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the application.
              </p>
              <p className="mb-4 leading-relaxed">
                We reserve the right to make changes to this Privacy Policy at any time and for any reason. We will alert you about any changes by updating the "Last updated" date of this Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-brand-text mb-4">Geographic Availability</h2>
              <p className="mb-4 leading-relaxed">
                Circle Overwatch is currently available only to users in the United Kingdom. By using this app, you confirm that you are located in the UK. If you are located outside the UK, please do not use this application.
              </p>
            </section>

            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-brand-text mb-4">Important Disclaimer</h2>
              <p className="mb-4 leading-relaxed">
                Circle Overwatch is provided for informational purposes. While we strive to provide accurate and useful information, the application should not be relied upon as the sole basis for making important decisions. Users should verify information and consult with appropriate professionals when making decisions based on app content.
              </p>
            </section>

            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-brand-text mb-4">Information We Collect</h2>
              
              <h3 className="text-xl md:text-2xl font-bold text-brand-primary mb-3 mt-6">Personal Information</h3>
              <p className="mb-4 leading-relaxed">
                We may collect personal information that you voluntarily provide to us when you:
              </p>
              <ul className="list-disc list-inside mb-4 space-y-2 ml-4">
                <li>Register for an account</li>
                <li>Use the application features</li>
                <li>Contact us for support</li>
                <li>Subscribe to notifications</li>
              </ul>
              <p className="mb-4 leading-relaxed">
                This information may include:
              </p>
              <ul className="list-disc list-inside mb-4 space-y-2 ml-4">
                <li>Name</li>
                <li>Email address</li>
                <li>Phone number</li>
                <li>Profile information</li>
                <li>Location data (with your permission)</li>
                <li>Any other information you choose to provide</li>
              </ul>

              <h3 className="text-xl md:text-2xl font-bold text-brand-primary mb-3 mt-6">Usage Data</h3>
              <p className="mb-4 leading-relaxed">
                We automatically collect certain information when you use our app, including:
              </p>
              <ul className="list-disc list-inside mb-4 space-y-2 ml-4">
                <li>Device information (device model, operating system, unique device identifiers)</li>
                <li>IP address</li>
                <li>Browser type and version</li>
                <li>App usage patterns (features used, screens viewed, time spent)</li>
                <li>Access times and dates</li>
                <li>Crash reports and performance data</li>
              </ul>

              <h3 className="text-xl md:text-2xl font-bold text-brand-primary mb-3 mt-6">Location Information</h3>
              <p className="mb-4 leading-relaxed">
                With your explicit permission, we may collect and process location information to provide location-based features. You can enable or disable location services at any time through your device settings or within the app.
              </p>

              <h3 className="text-xl md:text-2xl font-bold text-brand-primary mb-3 mt-6">Cookies and Tracking Technologies</h3>
              <p className="mb-4 leading-relaxed">
                We may use cookies, beacons, and similar tracking technologies to collect information about your activity on our app. You can control cookie preferences through your device settings.
              </p>
            </section>

            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-brand-text mb-4">Analytics and Tracking</h2>
              <p className="mb-4 leading-relaxed">
                We use Google Analytics for Firebase to understand how users interact with our app and improve user experience. This service collects:
              </p>
              <ul className="list-disc list-inside mb-4 space-y-2 ml-4">
                <li>Device information (model, OS version, device ID)</li>
                <li>App usage data (screens viewed, features used, session duration)</li>
                <li>General location data (country/city level)</li>
                <li>User interaction patterns and behaviors</li>
                <li>Crash reports and performance data</li>
                <li>App install and update events</li>
              </ul>
              <p className="mb-4 leading-relaxed">
                We do not share personally identifiable information with analytics providers without appropriate safeguards. The data collected is used solely to:
              </p>
              <ul className="list-disc list-inside mb-4 space-y-2 ml-4">
                <li>Improve app performance and user experience</li>
                <li>Understand feature usage and preferences</li>
                <li>Identify and fix bugs and crashes</li>
                <li>Develop new features based on user behavior</li>
                <li>Analyze app stability and performance</li>
              </ul>
              <p className="mb-4 leading-relaxed">
                Firebase Analytics data is processed by Google in accordance with their privacy policies. You can opt out of analytics tracking in the app settings at any time.
              </p>
              <p className="mb-4 leading-relaxed">
                For more information about Firebase and Google's privacy practices, visit:
              </p>
              <ul className="list-disc list-inside mb-4 space-y-2 ml-4">
                <li>Firebase Privacy: <a href="https://firebase.google.com/support/privacy" target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:text-brand-secondary underline">https://firebase.google.com/support/privacy</a></li>
                <li>Google Privacy Policy: <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:text-brand-secondary underline">https://policies.google.com/privacy</a></li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-brand-text mb-4">Data Storage and Security</h2>
              
              <h3 className="text-xl md:text-2xl font-bold text-brand-primary mb-3 mt-6">Data Storage</h3>
              <p className="mb-4 leading-relaxed">
                We use Supabase as our primary database and backend infrastructure provider. Your data is:
              </p>
              <ul className="list-disc list-inside mb-4 space-y-2 ml-4">
                <li>Encrypted in transit using industry-standard SSL/TLS protocols</li>
                <li>Encrypted at rest on secure servers</li>
                <li>Stored on servers located in the European Union (to ensure proximity to UK users)</li>
                <li>Backed up regularly to prevent data loss</li>
                <li>Protected by enterprise-grade security measures</li>
              </ul>
              <p className="mb-4 leading-relaxed">
                For more information about Supabase's security practices, visit: <a href="https://supabase.com/security" target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:text-brand-secondary underline">https://supabase.com/security</a>
              </p>

              <h3 className="text-xl md:text-2xl font-bold text-brand-primary mb-3 mt-6">Data Retention</h3>
              <p className="mb-4 leading-relaxed">
                We retain your personal information for as long as necessary to:
              </p>
              <ul className="list-disc list-inside mb-4 space-y-2 ml-4">
                <li>Provide you with our services</li>
                <li>Comply with legal obligations</li>
                <li>Resolve disputes and enforce our agreements</li>
              </ul>
              <p className="mb-4 leading-relaxed">
                You may request deletion of your account and associated data at any time. Upon deletion request, we will remove your personal information within 30 days, except where we are required to retain it for legal or legitimate business purposes.
              </p>

              <h3 className="text-xl md:text-2xl font-bold text-brand-primary mb-3 mt-6">Security Measures</h3>
              <p className="mb-4 leading-relaxed">
                We implement appropriate technical and organizational security measures to protect your personal information, including:
              </p>
              <ul className="list-disc list-inside mb-4 space-y-2 ml-4">
                <li>Encryption of data in transit and at rest</li>
                <li>Secure authentication mechanisms</li>
                <li>Regular security assessments</li>
                <li>Access controls and authentication requirements</li>
                <li>Monitoring for security breaches</li>
              </ul>
              <p className="mb-4 leading-relaxed">
                However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to protect your personal information, we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-brand-text mb-4">How We Use Your Information</h2>
              <p className="mb-4 leading-relaxed">
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside mb-4 space-y-2 ml-4">
                <li>Provide, operate, and maintain our application</li>
                <li>Improve, personalize, and expand our application features</li>
                <li>Understand and analyze how you use our application</li>
                <li>Develop new features, products, and functionality</li>
                <li>Communicate with you for customer service and support</li>
                <li>Send you updates, notifications, and other information related to the app</li>
                <li>Process your requests and transactions</li>
                <li>Find and prevent fraud, abuse, and security incidents</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-brand-text mb-4">Data Sharing and Disclosure</h2>
              <p className="mb-4 leading-relaxed">
                We do not sell your personal information to third parties. We may share your information in the following situations:
              </p>

              <h3 className="text-xl md:text-2xl font-bold text-brand-primary mb-3 mt-6">Service Providers</h3>
              <p className="mb-4 leading-relaxed">
                We may share your information with third-party service providers who perform services on our behalf, including:
              </p>
              <ul className="list-disc list-inside mb-4 space-y-2 ml-4">
                <li>Cloud hosting providers (Supabase)</li>
                <li>Analytics providers (Google Analytics for Firebase)</li>
                <li>Customer support tools</li>
                <li>Email service providers</li>
              </ul>
              <p className="mb-4 leading-relaxed">
                These service providers are contractually obligated to protect your information and use it only for the purposes we specify.
              </p>

              <h3 className="text-xl md:text-2xl font-bold text-brand-primary mb-3 mt-6">Legal Requirements</h3>
              <p className="mb-4 leading-relaxed">
                We may disclose your information if required to do so by law or in response to:
              </p>
              <ul className="list-disc list-inside mb-4 space-y-2 ml-4">
                <li>Valid legal requests from law enforcement or government authorities</li>
                <li>Court orders or subpoenas</li>
                <li>Legal processes or investigations</li>
              </ul>

              <h3 className="text-xl md:text-2xl font-bold text-brand-primary mb-3 mt-6">Protection of Rights</h3>
              <p className="mb-4 leading-relaxed">
                We may disclose your information to:
              </p>
              <ul className="list-disc list-inside mb-4 space-y-2 ml-4">
                <li>Protect our rights, property, or safety</li>
                <li>Protect the rights, property, or safety of our users</li>
                <li>Prevent fraud or abuse</li>
                <li>Enforce our Terms of Service</li>
              </ul>

              <h3 className="text-xl md:text-2xl font-bold text-brand-primary mb-3 mt-6">Business Transfers</h3>
              <p className="mb-4 leading-relaxed">
                If we are involved in a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction. We will notify you via email and/or prominent notice in the app before your information is transferred and becomes subject to a different privacy policy.
              </p>

              <h3 className="text-xl md:text-2xl font-bold text-brand-primary mb-3 mt-6">With Your Consent</h3>
              <p className="mb-4 leading-relaxed">
                We may share your information for any other purpose with your explicit consent.
              </p>
            </section>

            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-brand-text mb-4">Your Privacy Rights</h2>
              <p className="mb-4 leading-relaxed">
                Depending on your location, you may have certain rights regarding your personal information:
              </p>

              <h3 className="text-xl md:text-2xl font-bold text-brand-primary mb-3 mt-6">General Rights</h3>
              <ul className="list-disc list-inside mb-4 space-y-2 ml-4">
                <li>Right to Access: You can request a copy of the personal information we hold about you</li>
                <li>Right to Rectification: You can request correction of inaccurate or incomplete information</li>
                <li>Right to Deletion: You can request deletion of your personal information (subject to legal obligations)</li>
                <li>Right to Restriction: You can request restriction of processing of your information</li>
                <li>Right to Data Portability: You can request a copy of your data in a machine-readable format</li>
                <li>Right to Object: You can object to certain types of processing</li>
                <li>Right to Withdraw Consent: You can withdraw consent at any time where processing is based on consent</li>
              </ul>

              <h3 className="text-xl md:text-2xl font-bold text-brand-primary mb-3 mt-6">United Kingdom Residents (UK GDPR)</h3>
              <p className="mb-4 leading-relaxed">
                As a UK-based service, we comply with the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018. You have the following rights:
              </p>
              <ul className="list-disc list-inside mb-4 space-y-2 ml-4">
                <li>Right to Access: You can request a copy of the personal information we hold about you</li>
                <li>Right to Rectification: You can request correction of inaccurate or incomplete information</li>
                <li>Right to Erasure: You can request deletion of your personal information (subject to legal obligations)</li>
                <li>Right to Restrict Processing: You can request restriction of processing of your information</li>
                <li>Right to Data Portability: You can request a copy of your data in a machine-readable format</li>
                <li>Right to Object: You can object to certain types of processing, including direct marketing</li>
                <li>Right to Withdraw Consent: You can withdraw consent at any time where processing is based on consent</li>
                <li>Right to Lodge a Complaint: You have the right to lodge a complaint with the Information Commissioner's Office (ICO)</li>
              </ul>
              <p className="mb-4 leading-relaxed">
                Legal Basis for Processing:
              </p>
              <p className="mb-4 leading-relaxed">
                We process your personal information based on:
              </p>
              <ul className="list-disc list-inside mb-4 space-y-2 ml-4">
                <li>Consent: For optional features like location tracking and marketing communications</li>
                <li>Contract Performance: To provide app services you've signed up for</li>
                <li>Legitimate Interests: To improve our services, prevent fraud, and ensure security</li>
                <li>Legal Obligations: To comply with UK laws and regulations</li>
              </ul>
              <p className="mb-4 leading-relaxed">
                ICO Contact Information:
              </p>
              <p className="mb-4 leading-relaxed">
                If you wish to raise a concern about our use of your information, you can contact the Information Commissioner's Office:
              </p>
              <ul className="list-disc list-inside mb-4 space-y-2 ml-4">
                <li>Website: <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:text-brand-secondary underline">https://ico.org.uk</a></li>
                <li>Phone: 0303 123 1113</li>
                <li>Address: Information Commissioner's Office, Wycliffe House, Water Lane, Wilmslow, Cheshire, SK9 5AF</li>
              </ul>

              <h3 className="text-xl md:text-2xl font-bold text-brand-primary mb-3 mt-6">How to Exercise Your Rights</h3>
              <p className="mb-4 leading-relaxed">
                To exercise any of these rights, please contact us at <a href="mailto:info@overwatch-app.com" className="text-brand-primary hover:text-brand-secondary underline">info@overwatch-app.com</a>. We will respond to your request within 30 days (or as required by applicable law).
              </p>
            </section>

            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-brand-text mb-4">Marketing Communications</h2>
              <p className="mb-4 leading-relaxed">
                If you wish to opt out of receiving marketing communications from us, you can:
              </p>
              <ul className="list-disc list-inside mb-4 space-y-2 ml-4">
                <li>Click the "unsubscribe" link in any marketing email</li>
                <li>Contact us at <a href="mailto:info@overwatch-app.com" className="text-brand-primary hover:text-brand-secondary underline">info@overwatch-app.com</a></li>
                <li>Adjust your notification preferences in the app settings</li>
              </ul>
              <p className="mb-4 leading-relaxed">
                Please note that even if you opt out of marketing communications, we may still send you non-promotional messages related to your account and our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-brand-text mb-4">Children's Privacy</h2>
              <p className="mb-4 leading-relaxed">
                Our application is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us at <a href="mailto:info@overwatch-app.com" className="text-brand-primary hover:text-brand-secondary underline">info@overwatch-app.com</a>. If we discover that we have collected personal information from a child under 13, we will take steps to delete that information as quickly as possible.
              </p>
            </section>

            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-brand-text mb-4">Third-Party Links and Services</h2>
              <p className="mb-4 leading-relaxed">
                Our application may contain links to third-party websites, services, or applications that are not owned or controlled by us. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites or services.
              </p>
              <p className="mb-4 leading-relaxed">
                We strongly advise you to review the privacy policy of every third-party site or service you visit or use. This includes:
              </p>
              <ul className="list-disc list-inside mb-4 space-y-2 ml-4">
                <li>Social media platforms</li>
                <li>Payment processors</li>
                <li>External websites linked from our app</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-brand-text mb-4">International Data Transfers</h2>
              <p className="mb-4 leading-relaxed">
                While our service is UK-only, some of our service providers (such as Google Firebase) may process data outside the UK. When your information is transferred internationally, we ensure that appropriate safeguards are in place to protect your information in accordance with UK GDPR requirements, including:
              </p>
              <ul className="list-disc list-inside mb-4 space-y-2 ml-4">
                <li>Standard contractual clauses approved by the UK authorities</li>
                <li>Adequacy decisions recognizing that the destination country provides adequate protection</li>
                <li>Other legally recognized transfer mechanisms under UK law</li>
              </ul>
              <p className="mb-4 leading-relaxed">
                Firebase/Google: Data may be processed in the United States and other countries where Google operates. Google complies with the EU-US Data Privacy Framework and provides appropriate safeguards for data transfers.
              </p>
              <p className="mb-4 leading-relaxed">
                Supabase: We configure our Supabase instance to store data within the European Union to minimize international transfers.
              </p>
            </section>

            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-brand-text mb-4">Changes to This Privacy Policy</h2>
              <p className="mb-4 leading-relaxed">
                We may update our Privacy Policy from time to time. We will notify you of any material changes by:
              </p>
              <ul className="list-disc list-inside mb-4 space-y-2 ml-4">
                <li>Posting the new Privacy Policy on this page</li>
                <li>Updating the "Last updated" date at the top</li>
                <li>Sending you an email notification (if you have provided your email address)</li>
                <li>Displaying an in-app notification</li>
              </ul>
              <p className="mb-4 leading-relaxed">
                You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
              </p>
              <p className="mb-4 leading-relaxed">
                Your continued use of the app after any changes to this Privacy Policy constitutes your acceptance of such changes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-brand-text mb-4">Data Breach Notification</h2>
              <p className="mb-4 leading-relaxed">
                In the event of a data breach that affects your personal information, we will notify you and relevant authorities as required by applicable law. Notifications will be made without undue delay and will include:
              </p>
              <ul className="list-disc list-inside mb-4 space-y-2 ml-4">
                <li>The nature of the breach</li>
                <li>The types of information affected</li>
                <li>Steps we are taking to address the breach</li>
                <li>Recommendations for protecting your information</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-brand-text mb-4">Contact Us</h2>
              <p className="mb-4 leading-relaxed">
                If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
              </p>
              <p className="mb-4 leading-relaxed">
                Email: <a href="mailto:info@overwatch-app.com" className="text-brand-primary hover:text-brand-secondary underline">info@overwatch-app.com</a>
              </p>
              <p className="mb-4 leading-relaxed">
                Response Time: We aim to respond to all inquiries within 48 hours during business days.
              </p>
              <p className="mb-4 leading-relaxed">
                For data protection inquiries specifically, please include "Privacy Request" or "Data Subject Request" in your email subject line. We will respond to data subject requests within one month as required by UK GDPR.
              </p>
            </section>

            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-brand-text mb-4">Summary of Key Points</h2>
              <ul className="list-disc list-inside mb-4 space-y-2 ml-4">
                <li>Circle Overwatch is currently available only to users in the United Kingdom</li>
                <li>We collect personal information you provide and usage data automatically</li>
                <li>We use Google Analytics for Firebase for analytics and Supabase for data storage</li>
                <li>Your data is stored in the European Union</li>
                <li>We comply with UK GDPR and Data Protection Act 2018</li>
                <li>We do not sell your personal information</li>
                <li>You have the right to access, correct, delete, and port your data</li>
                <li>You can lodge complaints with the ICO</li>
                <li>Our app is not intended for children under 13</li>
                <li>You can contact us at <a href="mailto:info@overwatch-app.com" className="text-brand-primary hover:text-brand-secondary underline">info@overwatch-app.com</a> for any privacy concerns</li>
              </ul>
              <p className="mb-4 leading-relaxed font-semibold">
                By using Circle Overwatch, you acknowledge that you have read and understood this Privacy Policy.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
