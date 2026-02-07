import { Header } from './Header';
import { Footer } from './Footer';
import { SEO } from './SEO';

export function TermsOfService(): React.JSX.Element {
  return (
    <div className="min-h-screen bg-brand-background flex flex-col">
      <SEO
        title="Terms of Service"
        description="Read the terms and conditions for using CircleOverwatch, the UK's real-time threat intelligence and security monitoring platform."
        canonical="/terms"
      />
      <Header />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card">
          <h1 className="text-4xl md:text-5xl font-bold text-brand-text mb-4">Terms of Service</h1>
          <p className="text-brand-textGrey mb-8">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <div className="space-y-8 text-brand-textGrey">
            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-brand-text mb-4">1. Acceptance of Terms</h2>
              <p className="mb-4 leading-relaxed">
                By accessing, browsing, or using Circle Overwatch ("the Service", "we", "us", or "our"),
                including our website, mobile application, and any related services, you acknowledge that
                you have read, understood, and agree to be bound by these Terms of Service ("Terms").
              </p>
              <p className="mb-4 leading-relaxed">
                If you do not agree to these Terms, you must not access or use the Service. Your continued
                use of the Service following the posting of any changes to these Terms constitutes acceptance
                of those changes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-brand-text mb-4">2. Description of Service</h2>
              <p className="mb-4 leading-relaxed">
                Circle Overwatch provides real-time monitoring and assessment of security threats, crime
                patterns, weather risks, and related intelligence across the United Kingdom. Our platform
                aggregates data from official government agencies, law enforcement sources, and trusted
                partners to provide users with situational awareness.
              </p>
              <p className="mb-4 leading-relaxed">
                Key features include:
              </p>
              <ul className="list-disc list-inside mb-4 space-y-2 ml-4">
                <li>Real-time crime and incident mapping</li>
                <li>Weather alerts and severe weather warnings</li>
                <li>Community-reported incidents</li>
                <li>Historical crime statistics and trends</li>
                <li>Push notifications for alerts in your area</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-brand-text mb-4">3. Eligibility</h2>
              <p className="mb-4 leading-relaxed">
                To use Circle Overwatch, you must:
              </p>
              <ul className="list-disc list-inside mb-4 space-y-2 ml-4">
                <li>Be at least 13 years of age</li>
                <li>Be located in the United Kingdom</li>
                <li>Have the legal capacity to enter into a binding agreement</li>
                <li>Not be prohibited from using the Service under applicable laws</li>
              </ul>
              <p className="mb-4 leading-relaxed">
                If you are using the Service on behalf of an organization, you represent and warrant that
                you have the authority to bind that organization to these Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-brand-text mb-4">4. User Accounts</h2>

              <h3 className="text-xl md:text-2xl font-bold text-brand-primary mb-3 mt-6">Account Registration</h3>
              <p className="mb-4 leading-relaxed">
                To access certain features of the Service, you may be required to create an account. When
                creating an account, you agree to:
              </p>
              <ul className="list-disc list-inside mb-4 space-y-2 ml-4">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and promptly update your account information</li>
                <li>Keep your password secure and confidential</li>
                <li>Not share your account credentials with any third party</li>
                <li>Notify us immediately of any unauthorized access to your account</li>
              </ul>

              <h3 className="text-xl md:text-2xl font-bold text-brand-primary mb-3 mt-6">Account Security</h3>
              <p className="mb-4 leading-relaxed">
                You are responsible for all activities that occur under your account. Circle Overwatch will
                not be liable for any loss or damage arising from unauthorized use of your account. We
                reserve the right to suspend or terminate accounts that we reasonably believe have been
                compromised.
              </p>
            </section>

            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-brand-text mb-4">5. Acceptable Use</h2>
              <p className="mb-4 leading-relaxed">
                You agree to use the Service only for lawful purposes and in accordance with these Terms.
                You agree not to:
              </p>
              <ul className="list-disc list-inside mb-4 space-y-2 ml-4">
                <li>Use the Service in any way that violates applicable laws or regulations</li>
                <li>Transmit false, misleading, or fraudulent information through the Service</li>
                <li>Attempt to interfere with or disrupt the Service or its servers</li>
                <li>Attempt to gain unauthorized access to any part of the Service</li>
                <li>Use automated systems or software to extract data from the Service (scraping)</li>
                <li>Use the Service to harass, abuse, or harm another person</li>
                <li>Impersonate any person or entity or misrepresent your affiliation</li>
                <li>Use the Service for any commercial purpose without our prior written consent</li>
                <li>Reproduce, distribute, or create derivative works from the Service</li>
                <li>Reverse engineer or attempt to extract source code from the Service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-brand-text mb-4">6. User-Generated Content</h2>
              <p className="mb-4 leading-relaxed">
                Circle Overwatch may allow users to submit reports, comments, or other content ("User Content").
                By submitting User Content, you:
              </p>
              <ul className="list-disc list-inside mb-4 space-y-2 ml-4">
                <li>Grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify,
                    and display your User Content in connection with the Service</li>
                <li>Represent that you own or have the necessary rights to submit the content</li>
                <li>Agree that your content does not violate any third party's rights</li>
                <li>Acknowledge that we may remove any User Content at our sole discretion</li>
              </ul>
              <p className="mb-4 leading-relaxed">
                We reserve the right, but have no obligation, to monitor, edit, or remove User Content. We
                are not responsible for any User Content submitted by users.
              </p>
            </section>

            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-brand-text mb-4">7. Data Accuracy and Disclaimer</h2>
              <p className="mb-4 leading-relaxed">
                <strong className="text-brand-text">Important:</strong> While we strive to provide accurate and up-to-date
                information, Circle Overwatch makes no warranties, express or implied, regarding the accuracy,
                completeness, reliability, or timeliness of any data provided through the Service.
              </p>
              <p className="mb-4 leading-relaxed">
                The information provided by the Service:
              </p>
              <ul className="list-disc list-inside mb-4 space-y-2 ml-4">
                <li>Should not be used as the sole basis for emergency decisions</li>
                <li>Is not a substitute for professional advice or official emergency services</li>
                <li>May be subject to delays or inaccuracies from source data</li>
                <li>May not reflect real-time conditions in all cases</li>
              </ul>
              <p className="mb-4 leading-relaxed">
                <strong className="text-brand-text">In an emergency, always contact 999 or the appropriate
                emergency services directly.</strong>
              </p>
            </section>

            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-brand-text mb-4">8. Intellectual Property</h2>
              <p className="mb-4 leading-relaxed">
                The Service and its original content, features, and functionality are owned by Circle Overwatch
                and are protected by international copyright, trademark, patent, trade secret, and other
                intellectual property laws.
              </p>
              <p className="mb-4 leading-relaxed">
                The Circle Overwatch name, logo, and all related names, logos, product and service names,
                designs, and slogans are trademarks of Circle Overwatch. You may not use such marks without
                our prior written permission.
              </p>
            </section>

            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-brand-text mb-4">9. Third-Party Services</h2>
              <p className="mb-4 leading-relaxed">
                The Service may contain links to third-party websites or services that are not owned or
                controlled by Circle Overwatch. We have no control over and assume no responsibility for
                the content, privacy policies, or practices of any third-party websites or services.
              </p>
              <p className="mb-4 leading-relaxed">
                You acknowledge and agree that Circle Overwatch shall not be responsible or liable for any
                damage or loss caused by your use of any third-party services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-brand-text mb-4">10. Limitation of Liability</h2>
              <p className="mb-4 leading-relaxed">
                To the maximum extent permitted by applicable law, Circle Overwatch and its officers,
                directors, employees, agents, suppliers, and licensors shall not be liable for:
              </p>
              <ul className="list-disc list-inside mb-4 space-y-2 ml-4">
                <li>Any indirect, incidental, special, consequential, or punitive damages</li>
                <li>Any loss of profits, data, use, goodwill, or other intangible losses</li>
                <li>Any damages resulting from your access to or use of the Service</li>
                <li>Any damages resulting from unauthorized access to your account</li>
                <li>Any damages resulting from any content obtained from the Service</li>
              </ul>
              <p className="mb-4 leading-relaxed">
                In no event shall our total liability exceed the amount you have paid to us in the twelve
                (12) months prior to the claim, or £100, whichever is greater.
              </p>
            </section>

            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-brand-text mb-4">11. Disclaimer of Warranties</h2>
              <p className="mb-4 leading-relaxed">
                The Service is provided on an "AS IS" and "AS AVAILABLE" basis without warranties of any
                kind, either express or implied, including but not limited to:
              </p>
              <ul className="list-disc list-inside mb-4 space-y-2 ml-4">
                <li>Implied warranties of merchantability</li>
                <li>Fitness for a particular purpose</li>
                <li>Non-infringement</li>
                <li>Course of performance</li>
              </ul>
              <p className="mb-4 leading-relaxed">
                We do not warrant that the Service will be uninterrupted, secure, or error-free, that
                defects will be corrected, or that the Service is free of viruses or other harmful components.
              </p>
            </section>

            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-brand-text mb-4">12. Indemnification</h2>
              <p className="mb-4 leading-relaxed">
                You agree to defend, indemnify, and hold harmless Circle Overwatch and its officers, directors,
                employees, and agents from and against any claims, liabilities, damages, judgments, awards,
                losses, costs, or expenses arising out of or relating to:
              </p>
              <ul className="list-disc list-inside mb-4 space-y-2 ml-4">
                <li>Your use of the Service</li>
                <li>Your violation of these Terms</li>
                <li>Your violation of any third party's rights</li>
                <li>Any User Content you submit</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-brand-text mb-4">13. Modifications to Service</h2>
              <p className="mb-4 leading-relaxed">
                We reserve the right to modify, suspend, or discontinue the Service (or any part thereof)
                at any time, with or without notice. You agree that Circle Overwatch shall not be liable
                to you or any third party for any modification, suspension, or discontinuance of the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-brand-text mb-4">14. Changes to Terms</h2>
              <p className="mb-4 leading-relaxed">
                We may revise these Terms from time to time. The most current version will always be posted
                on our website. If a revision is material, we will provide at least 30 days' notice prior
                to any new terms taking effect.
              </p>
              <p className="mb-4 leading-relaxed">
                By continuing to access or use the Service after revisions become effective, you agree to
                be bound by the revised Terms. If you do not agree to the new Terms, you must stop using
                the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-brand-text mb-4">15. Termination</h2>
              <p className="mb-4 leading-relaxed">
                We may terminate or suspend your account and access to the Service immediately, without
                prior notice or liability, for any reason, including but not limited to:
              </p>
              <ul className="list-disc list-inside mb-4 space-y-2 ml-4">
                <li>Breach of these Terms</li>
                <li>Fraudulent, abusive, or illegal activity</li>
                <li>Extended periods of inactivity</li>
                <li>Request by law enforcement or government agencies</li>
              </ul>
              <p className="mb-4 leading-relaxed">
                Upon termination, your right to use the Service will immediately cease. All provisions of
                these Terms which by their nature should survive termination shall survive, including
                ownership provisions, warranty disclaimers, indemnity, and limitations of liability.
              </p>
            </section>

            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-brand-text mb-4">16. Governing Law</h2>
              <p className="mb-4 leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of England and
                Wales, without regard to its conflict of law provisions. You agree to submit to the
                exclusive jurisdiction of the courts located in England and Wales.
              </p>
            </section>

            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-brand-text mb-4">17. Dispute Resolution</h2>
              <p className="mb-4 leading-relaxed">
                In the event of any dispute arising out of or in connection with these Terms, we encourage
                you to first contact us directly to seek a resolution. If we cannot resolve the dispute
                informally, either party may pursue formal legal proceedings in accordance with the
                Governing Law section above.
              </p>
            </section>

            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-brand-text mb-4">18. Severability</h2>
              <p className="mb-4 leading-relaxed">
                If any provision of these Terms is held to be invalid or unenforceable, the remaining
                provisions shall continue in full force and effect. The invalid or unenforceable provision
                shall be modified to reflect the parties' intention as closely as possible.
              </p>
            </section>

            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-brand-text mb-4">19. Entire Agreement</h2>
              <p className="mb-4 leading-relaxed">
                These Terms, together with our Privacy Policy, constitute the entire agreement between you
                and Circle Overwatch regarding the Service and supersede all prior agreements, communications,
                and proposals, whether oral or written.
              </p>
            </section>

            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-brand-text mb-4">20. Contact Information</h2>
              <p className="mb-4 leading-relaxed">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <p className="mb-4 leading-relaxed">
                Email: <a href="mailto:info@overwatch-app.com" className="text-brand-primary hover:text-brand-secondary underline">info@overwatch-app.com</a>
              </p>
              <p className="mb-4 leading-relaxed">
                We aim to respond to all inquiries within 48 hours during business days.
              </p>
            </section>

            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-brand-text mb-4">Summary of Key Points</h2>
              <ul className="list-disc list-inside mb-4 space-y-2 ml-4">
                <li>You must be at least 13 years old and located in the UK to use the Service</li>
                <li>You are responsible for maintaining the security of your account</li>
                <li>The Service provides informational data only and should not replace emergency services</li>
                <li>We are not liable for decisions made based on information from the Service</li>
                <li>We may modify or terminate the Service at any time</li>
                <li>These Terms are governed by the laws of England and Wales</li>
                <li>Contact us at <a href="mailto:info@overwatch-app.com" className="text-brand-primary hover:text-brand-secondary underline">info@overwatch-app.com</a> with questions</li>
              </ul>
              <p className="mb-4 leading-relaxed font-semibold">
                By using Circle Overwatch, you acknowledge that you have read and understood these Terms of Service.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
