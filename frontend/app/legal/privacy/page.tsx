import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-4">Privacy Policy</h1>
      <p className="mb-4">This is the privacy policy. Please review it carefully.</p>
      <Link href="/legal" className="text-blue-600 underline">Back to Legal Policies</Link>
    </div>
  );
}
