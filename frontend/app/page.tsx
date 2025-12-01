'use client';

import Link from 'next/link';
import { useEffect, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  MessageCircle,
  Users,
  Repeat2,
  Hash,
  AtSign,
  Shield,
  Sparkles,
  ArrowRight,
  Twitter,
  Github,
  Linkedin,
} from 'lucide-react';

const emptySubscribe = () => () => {};

export default function LandingPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (!mounted || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (user) {
    return null; // Will redirect to dashboard
  }

  const features = [
    {
      icon: <MessageCircle className="h-8 w-8 text-blue-500" />,
      title: 'Share Your Thoughts',
      description: 'Post updates up to 280 characters and connect with your community.',
    },
    {
      icon: <Repeat2 className="h-8 w-8 text-green-500" />,
      title: 'Retweets & Quote Tweets',
      description: 'Amplify voices you love or add your own commentary with quote tweets.',
    },
    {
      icon: <Users className="h-8 w-8 text-purple-500" />,
      title: 'Threaded Conversations',
      description: 'Have meaningful discussions with threaded replies.',
    },
    {
      icon: <Hash className="h-8 w-8 text-orange-500" />,
      title: 'Trending Hashtags',
      description: 'Discover what\'s trending and join the conversation with hashtags.',
    },
    {
      icon: <AtSign className="h-8 w-8 text-pink-500" />,
      title: 'Mentions',
      description: 'Tag friends and get notified when someone mentions you.',
    },
    {
      icon: <Shield className="h-8 w-8 text-teal-500" />,
      title: 'Privacy First',
      description: 'Your data is protected with industry-standard security measures.',
    },
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Auth Navigation - Only show when not logged in */}
      {!user && (
        <div className="fixed top-16 left-0 right-0 z-10 bg-white/70 backdrop-blur-md border-b border-white/20 shadow-sm px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-end">
          <div className="flex items-center gap-4">
            <Link href="/about">
              <Button variant="ghost" className="hidden sm:inline-flex text-sm">
                About Us
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="ghost" className="text-sm">Sign In</Button>
            </Link>
            <Link href="/auth/register">
              <Button className="bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg text-sm">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium inline-flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Welcome to the future of social networking
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6">
            <span className="bg-linear-to-r from-gray-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent">
              Connect. Share.
            </span>
            <br />
            <span className="bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Inspire.
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Join Nexus and be part of a vibrant community where every voice matters.
            Share your ideas, discover trending topics, and connect with people who share your passions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button
                size="lg"
                className="bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-xl text-lg px-8 py-6 w-full sm:w-auto"
              >
                Create Your Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/about">
              <Button
                variant="outline"
                size="lg"
                className="text-lg px-8 py-6 w-full sm:w-auto border-2"
              >
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white/50 backdrop-blur-sm">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Everything you need to connect
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Powerful features designed to help you engage, share, and grow your network.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <CardContent className="p-6">
                <div className="w-14 h-14 rounded-xl bg-linear-to-br from-gray-50 to-gray-100 flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <Card className="bg-linear-to-br from-blue-600 to-indigo-700 border-0 shadow-2xl overflow-hidden">
          <CardContent className="p-12 text-center relative">
            <div className="absolute inset-0 bg-grid-white/10 mask-[linear-gradient(0deg,transparent,rgba(255,255,255,0.5))]" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to join the conversation?
              </h2>
              <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">
                Create your free account today and start connecting with like-minded individuals.
              </p>
              <Link href="/auth/register">
                <Button
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-blue-50 shadow-xl text-lg px-8 py-6"
                >
                  Sign Up Now — It&apos;s Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">N</span>
              </div>
              <span className="text-2xl font-bold">Nexus</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              A modern social platform where conversations happen, ideas flourish,
              and communities thrive.
            </p>
            <div className="flex gap-4">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow us on Twitter"
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-600 transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://github.com/LewisMagangi"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="View our GitHub"
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Connect on LinkedIn"
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-700 transition-colors"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Product</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/auth/register" className="hover:text-white transition-colors">Sign Up</Link></li>
              <li><Link href="/auth/login" className="hover:text-white transition-colors">Sign In</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Legal</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/legal/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/legal/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/legal/cookies" className="hover:text-white transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
          <p>© {new Date().getFullYear()} Nexus. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
