'use client'

import { useState } from 'react'

import { ActiveLink } from '@/components/active-link'
import { useAgentic } from '@/components/agentic-provider'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

export function AuthenticatedHeader() {
  const ctx = useAgentic()
  const [isDropdownMenuOpen, setIsDropdownMenuOpen] = useState(false)

  if (!ctx?.isAuthenticated) {
    return null
  }

  return (
    <DropdownMenu
      open={isDropdownMenuOpen}
      onOpenChange={setIsDropdownMenuOpen}
    >
      <DropdownMenuTrigger asChild>
        <Avatar className='cursor-pointer'>
          <AvatarImage src={ctx.api.authSession!.user.image} />
          <AvatarFallback>
            {ctx.api.authSession!.user.username?.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        <DropdownMenuItem asChild>
          <ActiveLink href='/app' onClick={() => setIsDropdownMenuOpen(false)}>
            Dashboard
          </ActiveLink>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <ActiveLink
            href='/app/projects'
            onClick={() => setIsDropdownMenuOpen(false)}
          >
            My Projects
          </ActiveLink>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <ActiveLink
            href='/app/consumers'
            onClick={() => setIsDropdownMenuOpen(false)}
          >
            My Subscriptions
          </ActiveLink>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <ActiveLink
            href='/logout'
            onClick={() => setIsDropdownMenuOpen(false)}
          >
            Logout
          </ActiveLink>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
