import Link from 'next/link';
import { Footer } from '@/components/footer';

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 max-w-4xl mx-auto px-4 py-8 md:py-16">
        <Link
          href="/auth/login"
          className="inline-block mb-8 text-gray-400 hover:text-white transition-colors"
        >
          ← Back to Login
        </Link>

        <h1 className="text-4xl font-bold mb-8 text-gradient">Terms of Service</h1>

        <div className="prose prose-invert max-w-none space-y-6 text-gray-300">
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">1. Acceptance of Terms</h2>
            <p>
              By accessing and using FocusDock, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">2. Description of Service</h2>
            <p>
              FocusDock is a developer dashboard application that visualizes your development journey through GitHub commits, work hours tracking, and Spotify listening data. The Service provides tools for tracking and analyzing your coding activity and productivity.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">3. User Accounts</h2>
            <p>
              To use certain features of the Service, you must register for an account. You agree to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide accurate, current, and complete information during registration</li>
              <li>Maintain and update your information to keep it accurate, current, and complete</li>
              <li>Maintain the security of your password and identification</li>
              <li>Accept all responsibility for activities that occur under your account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">4. Subscription and Payment</h2>
            <p>
              FocusDock offers both free and paid subscription plans. Paid subscriptions are billed on a monthly or lifetime basis. By subscribing to a paid plan, you agree to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Pay all fees associated with your subscription</li>
              <li>Automatic renewal for monthly subscriptions unless cancelled</li>
              <li>No refunds for monthly subscriptions or lifetime purchases except as required by law</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">5. Third-Party Integrations</h2>
            <p>
              The Service integrates with third-party services including GitHub and Spotify. By connecting these services, you:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Authorize FocusDock to access your data from these services</li>
              <li>Agree to comply with the terms of service of these third-party providers</li>
              <li>Understand that FocusDock is not responsible for the availability or accuracy of third-party services</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">6. User Content and Data</h2>
            <p>
              You retain ownership of all data you provide to the Service. By using the Service, you grant FocusDock a license to use, store, and process your data solely for the purpose of providing the Service to you.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">7. Prohibited Uses</h2>
            <p>You may not use the Service:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
              <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
              <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
              <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
              <li>To submit false or misleading information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">8. Service Availability</h2>
            <p>
              We reserve the right to withdraw or amend the Service, and any service or material we provide, in our sole discretion without notice. We will not be liable if, for any reason, all or any part of the Service is unavailable at any time or for any period.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">9. Limitation of Liability</h2>
            <p>
              In no event shall FocusDock, its directors, employees, or agents be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">10. Termination</h2>
            <p>
              We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">11. Changes to Terms</h2>
            <p>
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">12. Contact Information</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us at{' '}
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

