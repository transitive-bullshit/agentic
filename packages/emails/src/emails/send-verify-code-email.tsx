import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Tailwind,
  Text
} from '@react-email/components'
import React from 'react'

export interface SendVerifyCodeEmailProps {
  code: string
}

const logoUrl =
  'https://mintlify.s3.us-west-1.amazonaws.com/agentic/media/agentic-logo-light.svg'

function SendVerifyCodeEmail({ code }: SendVerifyCodeEmailProps) {
  const previewText = 'Verify your email address'

  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className='mx-auto my-auto bg-white px-2 font-sans'>
          <Preview>{previewText}</Preview>

          <Container className='mx-auto my-[40px] max-w-[465px] rounded border border-[#eaeaea] border-solid p-[20px]'>
            <Section className='mt-[32px]'>
              <Img
                src={logoUrl}
                width='203'
                height='48'
                alt='Agentic Logo'
                className='mx-auto my-0'
              />
            </Section>

            <Heading className='mx-0 my-[30px] p-0 text-center font-normal text-[24px] text-black'>
              Verify your email address
            </Heading>

            <Section style={verificationSection}>
              <Text style={verifyText}>Verification code</Text>

              <Text style={codeText}>{code}</Text>
            </Section>

            <Hr className='mx-0 my-[26px] w-full border border-[#eaeaea] border-solid' />

            <Text className='text-[#666666] text-[12px] leading-[24px]'>
              If you didn’t sign up for Agentic, you can safely ignore this
              email. Someone else might have typed your email address by
              mistake.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

const text = {
  color: '#333',
  fontSize: '14px',
  margin: '24px 0'
}

const verifyText = {
  ...text,
  margin: 0,
  textAlign: 'center' as const
}

const codeText = {
  ...text,
  fontSize: '36px',
  margin: '12px 0',
  textAlign: 'center' as const
}

const verificationSection = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
}

SendVerifyCodeEmail.PreviewProps = {
  code: '123456'
} as SendVerifyCodeEmailProps

export default SendVerifyCodeEmail
