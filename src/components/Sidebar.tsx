'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavItem {
  label: string
  href: string
  external?: boolean
}

const navItems: NavItem[] = [
  { label: 'me', href: '/' },
  { label: 'writing', href: '/writing' },
  { label: 'reading', href: '/reading' },
  { label: '(not) banks', href: '/not-banks' },
]

const socialItems: NavItem[] = [
  { label: 'x', href: 'https://twitter.com/theombl', external: true },
  { label: 'substack', href: 'https://theombl.substack.com', external: true },
]

function NavLink({ label, href, external, active }: NavItem & { active?: boolean }) {
  const inner = (
    <>
      <span>[</span>
      <span className="mx-1">{label}</span>
      <span>]</span>
    </>
  )

  const className = `block ${active ? 'font-extrabold' : ''}`

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {inner}
      </a>
    )
  }

  return (
    <Link href={href} className={className}>
      {inner}
    </Link>
  )
}

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="md:pr-8 md:w-48 md:flex-shrink-0">
      <div className="mb-4">
        <div className="font-bold">Theo Bleier (@tmb)</div>
        <div className="overflow-hidden whitespace-nowrap select-none" aria-hidden>
          --------------------------------
        </div>
      </div>
      <nav className="flex flex-col gap-1">
        {navItems.map((item) => (
          <NavLink key={item.href} {...item} active={pathname === item.href} />
        ))}
      </nav>
      <div className="h-8" />
      <nav className="flex flex-col gap-1">
        {socialItems.map((item) => (
          <NavLink key={item.href} {...item} />
        ))}
      </nav>
    </aside>
  )
}
