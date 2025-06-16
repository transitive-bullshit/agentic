'use client'

import type {
  PasswordChangeError,
  PasswordChangeState
} from '@agentic/openauth/provider/password'
import { useState } from 'react'

import { authCopy } from '@/lib/auth-copy'

export default function ForgotPasswordPage() {
  // TODO
  const [error] = useState<PasswordChangeError | undefined>(undefined)
  const [state] = useState<PasswordChangeState>({
    type: 'start',
    redirect: '/' // TODO
  })
  const [form] = useState<FormData | undefined>(undefined)

  const passwordError = [
    'invalid_password',
    'password_mismatch',
    'validation_error'
  ].includes(error?.type || '')

  return (
    <>
      <section>
        <h1 className='my-0! text-center text-balance leading-snug md:leading-none'>
          {authCopy.change_prompt}
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
              <input type='hidden' name='action' value='code' />

              <input
                data-component='input'
                autoFocus
                type='email'
                name='email'
                required
                value={form?.get('email')?.toString()}
                placeholder={authCopy.input_email}
              />
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
            </>
          )}

          {state.type === 'update' && (
            <>
              <input type='hidden' name='action' value='update' />

              <input
                data-component='input'
                autoFocus
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
                value={!passwordError ? form?.get('password')?.toString() : ''}
                placeholder={authCopy.input_repeat}
                autoComplete='new-password'
              />
            </>
          )}
          <button data-component='button'>{authCopy.button_continue}</button>
        </form>

        {state.type === 'code' && (
          <form method='post'>
            <input type='hidden' name='action' value='code' />

            <input type='hidden' name='email' value={state.email} />

            {state.type === 'code' && (
              <div data-component='form-footer'>
                <span>
                  {authCopy.code_return}{' '}
                  <a data-component='link' href='/login'>
                    {authCopy.login.toLowerCase()}
                  </a>
                </span>

                <button data-component='link'>{authCopy.code_resend}</button>
              </div>
            )}
          </form>
        )}
      </section>
    </>
  )
}
