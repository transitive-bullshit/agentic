import Link from 'next/link'

import { Markdown } from '@/components/markdown'
import { PageContainer } from '@/components/page-container'

const lastUpdatedDate = 'June 30, 2025'

export default function AboutPage() {
  return (
    <PageContainer>
      <h1 className='text-center text-balance leading-snug md:leading-none text-4xl font-semibold'>
        Terms of Service
      </h1>

      <section>
        <Markdown>
          <p>
            <em>Last updated: {lastUpdatedDate}</em>
          </p>

          <h2>1. Introduction</h2>
          <p>
            These Terms of Service (<strong>"Terms"</strong>) govern your access
            to and use of Agentic Systems, Inc.'s websites, software, and
            related services (collectively, the <strong>"Service"</strong>).
            Agentic (<strong>"Agentic," "we," "us,"</strong> or{' '}
            <strong>"our"</strong>) provides three distinct but connected
            offerings:
          </p>

          <p>
            <strong>(a) Agentic Marketplace</strong> – A curated app store of
            LLM tool products exposed via both Model Context Protocol (MCP) and
            standard HTTP&nbsp;APIs.
          </p>

          <p>
            <strong>(b) Agentic Gateway</strong> – A fully managed MCP gateway
            that enables developers to deploy and monetize their own MCP or
            OpenAPI products, whether privately or publicly.
          </p>

          <p>
            <strong>(c) Agentic Open-Source Project</strong> – The
            source-available software released under the GNU&nbsp;AGPL-3.0
            license.
          </p>

          <p>
            By creating an account, clicking "I&nbsp;agree," or otherwise using
            any part of the Service, you acknowledge that you have read,
            understood, and agree to be legally bound by these Terms. If you do
            not agree, you must not access or use the Service.
          </p>

          <h2>2. Eligibility &amp; Account Registration</h2>
          <p>
            You must be at least 18&nbsp;years old and legally capable of
            entering into contracts to use the Service. When you register an
            Agentic account you agree to (i) provide accurate, current, and
            complete information; (ii) maintain the security of your
            credentials; and (iii) promptly update your information as
            necessary. You are responsible for all activity occurring under your
            account.
          </p>

          <h2>3. Plans, Subscriptions &amp; Fees</h2>
          <p>
            Pricing for Marketplace purchases and Gateway subscriptions is
            described on the applicable order page or pricing dashboard. All
            charges are processed by Stripe and are due within the payment
            period stated at checkout. Except as required by law, payments are
            non-refundable. We may modify our pricing with at least&nbsp;30
            days' notice, which will take effect in your next billing cycle.
            Developers publishing products to the Agentic Marketplace must also
            agree to the{' '}
            <a
              href='https://stripe.com/legal/connect-account'
              target='_blank'
              rel='noopener noreferrer'
            >
              Stripe Connect Account Agreement
            </a>
            .
          </p>

          <h2>4. Marketplace-Specific Terms</h2>
          <p>
            (a) <strong>API Consumers.</strong> When you purchase access to a
            product in the Marketplace you receive a non-exclusive,
            non-transferable, revocable license to call that API subject to any
            usage limits and other terms displayed on the product page.
          </p>

          <p>
            (b) <strong>API Providers.</strong> If you list a product in the
            Marketplace you (i) represent that you have all rights necessary to
            offer the product; (ii) grant each purchaser the license described
            above; and (iii) authorize Agentic to collect payments on your
            behalf and remit amounts owed to you, less any platform fees.
          </p>

          <h2>5. Gateway-Specific Terms</h2>
          <p>
            You may deploy private or public APIs through the Gateway. You are
            solely responsible for the security, legality, and performance of
            the APIs you deploy. If you enable billing, you appoint Agentic as
            your limited payments collection agent for the purpose of accepting
            payments from end users via Stripe.
          </p>

          <h2>6. Open-Source Project</h2>
          <p>
            The Agentic open-source codebase is licensed under the{' '}
            <Link
              href='https://github.com/transitive-bullshit/agentic/blob/main/license'
              className='link'
              target='_blank'
              rel='noopener noreferrer'
            >
              GNU&nbsp;AGPL-3.0 license
            </Link>
            . Your use of the open-source project is governed solely by that
            license. Nothing in these Terms will be interpreted to limit your
            rights granted under the AGPL-3.0, nor to grant additional rights
            beyond it.
          </p>

          <h2>7. User Content</h2>
          <p>
            "<strong>User Content</strong>" means any code, text, data, or other
            materials you upload to the Service, including APIs, metadata, and
            documentation. You retain all ownership rights in your User Content.
            You hereby grant Agentic a worldwide, non-exclusive, royalty-free
            license to host, cache, reproduce, display, perform, modify (solely
            for technical purposes, e.g.&nbsp;formatting), and distribute your
            User Content as necessary to operate and improve the Service. You
            are solely responsible for your User Content and represent that you
            have all rights necessary to grant this license and that your User
            Content does not violate any law or third-party rights.
          </p>

          <h2>8. Acceptable Use Policy</h2>
          <p>
            You agree not to (i) violate applicable laws; (ii) infringe the
            intellectual-property or privacy rights of others; (iii) transmit
            malicious code; (iv) attempt to gain unauthorized access to the
            Service; (v) interfere with the integrity or performance of the
            Service; or (vi) send spam or engage in fraudulent or deceptive
            practices. We may suspend or terminate accounts that violate this
            policy.
          </p>

          <h2>9. Privacy &amp; Security</h2>
          <p>
            Our collection and use of personal information is described in our
            <Link href='/privacy'>Privacy&nbsp;Policy</Link>. We implement
            appropriate technical and organizational measures to safeguard your
            data; however, no security measure is perfect and we cannot
            guarantee absolute security.
          </p>

          <h2>10. Intellectual Property</h2>
          <p>
            The Service, including all associated software, content, and
            trademarks, is owned by Agentic or its licensors and is protected by
            intellectual-property laws. Except for the rights expressly granted
            to you in these Terms, we reserve all rights, title, and interest in
            the Service.
          </p>

          <h2>11. Suspension &amp; Termination</h2>
          <p>
            We may suspend or terminate your access to the Service at any time
            if we believe you have violated these Terms or if necessary to
            protect the Service or its users. Upon termination, your right to
            use the Service will cease immediately, but Sections&nbsp;6–16 will
            survive.
          </p>

          <h2>12. Disclaimers</h2>
          <p>
            THE SERVICE IS PROVIDED <strong>"AS&nbsp;IS"</strong> AND
            <strong>"AS&nbsp;AVAILABLE"</strong> WITHOUT WARRANTY OF ANY KIND.
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, AGENTIC DISCLAIMS ALL
            WARRANTIES, WHETHER EXPRESS, IMPLIED, STATUTORY, OR OTHERWISE,
            INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND
            NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE
            UNINTERRUPTED, ERROR-FREE, OR SECURE.
          </p>

          <h2>13. Limitation of Liability</h2>
          <p>
            TO THE FULLEST EXTENT PERMITTED BY LAW, IN NO EVENT WILL AGENTIC BE
            LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR
            EXEMPLARY DAMAGES (INCLUDING LOSS OF PROFITS, GOODWILL, OR DATA)
            ARISING OUT OF OR IN CONNECTION WITH THE SERVICE, EVEN IF ADVISED OF
            THE POSSIBILITY OF SUCH DAMAGES. AGENTIC'S TOTAL LIABILITY UNDER
            THESE TERMS WILL NOT EXCEED THE GREATER OF (A)&nbsp;FEES YOU PAID TO
            AGENTIC IN THE&nbsp;12 MONTHS PRECEDING THE EVENT GIVING RISE TO THE
            CLAIM OR (B)&nbsp;USD&nbsp;100.
          </p>

          <h2>14. Indemnification</h2>
          <p>
            You will indemnify and hold harmless Agentic and its officers,
            directors, employees, and agents from and against any third-party
            claims, damages, and expenses (including reasonable attorneys' fees)
            arising out of or related to your (i) breach of these Terms, (ii)
            User Content, or (iii) violation of any law or third-party rights.
          </p>

          <h2>15. Governing Law &amp; Venue</h2>
          <p>
            These Terms are governed by the laws of the State of Delaware,
            excluding its conflict-of-laws rules. The state and federal courts
            located in Wilmington, Delaware will have exclusive jurisdiction to
            adjudicate any dispute arising out of or relating to these Terms or
            the Service, and you consent to personal jurisdiction and venue in
            those courts.
          </p>

          <h2>16. Changes to These Terms</h2>
          <p>
            We may update these Terms by posting a revised version on our
            website and providing notice via email or in-app notification at
            least&nbsp;7 days before the effective date. Continued use of the
            Service after the effective date constitutes acceptance of the
            revised Terms.
          </p>

          <h2>17. Contact</h2>
          <p>
            Questions or notices required under these Terms should be sent to
            <a href='mailto:support@agentic.so'>support@agentic.so</a>. You may
            also
            <Link href='/contact'>contact&nbsp;us</Link> through our website.
          </p>
        </Markdown>
      </section>
    </PageContainer>
  )
}
