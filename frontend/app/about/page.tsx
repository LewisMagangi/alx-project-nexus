'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Users,
  Target,
  Heart,
  Zap,
  Globe,
  Shield,
  ArrowRight,
  Twitter,
  Github,
  Linkedin,
  Mail,
} from 'lucide-react';

export default function AboutPage() {
  const values = [
    {
      icon: <Users className="h-8 w-8 text-blue-500" />,
      title: 'Community First',
      description: 'We believe in the power of community. Every feature we build is designed to help people connect and support each other.',
    },
    {
      icon: <Shield className="h-8 w-8 text-green-500" />,
      title: 'Privacy & Security',
      description: 'Your data belongs to you. We employ industry-leading security practices to keep your information safe.',
    },
    {
      icon: <Heart className="h-8 w-8 text-red-500" />,
      title: 'Authenticity',
      description: 'We encourage genuine connections and real conversations. Be yourself, share your true thoughts.',
    },
    {
      icon: <Zap className="h-8 w-8 text-yellow-500" />,
      title: 'Innovation',
      description: 'We\'re constantly improving and adding new features based on community feedback and emerging trends.',
    },
  ];

  const team = [
    {
      name: 'Lewis Magangi',
      role: 'Founder & Lead Developer',
      bio: 'Full-stack developer passionate about building tools that bring people together.',
      image: 'LM',
      links: {
        github: 'https://github.com/LewisMagangi',
        linkedin: 'https://www.linkedin.com/in/lewis-magangi/',
        twitter: 'https://x.com/Lewis_Magangi',
      },
    },
  ];

  const stats = [
    { value: '10K+', label: 'Active Users' },
    { value: '500K+', label: 'Posts Shared' },
    { value: '1M+', label: 'Connections Made' },
    { value: '99.9%', label: 'Uptime' },
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
              <Link href="/">
                <Button variant="ghost" className="hidden sm:inline-flex">
                  Home
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/auth/register">
                <Button className="bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6">
            <span className="bg-linear-to-r from-gray-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent">
              About Nexus
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            We&apos;re building a social platform that puts people first. Our mission is to create
            meaningful connections in a world that&apos;s more connected than ever, yet often feels disconnected.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-4 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Target className="h-6 w-6 text-blue-600" />
                <span className="text-blue-600 font-semibold">Our Mission</span>
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Empowering authentic conversations
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Nexus was born from a simple idea: social media should bring us closer together,
                not drive us apart. We&apos;re committed to building a platform that encourages
                thoughtful discussion, celebrates diverse perspectives, and helps you find your community.
              </p>
              <p className="text-lg text-gray-600">
                Whether you&apos;re sharing your latest project, discussing trending topics, or connecting
                with friends, Nexus provides the tools you need to express yourself authentically.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat, index) => (
                <Card key={index} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                      {stat.value}
                    </div>
                    <div className="text-gray-600">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Core Values
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              These principles guide every decision we make and every feature we build.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card
                key={index}
                className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <CardContent className="p-6">
                  <div className="w-14 h-14 rounded-xl bg-linear-to-br from-gray-50 to-gray-100 flex items-center justify-center mb-4">
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {value.title}
                  </h3>
                  <p className="text-gray-600">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-4 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Meet the Team
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              The passionate individuals behind Nexus.
            </p>
          </div>
          <div className="flex justify-center">
            {team.map((member, index) => (
              <Card
                key={index}
                className="bg-white/80 backdrop-blur-sm border-0 shadow-lg max-w-md w-full"
              >
                <CardContent className="p-8 text-center">
                  <div className="w-24 h-24 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-6">
                    <span className="text-white font-bold text-3xl">{member.image}</span>
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-1">
                    {member.name}
                  </h3>
                  <p className="text-blue-600 font-medium mb-4">{member.role}</p>
                  <p className="text-gray-600 mb-6">{member.bio}</p>
                  <div className="flex justify-center gap-4">
                    <a
                      href={member.links.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${member.name}'s GitHub`}
                      className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                    >
                      <Github className="h-5 w-5 text-gray-700" />
                    </a>
                    <a
                      href={member.links.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${member.name}'s LinkedIn`}
                      className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-blue-100 transition-colors"
                    >
                      <Linkedin className="h-5 w-5 text-blue-600" />
                    </a>
                    <a
                      href={member.links.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${member.name}'s Twitter`}
                      className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-blue-100 transition-colors"
                    >
                      <Twitter className="h-5 w-5 text-blue-400" />
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Global Reach Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Globe className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Built for Everyone, Everywhere
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Nexus is designed to be accessible and welcoming to users from all backgrounds
            and locations. We&apos;re committed to building an inclusive platform that celebrates diversity.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-linear-to-br from-blue-600 to-indigo-700 border-0 shadow-2xl overflow-hidden">
            <CardContent className="p-12 text-center relative">
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Join Us on This Journey
                </h2>
                <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">
                  Be part of a community that values authentic connection and meaningful conversation.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/auth/register">
                    <Button
                      size="lg"
                      className="bg-white text-blue-600 hover:bg-blue-50 shadow-xl text-lg px-8 py-6"
                    >
                      Create Your Account
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <a href="mailto:contact@nexus.social">
                    <Button
                      variant="outline"
                      size="lg"
                      className="border-white text-white hover:bg-white/10 text-lg px-8 py-6"
                    >
                      <Mail className="mr-2 h-5 w-5" />
                      Contact Us
                    </Button>
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-linear-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">N</span>
              </div>
              <span className="text-xl font-bold">Nexus</span>
            </div>
            <div className="flex gap-6 text-gray-400">
              <Link href="/legal/terms" className="hover:text-white transition-colors">Terms</Link>
              <Link href="/legal/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="/legal/cookies" className="hover:text-white transition-colors">Cookies</Link>
            </div>
            <p className="text-gray-400">© {new Date().getFullYear()} Nexus. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
