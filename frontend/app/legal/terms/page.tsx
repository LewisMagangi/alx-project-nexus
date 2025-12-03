import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TermsPage() {
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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Terms of Service</h1>
          <p className="text-gray-500 mb-8">Last updated: December 1, 2025</p>

          <div className="prose prose-lg max-w-none text-gray-700">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="mb-4">
                By accessing or using Nexus (&quot;the Service&quot;), you agree to be bound by these Terms of Service
                (&quot;Terms&quot;). If you do not agree to all the terms and conditions, you may not access or use the Service.
              </p>
              <p>
                We reserve the right to update these Terms at any time. We will notify you of any material changes
                by posting the new Terms on this page and updating the &quot;Last updated&quot; date.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
              <p className="mb-4">
                Nexus is a social networking platform that allows users to:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Create and share posts up to 280 characters</li>
                <li>Follow other users and build a network</li>
                <li>Like, retweet, and quote posts</li>
                <li>Participate in threaded conversations</li>
                <li>Use hashtags to discover and join conversations</li>
                <li>Mention other users in posts</li>
                <li>Send direct messages to other users</li>
                <li>Create and join communities</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
              <h3 className="text-xl font-medium text-gray-800 mb-3">3.1 Registration</h3>
              <p className="mb-4">
                To use certain features of the Service, you must register for an account. When you register, you agree to:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and promptly update your account information</li>
                <li>Maintain the security of your password</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized use</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mb-3">3.2 Account Requirements</h3>
              <p className="mb-4">
                You must be at least 13 years old to create an account. If you are under 18, you represent that you
                have your parent&apos;s or guardian&apos;s permission to use the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. User Conduct</h2>
              <p className="mb-4">You agree not to engage in any of the following activities:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>Illegal Activities:</strong> Violating any applicable law or regulation</li>
                <li><strong>Harassment:</strong> Harassing, threatening, or intimidating other users</li>
                <li><strong>Hate Speech:</strong> Posting content that promotes hatred against individuals or groups</li>
                <li><strong>Spam:</strong> Sending unsolicited messages or posting repetitive content</li>
                <li><strong>Impersonation:</strong> Pretending to be another person or entity</li>
                <li><strong>Misinformation:</strong> Deliberately spreading false or misleading information</li>
                <li><strong>Malware:</strong> Distributing viruses or other malicious code</li>
                <li><strong>Data Mining:</strong> Collecting user data without authorization</li>
                <li><strong>Interference:</strong> Disrupting or interfering with the Service</li>
                <li><strong>Circumvention:</strong> Bypassing security measures or access restrictions</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Content</h2>
              <h3 className="text-xl font-medium text-gray-800 mb-3">5.1 Your Content</h3>
              <p className="mb-4">
                You retain ownership of content you post on Nexus. By posting content, you grant us a non-exclusive,
                worldwide, royalty-free license to use, copy, modify, and display your content in connection with the Service.
              </p>

              <h3 className="text-xl font-medium text-gray-800 mb-3">5.2 Content Standards</h3>
              <p className="mb-4">All content must comply with our Community Guidelines. We reserve the right to remove content that:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Violates intellectual property rights</li>
                <li>Contains explicit or adult content without appropriate warnings</li>
                <li>Promotes violence or illegal activities</li>
                <li>Contains personal or confidential information of others</li>
                <li>Is determined to be harmful or offensive</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mb-3">5.3 Content Removal</h3>
              <p className="mb-4">
                We may remove or restrict access to content that violates these Terms without prior notice.
                Repeated violations may result in account suspension or termination.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Intellectual Property</h2>
              <p className="mb-4">
                The Service and its original content (excluding user-generated content), features, and functionality
                are owned by Nexus and are protected by international copyright, trademark, patent, trade secret,
                and other intellectual property laws.
              </p>
              <p>
                The Nexus name, logo, and all related names, logos, product and service names, designs, and slogans
                are trademarks of Nexus. You may not use such marks without our prior written permission.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Privacy</h2>
              <p className="mb-4">
                Your privacy is important to us. Please review our{' '}
                <Link href="/legal/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>,
                which explains how we collect, use, and protect your information.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Termination</h2>
              <p className="mb-4">
                We may terminate or suspend your account immediately, without prior notice or liability, for any reason,
                including if you breach these Terms. Upon termination, your right to use the Service will immediately cease.
              </p>
              <p>
                You may delete your account at any time through the Settings page. Upon account deletion,
                your profile and posts will be removed from public view.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Disclaimers</h2>
              <p className="mb-4">
                THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND,
                EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY,
                FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
              </p>
              <p>
                We do not warrant that the Service will be uninterrupted, secure, or error-free, or that defects will be corrected.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Limitation of Liability</h2>
              <p className="mb-4">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, NEXUS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL,
                SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA,
                USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Governing Law</h2>
              <p className="mb-4">
                These Terms shall be governed by and construed in accordance with the laws of the jurisdiction
                in which Nexus operates, without regard to its conflict of law provisions.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Changes to Terms</h2>
              <p className="mb-4">
                We reserve the right to modify or replace these Terms at any time. If a revision is material,
                we will provide at least 30 days&apos; notice before any new terms take effect.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Contact Us</h2>
              <p>
                If you have any questions about these Terms, please contact us at{' '}
                <a href="mailto:legal@nexus.social" className="text-blue-600 hover:underline">legal@nexus.social</a>.
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/legal/privacy">
                <Button variant="outline" className="w-full sm:w-auto">
                  Read Privacy Policy
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
