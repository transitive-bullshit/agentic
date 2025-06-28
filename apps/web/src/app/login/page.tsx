import { Suspense } from 'react'

import { PageContainer } from '@/components/page-container'

import { LoginForm } from './login-form'

export default function Page() {
  return (
    <Suspense>
      <PageContainer>
        <LoginForm />
      </PageContainer>
    </Suspense>
  )
}
