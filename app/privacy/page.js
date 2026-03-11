export const metadata = {
    title: 'Privacy Policy - Kenyan News Hub',
    description: 'Privacy policy for Kenyan News Hub'
};

export default function PrivacyPage() {
    return (
        <div className="legal-page">
            <h1>Privacy Policy</h1>
            <p className="last-updated">Last Updated: January 27, 2026</p>

            <section>
                <h2>1. Information We Collect</h2>
                <p>We collect information that you provide directly to us, including when you create an account, subscribe to our newsletter, or contact us for support.</p>
                <h3>Information collected includes:</h3>
                <ul>
                    <li>Name and email address</li>
                    <li>Usage data and preferences</li>
                    <li>Device and browser information</li>
                    <li>IP address and location data</li>
                </ul>
            </section>

            <section>
                <h2>2. How We Use Your Information</h2>
                <p>We use the information we collect to provide, maintain, and improve our services, including to personalize content and communicate with you.</p>
            </section>

            <section>
                <h2>3. Information Sharing</h2>
                <p>We do not sell your personal information. We may share your information with service providers who assist us in operating our website.</p>
            </section>

            <section>
                <h2>4. Your Rights</h2>
                <p>You have the right to access, update, or delete your personal information at any time. Contact us for assistance.</p>
            </section>

            <section>
                <h2>5. Contact Us</h2>
                <p>If you have questions about this Privacy Policy, please contact us at privacy@kenyannewshub.com</p>
            </section>
        </div>
    );
}
