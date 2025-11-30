import Link from 'next/link';

export default function LegalPage() {
  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-4">Legal Policies</h1>
      <p className="mb-4">Please read and accept our <Link href="/legal/terms" className="text-blue-600 underline">Terms of Service</Link> and <Link href="/legal/privacy" className="text-blue-600 underline">Privacy Policy</Link> before registering.</p>
      <p className="text-gray-600">By creating an account, you agree to abide by these policies.</p>
    </div>
  );
}
