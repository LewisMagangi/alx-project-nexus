import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/70 border-b border-white/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">N</span>
              </div>
              <span className="text-2xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Nexus
              </span>
            </Link>
            <Link href="/legal">
              <Button variant="ghost">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Legal
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 md:p-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
          <p className="text-gray-500 mb-8">Last updated: December 1, 2025</p>

          <div className="prose prose-lg max-w-none text-gray-700">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
              <p className="mb-4">
                At Nexus, we are committed to protecting your privacy. This Privacy Policy explains how we collect, 
                use, disclose, and safeguard your information when you use our social networking platform.
              </p>
              <p>
                Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, 
                please do not access the platform.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>
              
              <h3 className="text-xl font-medium text-gray-800 mb-3">2.1 Information You Provide</h3>
              <p className="mb-4">We collect information that you voluntarily provide when you:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>Register an account:</strong> Username, email address, password</li>
                <li><strong>Complete your profile:</strong> Bio, location, website, profile picture</li>
                <li><strong>Create content:</strong> Posts, replies, direct messages, community posts</li>
                <li><strong>Interact with others:</strong> Likes, retweets, follows, bookmarks</li>
                <li><strong>Contact us:</strong> Support inquiries, feedback, reports</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mb-3">2.2 Information Collected Automatically</h3>
              <p className="mb-4">When you access our platform, we automatically collect:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>Device Information:</strong> Device type, operating system, browser type</li>
                <li><strong>Log Data:</strong> IP address, access times, pages viewed, referring URL</li>
                <li><strong>Usage Data:</strong> Features used, actions taken, time spent on platform</li>
                <li><strong>Location Data:</strong> General location based on IP address (not precise GPS)</li>
                <li><strong>Cookies:</strong> Session cookies, preference cookies, analytics cookies</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mb-3">2.3 Information from Third Parties</h3>
              <p className="mb-4">We may receive information from:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Social login providers (if you sign in with Google, GitHub, etc.)</li>
                <li>Analytics providers</li>
                <li>Other users (when they mention you or share your content)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
              <p className="mb-4">We use the information we collect to:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>Provide the Service:</strong> Create and manage your account, enable social features</li>
                <li><strong>Personalize Experience:</strong> Customize your feed, suggest users to follow</li>
                <li><strong>Communicate:</strong> Send notifications, updates, and support messages</li>
                <li><strong>Improve the Platform:</strong> Analyze usage patterns, fix bugs, develop new features</li>
                <li><strong>Ensure Safety:</strong> Detect and prevent fraud, abuse, and security threats</li>
                <li><strong>Comply with Law:</strong> Meet legal obligations and respond to legal requests</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Information Sharing</h2>
              <p className="mb-4">We may share your information in the following situations:</p>
              
              <h3 className="text-xl font-medium text-gray-800 mb-3">4.1 Public Content</h3>
              <p className="mb-4">
                Your posts, profile information, and interactions are public by default and can be seen by anyone. 
                Your username, bio, and profile picture are always visible to other users.
              </p>

              <h3 className="text-xl font-medium text-gray-800 mb-3">4.2 Service Providers</h3>
              <p className="mb-4">
                We share information with third-party vendors who perform services on our behalf, such as:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Cloud hosting and storage providers</li>
                <li>Analytics services</li>
                <li>Email service providers</li>
                <li>Customer support tools</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mb-3">4.3 Legal Requirements</h3>
              <p className="mb-4">
                We may disclose your information if required by law, or if we believe disclosure is necessary to:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Comply with legal obligations</li>
                <li>Protect our rights and property</li>
                <li>Prevent fraud or illegal activity</li>
                <li>Protect the safety of users or the public</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mb-3">4.4 Business Transfers</h3>
              <p>
                If Nexus is involved in a merger, acquisition, or sale of assets, your information may be transferred 
                as part of that transaction.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Data Security</h2>
              <p className="mb-4">
                We implement appropriate technical and organizational security measures to protect your information, including:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Encryption of data in transit (HTTPS/TLS)</li>
                <li>Secure password hashing</li>
                <li>Regular security audits</li>
                <li>Access controls and authentication</li>
                <li>Secure data centers</li>
              </ul>
              <p>
                However, no method of transmission over the Internet is 100% secure. We cannot guarantee absolute security.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Data Retention</h2>
              <p className="mb-4">
                We retain your information for as long as your account is active or as needed to provide services. 
                We may retain certain information after account deletion:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>For legal compliance (e.g., tax records)</li>
                <li>To resolve disputes</li>
                <li>To enforce our agreements</li>
                <li>For legitimate business purposes</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Your Privacy Rights</h2>
              <p className="mb-4">Depending on your location, you may have the following rights:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Correction:</strong> Request correction of inaccurate data</li>
                <li><strong>Deletion:</strong> Request deletion of your data</li>
                <li><strong>Portability:</strong> Receive your data in a portable format</li>
                <li><strong>Objection:</strong> Object to certain processing of your data</li>
                <li><strong>Restriction:</strong> Request restriction of processing</li>
                <li><strong>Withdraw Consent:</strong> Withdraw previously given consent</li>
              </ul>
              <p>
                To exercise these rights, please contact us at{' '}
                <a href="mailto:privacy@nexus.social" className="text-blue-600 hover:underline">privacy@nexus.social</a>.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Children&apos;s Privacy</h2>
              <p className="mb-4">
                Nexus is not intended for children under 13 years of age. We do not knowingly collect personal 
                information from children under 13. If you are a parent or guardian and believe your child has 
                provided us with personal information, please contact us.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. International Data Transfers</h2>
              <p className="mb-4">
                Your information may be transferred to and processed in countries other than your country of residence. 
                These countries may have different data protection laws. We ensure appropriate safeguards are in place 
                when transferring data internationally.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Cookies and Tracking</h2>
              <p className="mb-4">
                We use cookies and similar tracking technologies to collect and track information. 
                For more details, please see our{' '}
                <Link href="/legal/cookies" className="text-blue-600 hover:underline">Cookie Policy</Link>.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Changes to This Policy</h2>
              <p className="mb-4">
                We may update this Privacy Policy from time to time. We will notify you of any material changes 
                by posting the new policy on this page and updating the &quot;Last updated&quot; date.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Contact Us</h2>
              <p className="mb-4">If you have questions or concerns about this Privacy Policy, please contact us:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Email: <a href="mailto:privacy@nexus.social" className="text-blue-600 hover:underline">privacy@nexus.social</a></li>
                <li>Address: Nexus Privacy Team, Nairobi, Kenya</li>
              </ul>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/legal/terms">
                <Button variant="outline" className="w-full sm:w-auto">
                  Read Terms of Service
                </Button>
              </Link>
              <Link href="/legal/cookies">
                <Button variant="outline" className="w-full sm:w-auto">
                  Read Cookie Policy
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
