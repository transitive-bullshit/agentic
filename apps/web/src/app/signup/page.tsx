import { Suspense } from 'react'

import { SignupForm } from './signup-form'

export default function Page() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  )
}
