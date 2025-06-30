import { ArrowLeft } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
// https://images.unsplash.com/photo-1545972154-9bb223aac798?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&fm=jpg&fit=crop&w=2048&q=80&exp=8&con=-15&sat=-75
import NotFoundImage from '@/public/not-found.jpg'

export default function NotFound() {
  return (
    <>
      <section className='relative max-w-2xl isolate min-h-full flex-auto'>
        <Image
          alt='404 not found'
          src={NotFoundImage.src}
          width={NotFoundImage.width}
          height={NotFoundImage.height}
          blurDataURL={NotFoundImage.blurDataURL}
          placeholder='blur'
          priority
          className='absolute inset-0 -z-10 size-full object-cover object-top rounded-xl'
        />

        <div className='mx-auto max-w-7xl px-6 py-32 text-center sm:py-40 lg:px-8'>
          <p className='text-base/8 font-semibold text-white'>404</p>

          <h1 className='mt-4 text-balance text-5xl font-semibold tracking-tight text-white sm:text-7xl'>
            Page not found
          </h1>

          <p className='mt-6 text-pretty text-lg font-medium text-white/70 sm:text-xl/8'>
            Sorry, we couldn’t find the page you’re looking for.
          </p>
        </div>
      </section>

      <Button asChild>
        <Link href='/'>
          <ArrowLeft
            aria-hidden='true'
            className='inline-block w-[1.2em] h-[1.2em] mr-1'
          />
          Back to home
        </Link>
      </Button>
    </>
  )
}
