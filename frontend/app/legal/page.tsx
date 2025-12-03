import Link from 'next/link';
import { FileText, Shield, Cookie, ArrowRight, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LegalPage() {
  const legalDocuments = [
    {
      title: 'Terms of Service',
      description: 'The rules and guidelines for using the Nexus platform. Please read before creating an account.',
      href: '/legal/terms',
      icon: FileText,
      color: 'bg-blue-500',
    },
    {
      title: 'Privacy Policy',
      description: 'How we collect, use, and protect your personal information. Your privacy matters to us.',
      href: '/legal/privacy',
      icon: Shield,
      color: 'bg-green-500',
    },
    {
      title: 'Cookie Policy',
      description: 'Information about how we use cookies and similar tracking technologies.',
      href: '/legal/cookies',
      icon: Cookie,
      color: 'bg-yellow-500',
    },
  ];

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
            <div className="flex items-center gap-4">
              <Link href="/auth/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/auth/register">
                <Button className="bg-linear-to-r from-blue-500 to-indigo-600 text-white hover:opacity-90">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-blue-500 to-indigo-600 rounded-2xl mb-6">
              <Scale className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Legal Center</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Transparency and trust are at the core of Nexus. Review our policies to understand how we
              protect your rights and handle your data.
            </p>
          </div>

          {/* Legal Documents Grid */}
          <div className="grid gap-6 md:grid-cols-3 mb-12">
            {legalDocuments.map((doc) => (
              <Link
                key={doc.href}
                href={doc.href}
                className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 ${doc.color} rounded-xl mb-4`}>
                  <doc.icon className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {doc.title}
                </h2>
                <p className="text-gray-600 mb-4 text-sm">
                  {doc.description}
                </p>
                <div className="flex items-center text-blue-600 font-medium text-sm">
                  Read More
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>

          {/* Agreement Notice */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Your Agreement</h3>
            <p className="text-gray-600 mb-6">
              By creating an account or using Nexus, you agree to our Terms of Service and acknowledge that
              you have read our Privacy Policy and Cookie Policy. We encourage you to review these documents
              carefully before proceeding.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/auth/register">
                <Button className="w-full sm:w-auto bg-linear-to-r from-blue-500 to-indigo-600 text-white hover:opacity-90">
                  Create Account
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button variant="outline" className="w-full sm:w-auto">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>

          {/* Contact Section */}
          <div className="mt-12 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Have Questions?</h3>
            <p className="text-gray-600 mb-4">
              If you have any questions about our policies, please don&apos;t hesitate to contact us.
            </p>
            <a
              href="mailto:legal@nexus.social"
              className="text-blue-600 hover:underline font-medium"
            >
              legal@nexus.social
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
