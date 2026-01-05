import Link from 'next/link';
import { Footer } from '@/components/footer';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 max-w-4xl mx-auto px-4 py-8 md:py-16">
        <Link
          href="/auth/login"
          className="inline-block mb-8 text-gray-400 hover:text-white transition-colors"
        >
          ← Back to Login
        </Link>

        <h1 className="text-4xl font-bold mb-8 text-gradient">Privacy Policy</h1>

        <div className="prose prose-invert max-w-none space-y-6 text-gray-300">
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">1. Introduction</h2>
            <p>
              FocusDock ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">2. Information We Collect</h2>
            <h3 className="text-xl font-semibold mb-3 text-white mt-4">2.1 Account Information</h3>
            <p>When you register for an account, we collect:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Email address</li>
              <li>Password (stored securely using encryption)</li>
              <li>Profile information you choose to provide</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 text-white mt-4">2.2 Third-Party Integration Data</h3>
            <p>When you connect third-party services, we collect:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>GitHub:</strong> Access tokens, commit data, repository information</li>
              <li><strong>Spotify:</strong> Access tokens, refresh tokens, listening history, artist data</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 text-white mt-4">2.3 Usage Data</h3>
            <p>We automatically collect information about how you use the Service, including:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Work session data and focus time</li>
              <li>Feature usage and preferences</li>
              <li>Device information and browser type</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">3. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide, maintain, and improve the Service</li>
              <li>Process transactions and manage subscriptions</li>
              <li>Send you technical notices and support messages</li>
              <li>Respond to your comments and questions</li>
              <li>Monitor and analyze usage patterns</li>
              <li>Detect, prevent, and address technical issues</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">4. Data Storage and Security</h2>
            <p>
              We use industry-standard security measures to protect your information:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Data is encrypted in transit using SSL/TLS</li>
              <li>Passwords are hashed using secure algorithms</li>
              <li>Access tokens are stored securely and encrypted</li>
              <li>Regular security audits and updates</li>
            </ul>
            <p className="mt-4">
              However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your information, we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">5. Third-Party Services</h2>
            <p>
              The Service integrates with third-party services (GitHub, Spotify, Stripe). When you connect these services:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>We access only the data necessary to provide the Service</li>
              <li>Your data is subject to the privacy policies of these third-party services</li>
              <li>You can disconnect these services at any time through your account settings</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">6. Data Sharing and Disclosure</h2>
            <p>We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Service Providers:</strong> With trusted third-party service providers who assist in operating our Service (e.g., hosting, payment processing)</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">7. Your Rights and Choices</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access and update your account information</li>
              <li>Delete your account and associated data</li>
              <li>Disconnect third-party integrations</li>
              <li>Opt out of certain data collection (where applicable)</li>
              <li>Request a copy of your data</li>
            </ul>
            <p className="mt-4">
              To exercise these rights, please contact us at{' '}
              <a
                href="mailto:habab@hanablabs.info"
                className="text-purple-400 hover:text-purple-300 underline"
              >
                habab@hanablabs.info
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">8. Cookies and Tracking</h2>
            <p>
              We use cookies and similar tracking technologies to track activity on our Service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">9. Children's Privacy</h2>
            <p>
              Our Service is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">10. International Data Transfers</h2>
            <p>
              Your information may be transferred to and maintained on computers located outside of your state, province, country, or other governmental jurisdiction where data protection laws may differ. By using the Service, you consent to the transfer of your information to our facilities and those third parties with whom we share it as described in this policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">11. Changes to This Privacy Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">12. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at{' '}
              <a
                href="mailto:habab@hanablabs.info"
                className="text-purple-400 hover:text-purple-300 underline"
              >
                habab@hanablabs.info
              </a>
            </p>
          </section>

          <section>
            <p className="text-sm text-gray-400 mt-8">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}

