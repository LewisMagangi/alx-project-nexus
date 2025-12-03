import Link from 'next/link';
import { ArrowLeft, Cookie } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CookiePolicyPage() {
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
          <div className="flex items-center gap-3 mb-2">
            <Cookie className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">Cookie Policy</h1>
          </div>
          <p className="text-gray-500 mb-8">Last updated: December 1, 2025</p>

          <div className="prose prose-lg max-w-none text-gray-700">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. What Are Cookies?</h2>
              <p className="mb-4">
                Cookies are small text files that are placed on your computer or mobile device when you visit a website.
                They are widely used to make websites work more efficiently and provide information to website owners.
              </p>
              <p>
                Cookies help us remember your preferences, understand how you use our platform, and improve your experience.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. How We Use Cookies</h2>
              <p className="mb-4">Nexus uses cookies and similar technologies for several purposes:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>Authentication:</strong> To keep you logged in as you navigate the platform</li>
                <li><strong>Security:</strong> To protect your account and detect suspicious activity</li>
                <li><strong>Preferences:</strong> To remember your settings and preferences</li>
                <li><strong>Analytics:</strong> To understand how users interact with our platform</li>
                <li><strong>Performance:</strong> To ensure the platform runs smoothly</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Types of Cookies We Use</h2>

              <div className="bg-blue-50 rounded-lg p-6 mb-4">
                <h3 className="text-xl font-medium text-gray-800 mb-3">3.1 Essential Cookies</h3>
                <p className="mb-2">
                  These cookies are necessary for the platform to function and cannot be switched off. They are usually
                  set in response to actions made by you, such as logging in or filling in forms.
                </p>
                <table className="w-full mt-4 text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Cookie Name</th>
                      <th className="text-left py-2">Purpose</th>
                      <th className="text-left py-2">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2"><code>session_id</code></td>
                      <td className="py-2">Maintains your login session</td>
                      <td className="py-2">Session</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2"><code>csrf_token</code></td>
                      <td className="py-2">Security - prevents cross-site attacks</td>
                      <td className="py-2">Session</td>
                    </tr>
                    <tr>
                      <td className="py-2"><code>auth_token</code></td>
                      <td className="py-2">Authentication token</td>
                      <td className="py-2">7 days</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="bg-green-50 rounded-lg p-6 mb-4">
                <h3 className="text-xl font-medium text-gray-800 mb-3">3.2 Functional Cookies</h3>
                <p className="mb-2">
                  These cookies enable enhanced functionality and personalization, such as remembering your preferences.
                </p>
                <table className="w-full mt-4 text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Cookie Name</th>
                      <th className="text-left py-2">Purpose</th>
                      <th className="text-left py-2">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2"><code>theme</code></td>
                      <td className="py-2">Stores your theme preference (light/dark)</td>
                      <td className="py-2">1 year</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2"><code>language</code></td>
                      <td className="py-2">Stores your language preference</td>
                      <td className="py-2">1 year</td>
                    </tr>
                    <tr>
                      <td className="py-2"><code>notification_prefs</code></td>
                      <td className="py-2">Stores notification settings</td>
                      <td className="py-2">1 year</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="bg-yellow-50 rounded-lg p-6 mb-4">
                <h3 className="text-xl font-medium text-gray-800 mb-3">3.3 Analytics Cookies</h3>
                <p className="mb-2">
                  These cookies help us understand how visitors interact with our platform by collecting and reporting
                  information anonymously.
                </p>
                <table className="w-full mt-4 text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Cookie Name</th>
                      <th className="text-left py-2">Purpose</th>
                      <th className="text-left py-2">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2"><code>_ga</code></td>
                      <td className="py-2">Google Analytics - distinguishes users</td>
                      <td className="py-2">2 years</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2"><code>_gid</code></td>
                      <td className="py-2">Google Analytics - distinguishes users</td>
                      <td className="py-2">24 hours</td>
                    </tr>
                    <tr>
                      <td className="py-2"><code>_gat</code></td>
                      <td className="py-2">Google Analytics - throttle request rate</td>
                      <td className="py-2">1 minute</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="bg-purple-50 rounded-lg p-6 mb-4">
                <h3 className="text-xl font-medium text-gray-800 mb-3">3.4 Performance Cookies</h3>
                <p className="mb-2">
                  These cookies collect information about how you use our platform, like which pages you visit most often,
                  helping us improve performance.
                </p>
                <table className="w-full mt-4 text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Cookie Name</th>
                      <th className="text-left py-2">Purpose</th>
                      <th className="text-left py-2">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2"><code>perf_metrics</code></td>
                      <td className="py-2">Measures page load times</td>
                      <td className="py-2">Session</td>
                    </tr>
                    <tr>
                      <td className="py-2"><code>error_log</code></td>
                      <td className="py-2">Tracks errors for debugging</td>
                      <td className="py-2">7 days</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Third-Party Cookies</h2>
              <p className="mb-4">
                Some cookies on our platform are placed by third-party services that appear on our pages.
                We do not control these cookies. Third parties that may set cookies include:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>Google Analytics:</strong> Website analytics and usage statistics</li>
                <li><strong>Cloudflare:</strong> Security and performance optimization</li>
                <li><strong>Authentication providers:</strong> If you sign in using Google, GitHub, etc.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Managing Cookies</h2>
              <p className="mb-4">
                You have control over how cookies are used. Here are your options:
              </p>

              <h3 className="text-xl font-medium text-gray-800 mb-3">5.1 Browser Settings</h3>
              <p className="mb-4">
                Most web browsers allow you to control cookies through their settings. You can:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>View what cookies are stored on your device</li>
                <li>Delete all or specific cookies</li>
                <li>Block third-party cookies</li>
                <li>Block all cookies</li>
                <li>Clear cookies when you close your browser</li>
              </ul>
              <p className="mb-4">
                <strong>Note:</strong> Blocking all cookies may affect your experience on Nexus.
                Essential cookies are required for the platform to function properly.
              </p>

              <h3 className="text-xl font-medium text-gray-800 mb-3">5.2 Browser-Specific Instructions</h3>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>
                  <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer"
                     className="text-blue-600 hover:underline">Google Chrome</a>
                </li>
                <li>
                  <a href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer"
                     target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Mozilla Firefox</a>
                </li>
                <li>
                  <a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac"
                     target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Safari</a>
                </li>
                <li>
                  <a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09"
                     target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Microsoft Edge</a>
                </li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mb-3">5.3 Opt-Out of Analytics</h3>
              <p className="mb-4">
                To opt out of Google Analytics tracking, you can install the{' '}
                <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer"
                   className="text-blue-600 hover:underline">Google Analytics Opt-out Browser Add-on</a>.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Similar Technologies</h2>
              <p className="mb-4">
                In addition to cookies, we may use other similar technologies:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>
                  <strong>Local Storage:</strong> Used to store preferences and data locally in your browser.
                  Unlike cookies, this data is not sent to our servers with every request.
                </li>
                <li>
                  <strong>Session Storage:</strong> Similar to local storage but cleared when you close your browser.
                </li>
                <li>
                  <strong>Pixels/Beacons:</strong> Small images used to track email opens and page views.
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Do Not Track</h2>
              <p className="mb-4">
                Some browsers have a &quot;Do Not Track&quot; feature that signals to websites that you do not want
                your online activity tracked. Currently, there is no industry standard for how websites should
                respond to DNT signals. We do not currently respond to DNT signals.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Updates to This Policy</h2>
              <p className="mb-4">
                We may update this Cookie Policy from time to time to reflect changes in our practices or for
                legal, operational, or regulatory reasons. We will notify you of any material changes by posting
                the new policy on this page.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Contact Us</h2>
              <p className="mb-4">
                If you have questions about our use of cookies or other technologies, please contact us:
              </p>
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
              <Link href="/legal/privacy">
                <Button variant="outline" className="w-full sm:w-auto">
                  Read Privacy Policy
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
