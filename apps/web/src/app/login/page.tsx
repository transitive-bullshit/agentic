'use client'

import type { PasswordLoginError } from '@agentic/openauth/provider/password'
import { isValidEmail, isValidPassword } from '@agentic/platform-validators'
import { useForm } from '@tanstack/react-form'
import { redirect, RedirectType } from 'next/navigation'
import { useState } from 'react'
import { z } from 'zod'

import { useUnauthenticatedAgentic } from '@/components/agentic-provider'
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

export default function LoginPage() {
  const [error] = useState<PasswordLoginError | undefined>(undefined)
  const ctx = useUnauthenticatedAgentic()

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
        const res = await ctx!.api.signInWithPassword({
          email: value.email,
          password: value.password
        })

        // TODO
        console.log('login success', res)
        redirect('/app', RedirectType.push)
      } catch (err) {
        // TODO
        console.error('login error', err)
      }
    }
  })

  // TODO:
  if (!ctx) return null

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
              <button type='submit' disabled={!canSubmit || !ctx}>
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
