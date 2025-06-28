import { Suspense } from 'react'

import { PageContainer } from '@/components/page-container'

import { SignupForm } from './signup-form'

export default function Page() {
  return (
    <Suspense>
      <PageContainer>
        <SignupForm />
      </PageContainer>
    </Suspense>
  )
}
