import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-4">Terms of Service</h1>
      <p className="mb-4">These are the terms of service. Please review them carefully.</p>
      <Link href="/legal" className="text-blue-600 underline">Back to Legal Policies</Link>
    </div>
  );
}
