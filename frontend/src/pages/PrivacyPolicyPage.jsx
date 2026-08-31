import React from 'react';
import { Link } from 'react-router-dom';
import LegalPage, { LegalSection, LegalList } from '../components/layout/LegalPage';

const PrivacyPolicyPage = () => (
  <LegalPage
    title="Privacy Policy"
    lastUpdated="29 August 2026"
    intro="This Privacy Policy explains what information Kobac Electronics collects when you use our website, how we use it, and the choices you have. By using the site you agree to the practices described here."
  >
    <LegalSection heading="1. Information We Collect">
      <p>We only collect what we need to run the store and fulfil your orders:</p>
      <LegalList
        items={[
          'Account details: your name, email address, and a securely hashed password.',
          'Order details: the items you buy, your delivery address (street, district, city, landmark), and the phone number used at checkout.',
          'Payment details: for EVC Plus we receive a transaction reference and the paying phone number from the payment gateway. We never see or store your EVC Plus PIN or any card numbers.',
          'Content you submit: product reviews, ratings, favorite items, and messages you send us through the contact form.',
          'Basic technical data: your browser type and general usage of the site, used to keep it working and secure.',
        ]}
      />
    </LegalSection>

    <LegalSection heading="2. How We Use Your Information">
      <LegalList
        items={[
          'To create and manage your account.',
          'To process, deliver, and track your orders.',
          'To confirm payments and send transactional emails (order confirmation, payment received, delivery updates, password resets).',
          'To respond to your support requests.',
          'To display your reviews next to the products you purchased.',
          'To protect the store against fraud and abuse, and to improve our products and service.',
        ]}
      />
    </LegalSection>

    <LegalSection heading="3. Payment Information">
      <p>
        Payments are handled by mobile-money providers (such as EVC Plus / Hormuud) or collected in person for Cash on
        Delivery. Your PIN is entered on your own device and is never transmitted to or stored by Kobac Electronics. We
        keep the transaction reference and status only as a record of your purchase.
      </p>
    </LegalSection>

    <LegalSection heading="4. Cookies & Local Storage">
      <p>
        We use your browser&apos;s local storage to keep you signed in and to remember your shopping cart between visits.
        These are essential for the site to function and are not used for advertising or cross-site tracking.
      </p>
    </LegalSection>

    <LegalSection heading="5. Third-Party Services">
      <p>We rely on a small number of trusted providers to operate the store:</p>
      <LegalList
        items={[
          'ImageKit: hosting and delivery of product images.',
          'Our email provider: sending transactional emails.',
          'MongoDB Atlas: secure database hosting.',
          'Our hosting platform: running the website and API.',
        ]}
      />
      <p>These providers process data only as needed to provide their service to us.</p>
    </LegalSection>

    <LegalSection heading="6. Data Retention">
      <p>
        We keep your account and order history for as long as your account is active, and as long as needed for
        accounting, warranty, and legal purposes. You can ask us to delete your account at any time.
      </p>
    </LegalSection>

    <LegalSection heading="7. Your Rights">
      <LegalList
        items={[
          'Access and update: view and edit your name and email from the Settings page.',
          'Delete: contact us to close your account and remove your personal data.',
          'Unsubscribe: opt out of non-essential emails at any time; you will still receive essential order emails.',
        ]}
      />
    </LegalSection>

    <LegalSection heading="8. Security">
      <p>
        Passwords are stored using industry-standard hashing (bcrypt). Access to your account uses signed tokens, and all
        traffic to the site is encrypted over HTTPS. No system is perfectly secure, so please use a strong, unique
        password and keep it private.
      </p>
    </LegalSection>

    <LegalSection heading="9. Children's Privacy">
      <p>
        The store is not directed to children under 13, and we do not knowingly collect their personal information. If you
        believe a child has provided us data, please contact us and we will remove it.
      </p>
    </LegalSection>

    <LegalSection heading="10. Changes to This Policy">
      <p>
        We may update this policy from time to time. The &quot;Last updated&quot; date above shows when it last changed.
        Significant changes will be highlighted on the site.
      </p>
    </LegalSection>

    <LegalSection heading="11. Contact Us">
      <p>
        Questions about your privacy? Reach us through our{' '}
        <Link to="/contact" className="text-primary hover:underline">contact page</Link>.
      </p>
    </LegalSection>
  </LegalPage>
);

export default PrivacyPolicyPage;
