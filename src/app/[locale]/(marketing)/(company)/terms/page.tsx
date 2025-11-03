import type { Metadata } from 'next';

export const runtime = 'edge';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service',
};

export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">1. Acceptance of Terms</h2>
          <p className="text-muted-foreground mb-4">
            By accessing and using VibeTrans, you accept and agree to be bound by the terms and provision of this agreement.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">2. Use License</h2>
          <p className="text-muted-foreground mb-4">
            Permission is granted to temporarily download one copy of the materials on VibeTrans for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
          </p>
          <ul className="list-disc list-inside text-muted-foreground mb-4">
            <li>modify or copy the materials</li>
            <li>use the materials for any commercial purpose</li>
            <li>attempt to reverse engineer any software contained on VibeTrans</li>
            <li>remove any copyright or other proprietary notations from the materials</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">3. Disclaimer</h2>
          <p className="text-muted-foreground mb-4">
            The materials on VibeTrans are provided on an 'as is' basis. VibeTrans makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">4. Limitations</h2>
          <p className="text-muted-foreground mb-4">
            In no event shall VibeTrans or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on VibeTrans, even if VibeTrans or a VibeTrans authorized representative has been notified orally or in writing of the possibility of such damage.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">5. Privacy Policy</h2>
          <p className="text-muted-foreground mb-4">
            Your privacy is important to VibeTrans. Please review our Privacy Policy, which also governs the site and informs users of our data collection practices.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">6. Revisions and Errata</h2>
          <p className="text-muted-foreground mb-4">
            The materials appearing on VibeTrans could include technical, typographical, or photographic errors. VibeTrans does not promise that any of the materials on its web site are accurate, complete, or current. VibeTrans may make changes to the materials contained on its web site at any time without notice.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">7. Contact Information</h2>
          <p className="text-muted-foreground mb-4">
            If you have any questions about these Terms of Service, please contact us.
          </p>
        </section>
      </div>
    </div>
  );
}
