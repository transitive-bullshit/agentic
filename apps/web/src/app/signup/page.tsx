'use client'

import {
  isValidEmail,
  isValidPassword,
  isValidUsername
} from '@agentic/platform-validators'
import { useForm } from '@tanstack/react-form'
import { Loader2Icon } from 'lucide-react'
import { redirect, RedirectType } from 'next/navigation'
import { useCallback } from 'react'
import { z } from 'zod'

import { useUnauthenticatedAgentic } from '@/components/agentic-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { GitHubIcon } from '@/icons/github'
import { toastError } from '@/lib/notifications'
import { cn } from '@/lib/utils'

export default function SignupPage() {
  // const [error] = useState<PasswordLoginError | undefined>(undefined)
  const ctx = useUnauthenticatedAgentic()

  const form = useForm({
    defaultValues: {
      email: '',
      username: '',
      password: '',
      repeat: ''
    },
    validators: {
      onChange: z.object({
        email: z
          .string()
          .email()
          .refine((email) => isValidEmail(email)),
        username: z.string().refine((username) => isValidUsername(username)),
        password: z.string().refine((password) => isValidPassword(password)),
        repeat: z.string().refine((password) => isValidPassword(password))
      })
    },
    onSubmit: async ({ value }) => {
      try {
        if (value.password !== value.repeat) {
          void toastError('Passwords do not match', { label: 'signup error' })
          return
        }

        const res = await ctx!.api.signUpWithPassword({
          email: value.email,
          username: value.username,
          password: value.password
        })

        console.log('signup success', res)
      } catch (err: any) {
        void toastError(err, { label: 'signup error' })
        return
      }

      return redirect('/app', RedirectType.push)
    }
  })

  const onAuthWithGitHub = useCallback(async () => {
    const url = await ctx!.api.initAuthFlowWithGitHub({
      redirectUri: `${globalThis.location.origin}/auth/github/success`
    })

    redirect(url, RedirectType.push)
  }, [ctx])

  return (
    <>
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
              <h1 className='text-2xl font-bold'>Create an account</h1>
              <p className='text-muted-foreground text-sm text-balance'>
                Enter your info below to create an account
              </p>
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
                name='username'
                children={(field) => (
                  <div className='grid gap-3'>
                    <Label htmlFor={field.name}>Username</Label>

                    <Input
                      id={field.name}
                      name={field.name}
                      type='text'
                      required
                      placeholder='Username'
                      autoComplete='username'
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
                    <Label htmlFor={field.name}>Password</Label>

                    <Input
                      id={field.name}
                      name={field.name}
                      type='password'
                      required
                      placeholder='Password'
                      // autoFocus={error?.type === 'invalid_password'}
                      autoComplete='new-password'
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  </div>
                )}
              />

              <form.Field
                name='repeat'
                children={(field) => (
                  <div className='grid gap-3'>
                    <Label htmlFor={field.name}>Repeat password</Label>

                    <Input
                      id={field.name}
                      name={field.name}
                      type='password'
                      required
                      placeholder='Password'
                      autoComplete='new-password'
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
                    <span>Sign up</span>
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

                <span>Sign up with GitHub</span>
              </Button>
            </div>

            <div className='text-center text-xs'>
              Already have an account?{' '}
              <a href='/login' className='underline underline-offset-4'>
                Login
              </a>
            </div>
          </form>
        </div>
      </section>
    </>
  )
}
