import React from 'react';
import { Link } from 'react-router-dom';
import LegalPage, { LegalSection, LegalList } from '../components/layout/LegalPage';

const TermsOfServicePage = () => (
  <LegalPage
    title="Terms of Service"
    lastUpdated="29 August 2026"
    intro="These Terms govern your use of the Kobac Electronics website and your purchases from us. By creating an account or placing an order, you agree to these Terms."
  >
    <LegalSection heading="1. Your Account">
      <LegalList
        items={[
          'You must provide accurate information and keep your password confidential.',
          'You are responsible for all activity that happens under your account.',
          'One person may hold one account. We may suspend accounts that break these Terms or are used fraudulently.',
        ]}
      />
    </LegalSection>

    <LegalSection heading="2. Products, Pricing & Availability">
      <p>
        Prices are shown in US Dollars and may change at any time. Product images and specifications are provided for
        guidance and may differ slightly from the item delivered. If a product is listed with an obvious pricing or
        description error, we may cancel the order and refund any payment.
      </p>
    </LegalSection>

    <LegalSection heading="3. Orders">
      <p>
        Placing an order is an offer to buy. We accept your order when we confirm it on-screen and by email. We may
        decline or cancel an order, for example if an item is out of stock, payment cannot be verified, or we suspect
        fraud. Stock is reserved only once an order is successfully created.
      </p>
    </LegalSection>

    <LegalSection heading="4. Payment">
      <LegalList
        items={[
          'We accept EVC Plus (mobile money) and Cash on Delivery.',
          'A 5% tax is applied to the items subtotal at checkout.',
          'Delivery is free on orders at or above the current free-shipping threshold; otherwise a flat delivery fee applies. Both are shown before you confirm.',
          'For Cash on Delivery, the full amount is due to the courier when your order arrives.',
        ]}
      />
    </LegalSection>

    <LegalSection heading="5. Shipping & Delivery">
      <p>
        We deliver within our supported areas. Delivery times are estimates, not guarantees, and may be affected by
        location, stock, and circumstances outside our control. Risk in the goods passes to you on delivery.
      </p>
    </LegalSection>

    <LegalSection heading="6. Returns, Refunds & Warranty">
      <LegalList
        items={[
          'If an item arrives damaged, defective, or not as described, contact us as soon as possible and we will arrange a replacement or refund.',
          "Products carry the manufacturer's warranty where applicable.",
          'Refunds are made using the original payment method where possible.',
          'Cancelling an order that has not yet been delivered will restore the stock and, if already paid, be refunded.',
        ]}
      />
    </LegalSection>

    <LegalSection heading="7. Reviews & User Content">
      <p>
        You may review a product only after you have ordered it. Reviews must be honest and must not contain offensive,
        unlawful, or misleading content. We may edit or remove content that breaks these rules. By posting a review you
        allow us to display it on the site alongside your name.
      </p>
    </LegalSection>

    <LegalSection heading="8. Acceptable Use">
      <p>You agree not to:</p>
      <LegalList
        items={[
          'Use the site for any unlawful or fraudulent purpose.',
          'Attempt to gain unauthorised access to accounts, systems, or data.',
          'Interfere with the normal operation of the site or the experience of other users.',
          'Copy, scrape, or resell content from the site without permission.',
        ]}
      />
    </LegalSection>

    <LegalSection heading="9. Intellectual Property">
      <p>
        The Kobac Electronics name, logo, site design, and content are our property or used with permission. You may not
        use them without our written consent.
      </p>
    </LegalSection>

    <LegalSection heading="10. Disclaimers & Limitation of Liability">
      <p>
        The site is provided &quot;as is&quot;. To the fullest extent permitted by law, Kobac Electronics is not liable
        for indirect or consequential losses, and our total liability for any order is limited to the amount you paid for
        that order.
      </p>
    </LegalSection>

    <LegalSection heading="11. Changes to These Terms">
      <p>
        We may update these Terms from time to time. Continued use of the site after changes take effect means you accept
        the updated Terms.
      </p>
    </LegalSection>

    <LegalSection heading="12. Contact">
      <p>
        Questions about these Terms? Reach us through our{' '}
        <Link to="/contact" className="text-primary hover:underline">contact page</Link>.
      </p>
    </LegalSection>
  </LegalPage>
);

export default TermsOfServicePage;
