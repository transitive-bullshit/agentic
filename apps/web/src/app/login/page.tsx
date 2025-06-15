'use client'

import type { PasswordLoginError } from '@agentic/openauth/provider/password'
import type { AuthorizeResult } from '@agentic/platform-api-client'
import { isValidEmail, isValidPassword } from '@agentic/platform-validators'
import { useForm } from '@tanstack/react-form'
import ky from 'ky'
import { useEffect, useState } from 'react'
import { useCookie, useLocalStorage } from 'react-use'
import { z } from 'zod'

import { useAgentic } from '@/components/agentic-provider'
import { authCopy } from '@/lib/auth-copy'

// function FieldInfo({ field }: { field: AnyFieldApi }) {
//   return (
//     <>
//       {field.state.meta.isTouched && !field.state.meta.isValid ? (
//         <em>{field.state.meta.errors.join(',')}</em>
//       ) : null}

//       {field.state.meta.isValidating ? 'Validating...' : null}
//     </>
//   )
// }

export default function Page() {
  const [error] = useState<PasswordLoginError | undefined>(undefined)
  const { api } = useAgentic()
  const [localAuthResult, setLocalAuthResult] = useState<
    AuthorizeResult | undefined
  >(undefined)
  const [_, setAuthResult] = useLocalStorage<AuthorizeResult | undefined>(
    'auth-result'
  )
  const [authorizationCookie] = useCookie('authorization')

  useEffect(() => {
    ;(async function () {
      if (api && !localAuthResult && !authorizationCookie) {
        const authResult = await api.initAuthFlow({
          provider: 'password',
          redirectUri: new URL(
            `/auth/password/success`,
            globalThis.window.location.origin
          ).toString()
        })

        console.log('authResult', authResult, {
          provider: 'password',
          redirectUri: new URL(
            `/auth/password/success`,
            globalThis.window.location.origin
          ).toString()
        })

        const res2 = await ky.get(authResult.url)
        console.log('authResult2', res2)
        console.log('authorizationCookie', res2.headers.get('Set-Cookie'))

        setLocalAuthResult(authResult)
        setAuthResult(authResult)
      }
    })()
  }, [
    localAuthResult,
    setLocalAuthResult,
    setAuthResult,
    api,
    authorizationCookie
  ])

  const form = useForm({
    defaultValues: {
      email: '',
      password: ''
    },
    validators: {
      onBlurAsync: z.object({
        email: z
          .string()
          .email()
          .refine((email) => isValidEmail(email)),
        password: z.string().refine((password) => isValidPassword(password))
      })
    },
    onSubmit: async ({ value }) => {
      try {
        const body = new FormData()
        body.append('email', value.email)
        body.append('password', value.password)

        console.log('authorizationCookie', authorizationCookie)

        const res = await api.ky
          .post('password/authorize', { body })
          .json<any>()

        if (res.error) {
          console.error('login error', res.error)
        } else {
          console.log('login success', res)
        }
      } catch (err) {
        console.error('login error', err)
      }
    }
  })

  return (
    <>
      <section>
        <h1 className='my-0! text-center text-balance leading-snug md:leading-none'>
          Log In
        </h1>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            void form.handleSubmit()
          }}
        >
          {/* <FormAlert
            message={error?.type && authCopy?.[`error_${error.type}`]}
          /> */}

          <form.Field
            name='email'
            children={(field) => (
              <>
                {/* <label htmlFor={field.name}>Email:</label> */}

                <input
                  id={field.name}
                  name={field.name}
                  type='email'
                  required
                  placeholder={authCopy.input_email}
                  autoFocus={!error}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />

                {/* <FieldInfo field={field} /> */}
              </>
            )}
          />

          <form.Field
            name='password'
            children={(field) => (
              <>
                {/* <label htmlFor={field.name}>Password:</label> */}

                <input
                  id={field.name}
                  name={field.name}
                  type='password'
                  required
                  placeholder={authCopy.input_password}
                  autoFocus={error?.type === 'invalid_password'}
                  autoComplete='current-password'
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />

                {/* <FieldInfo field={field} /> */}
              </>
            )}
          />

          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit, isSubmitting]) => (
              <button type='submit' disabled={!canSubmit}>
                {isSubmitting ? '...' : authCopy.button_continue}
              </button>
            )}
          />

          <div data-component='form-footer'>
            <span>
              {authCopy.register_prompt}{' '}
              <a data-component='link' href='/signup'>
                {authCopy.register}
              </a>
            </span>

            <a data-component='link' href='/forgot-password'>
              {authCopy.change_prompt}
            </a>
          </div>
        </form>
      </section>
    </>
  )
}
