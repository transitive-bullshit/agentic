'use client'

import type {
  PasswordRegisterError,
  PasswordRegisterState
} from '@agentic/openauth/provider/password'
import { useState } from 'react'

import { authCopy } from '@/lib/auth-copy'

export default function Page() {
  // TODO
  const [error, setError] = useState<PasswordRegisterError | undefined>(
    undefined
  )
  const [state, setState] = useState<PasswordRegisterState>({ type: 'start' })
  const [form, setForm] = useState<FormData | undefined>(undefined)

  const emailError = ['invalid_email', 'email_taken'].includes(
    error?.type || ''
  )

  const passwordError = [
    'invalid_password',
    'password_mismatch',
    'validation_error'
  ].includes(error?.type || '')

  return (
    <>
      <section>
        <h1 className='my-0! text-center text-balance leading-snug md:leading-none'>
          {authCopy.register}
        </h1>

        <form data-component='form' method='post'>
          {/* <FormAlert
            message={
              error?.type
                ? error.type === 'validation_error'
                  ? (error.message ?? authCopy?.[`error_${error.type}`])
                  : authCopy?.[`error_${error.type}`]
                : undefined
            }
          /> */}

          {state.type === 'start' && (
            <>
              <input type='hidden' name='action' value='register' />

              <input
                data-component='input'
                autoFocus={!error || emailError}
                type='email'
                name='email'
                value={!emailError ? form?.get('email')?.toString() : ''}
                required
                placeholder={authCopy.input_email}
              />

              <input
                data-component='input'
                autoFocus={passwordError}
                type='password'
                name='password'
                placeholder={authCopy.input_password}
                required
                value={!passwordError ? form?.get('password')?.toString() : ''}
                autoComplete='new-password'
              />

              <input
                data-component='input'
                type='password'
                name='repeat'
                required
                autoFocus={passwordError}
                placeholder={authCopy.input_repeat}
                autoComplete='new-password'
              />

              <button data-component='button'>
                {authCopy.button_continue}
              </button>

              <div data-component='form-footer'>
                <span>
                  {authCopy.login_prompt}{' '}
                  <a data-component='link' href='/login'>
                    {authCopy.login}
                  </a>
                </span>
              </div>
            </>
          )}

          {state.type === 'code' && (
            <>
              <input type='hidden' name='action' value='verify' />

              <input
                data-component='input'
                autoFocus
                name='code'
                minLength={6}
                maxLength={6}
                required
                placeholder={authCopy.input_code}
                autoComplete='one-time-code'
              />

              <button data-component='button'>
                {authCopy.button_continue}
              </button>
            </>
          )}
        </form>
      </section>
    </>
  )
}
