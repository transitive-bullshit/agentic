import Link from 'next/link'

import { Markdown } from '@/components/markdown'
import { PageContainer } from '@/components/page-container'

const lastUpdatedDate = 'June 30, 2025'

export default function AboutPage() {
  return (
    <PageContainer>
      <h1 className='text-center text-balance leading-snug md:leading-none text-4xl font-semibold'>
        Privacy Policy
      </h1>

      <section>
        <Markdown>
          <p>
            <em>Last updated: {lastUpdatedDate}</em>
          </p>

          <h2>1. Overview</h2>
          <p>
            Agentic Systems, Inc. (<strong>"Agentic"</strong>,{' '}
            <strong>"we"</strong>,<strong>"us"</strong>, or{' '}
            <strong>"our"</strong>) provides a modern AI platform comprised of:
          </p>

          <ul>
            <li>
              <strong>Marketplace</strong> – a curated directory of LLM-powered
              tool products that can be called via the Model Context Protocol
              ("MCP") or standard HTTP&nbsp;APIs.
            </li>

            <li>
              <strong>Gateway</strong> – a fully-managed MCP gateway that allows
              developers to deploy, monetize, and optionally publish their own
              MCP or OpenAPI products.
            </li>

            <li>
              <strong>Open-Source Project</strong> – the Agentic
              source-available codebase released under the GNU&nbsp;AGPL-3.0
              license.
            </li>
          </ul>

          <p>
            This Privacy Policy explains how we collect, use, disclose, and
            safeguard information in connection with the Agentic website,
            console, Marketplace, Gateway, and any related services
            (collectively, the <strong>"Service"</strong>).
          </p>

          <h2>2. Information We Collect</h2>
          <p>
            We collect the following categories of information when you use the
            Service:
          </p>

          <ul>
            <li>
              <strong>Account Information</strong>: name, email, billing
              address, and authentication credentials that you provide when you
              create an Agentic account.
            </li>

            <li>
              <strong>Payment Information</strong>: payment method details
              (e.g.&nbsp;card type and last four digits) processed by Stripe on
              our behalf. Stripe's privacy practices are described in its own
              policy.
            </li>

            <li>
              <strong>Usage Data</strong>: log files, API request metadata, IP
              address, browser type, referring pages, and other diagnostic
              information automatically collected when you interact with the
              Service.
            </li>

            <li>
              <strong>Developer Content</strong>: API specifications,
              configuration, and other content that you upload to the Gateway or
              Marketplace.
            </li>

            <li>
              <strong>Cookies &amp; Similar Technologies</strong>: small data
              files placed on your device to enable site functionality,
              analytics, and preference storage. You can disable cookies in your
              browser settings, but parts of the Service may not function
              properly.
            </li>
          </ul>

          <h2>3. How We Use Information</h2>
          <p>We use the information we collect to:</p>

          <ul>
            <li>Provide, maintain, and improve the Service;</li>

            <li>
              Facilitate Marketplace and Gateway transactions, including billing
              through Stripe;
            </li>

            <li>Authenticate users and secure the Service;</li>

            <li>
              Monitor usage and detect, prevent, or address technical issues or
              fraudulent activity;
            </li>

            <li>
              Respond to inquiries, provide customer support, and send
              administrative messages;
            </li>

            <li>
              Send product updates, promotional communications, or other
              information that may be of interest to you (you may opt out at any
              time);
            </li>

            <li>Carry out research, analytics, and product development;</li>

            <li>
              Comply with legal obligations and enforce our Terms of Service.
            </li>
          </ul>

          <h2>4. Sharing &amp; Disclosure</h2>
          <p>We may share information as follows:</p>

          <ul>
            <li>
              <strong>Service Providers</strong>: with vendors who perform
              services on our behalf, such as hosting, analytics, and payment
              processing.
            </li>

            <li>
              <strong>API Providers &amp; Consumers</strong>: Marketplace
              product owners may receive usage metrics related to their own
              products; conversely, when you list a product we may display your
              developer profile to potential consumers.
            </li>

            <li>
              <strong>Business Transfers</strong>: as part of a merger,
              acquisition, financing, or sale of assets.
            </li>

            <li>
              <strong>Affiliates</strong>: with our corporate affiliates who are
              bound to honor this policy.
            </li>

            <li>
              <strong>Legal Requirements</strong>: when required to comply with
              law or protect the rights, property, or safety of Agentic, our
              users, or the public.
            </li>

            <li>
              <strong>With Your Consent</strong>: in any other situation where
              you direct us to share the information.
            </li>
          </ul>

          <h2>5. Payments via Stripe</h2>
          <p>
            All Marketplace purchases and Gateway subscription fees are
            processed by Stripe. Agentic does not store full payment-card
            numbers or CVC codes. Stripe acts as a separate controller of your
            payment information – please review the{' '}
            <a
              href='https://stripe.com/privacy'
              target='_blank'
              rel='noopener noreferrer'
            >
              Stripe&nbsp;Privacy&nbsp;Policy
            </a>{' '}
            for details.
          </p>

          <h2>6. Data Retention</h2>
          <p>
            We retain information for as long as necessary to fulfill the
            purposes described in this Policy, comply with our legal
            obligations, resolve disputes, and enforce our agreements. Log data
            is typically retained for no more than 18&nbsp;months unless we are
            legally required to keep it longer.
          </p>

          <h2>7. International Transfers</h2>
          <p>
            We are a U.S.-based company and may process information in the
            United States and other countries where we or our service providers
            operate. We rely on appropriate safeguards, such as Standard
            Contractual Clauses, for the transfer of personal data from the
            EU/EEA, UK, and Switzerland.
          </p>

          <h2>8. Security</h2>
          <p>
            We employ technical and organizational measures designed to protect
            information against loss, misuse, and unauthorized access or
            disclosure. However, no system can be guaranteed to be 100% secure.
          </p>

          <h2>9. Your Rights</h2>
          <p>
            Depending on your jurisdiction, you may have rights to access,
            rectify, delete, restrict, or object to our processing of your
            personal information, as well as the right to data portability and
            to withdraw consent. To exercise these rights, please contact us as
            set forth below. We respond to all requests consistent with
            applicable law.
          </p>

          <h2>10. Children's Privacy</h2>
          <p>
            The Service is not directed to children under 13, and we do not
            knowingly collect personal information from children. If you believe
            a child has provided us with personal information, please contact us
            and we will take steps to delete such information.
          </p>

          <h2>11. Third-Party Links</h2>
          <p>
            The Service may contain links to third-party websites. We are not
            responsible for the privacy practices of those sites. We encourage
            you to review the privacy policies of every site you visit.
          </p>

          <h2>12. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will post
            the revised version on this page and indicate the date of the latest
            revision at the top. If changes are material, we will provide
            additional notice (e.g., email or in-app alert) at least 7&nbsp;days
            before they take effect.
          </p>

          <h2>13. Contact Us</h2>
          <p>
            If you have any questions or concerns about this Privacy Policy or
            our privacy practices, please{' '}
            <Link href='/contact'>contact us</Link> or email us at{' '}
            <a href='mailto:support@agentic.so'>support@agentic.so</a>.
          </p>
        </Markdown>
      </section>
    </PageContainer>
  )
}
