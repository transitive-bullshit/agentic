'use client'

import { sanitizeSearchParams } from '@agentic/platform-core'
import { isValidEmail, isValidPassword } from '@agentic/platform-validators'
import { useForm } from '@tanstack/react-form'
import { Loader2Icon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'
import { z } from 'zod'

import {
  useNextUrl,
  useUnauthenticatedAgentic
} from '@/components/agentic-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { GitHubIcon } from '@/icons/github'
import { toastError } from '@/lib/notifications'
import { cn } from '@/lib/utils'

export function LoginForm() {
  const ctx = useUnauthenticatedAgentic()
  const nextUrl = useNextUrl()
  const router = useRouter()

  const onAuthWithGitHub = useCallback(async () => {
    const redirectUri = `${globalThis.location.origin}/auth/github/success?${sanitizeSearchParams({ next: nextUrl }).toString()}`

    const url = await ctx!.api.initAuthFlowWithGitHub({ redirectUri })

    void router.push(url)
  }, [ctx, nextUrl, router])

  const form = useForm({
    defaultValues: {
      email: '',
      password: ''
    },
    validators: {
      onChange: z.object({
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

        console.log('login success', res)
      } catch (err: any) {
        void toastError(err, { label: 'Login error' })
        return
      }

      return router.push(nextUrl || '/app')
    }
  })

  return (
    <section>
      <div className='flex-col flex-1 items-center justify-center w-full max-w-xs'>
        <form
          className={cn('flex flex-col gap-6 w-full')}
          onSubmit={(e) => {
            e.preventDefault()
            void form.handleSubmit()
          }}
        >
          <div className='flex flex-col items-center gap-2 text-center'>
            <h1 className='text-2xl font-bold'>Login to your account</h1>
          </div>

          <div className='grid gap-6'>
            <form.Field
              name='email'
              children={(field) => (
                <div className='grid gap-3'>
                  <Label htmlFor={field.name}>Email</Label>

                  <Input
                    id={field.name}
                    name={field.name}
                    type='email'
                    required
                    placeholder='Email'
                    autoComplete='email'
                    autoFocus={true}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e: any) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            />

            <form.Field
              name='password'
              children={(field) => (
                <div className='grid gap-3'>
                  <div className='flex items-center'>
                    <Label htmlFor={field.name}>Password</Label>

                    {/* <a
                        href='/forgot-password'
                        className='ml-auto text-xs underline-offset-4 hover:underline'
                        tabIndex={-1}
                      >
                        Forgot your password?
                      </a> */}
                  </div>

                  <Input
                    id={field.name}
                    name={field.name}
                    type='password'
                    required
                    placeholder='Password'
                    // autoFocus={error?.type === 'invalid_password'}
                    autoComplete='current-password'
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            />

            <form.Subscribe
              selector={(state) => [
                state.canSubmit,
                state.isSubmitting,
                state.isTouched
              ]}
              children={([canSubmit, isSubmitting, isTouched]) => (
                <Button
                  type='submit'
                  disabled={!(isTouched && canSubmit && ctx)}
                  className='w-full'
                >
                  {isSubmitting && <Loader2Icon className='animate-spin' />}

                  <span>Login</span>
                </Button>
              )}
            />

            <div className='after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t'>
              <span className='bg-background text-muted-foreground relative z-10 px-2'>
                Or continue with
              </span>
            </div>

            <Button
              variant='outline'
              className='w-full'
              onClick={onAuthWithGitHub}
            >
              <GitHubIcon />

              <span>Login with GitHub</span>
            </Button>
          </div>

          <div className='text-center text-xs'>
            Don&apos;t have an account?{' '}
            <a
              href={`/signup?${sanitizeSearchParams({ next: nextUrl }).toString()}`}
              className='underline underline-offset-4'
            >
              Sign up
            </a>
          </div>
        </form>
      </div>
    </section>
  )
}
