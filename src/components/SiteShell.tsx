import AsciiCube from '@/components/AsciiCube'
import Sidebar from '@/components/Sidebar'
import { CUBE_RIGHT_WHITESPACE_PX } from '@/components/AsciiCube/constants'

export default function SiteShell({ children }: { children: React.ReactNode }) {
  // Base margin we want on both sides (px, matching Tailwind p-8 = 32px)
  const baseMarginPx = 32
  // On md+, add extra left padding to balance cube's internal whitespace
  const balancedLeftPaddingPx = baseMarginPx + CUBE_RIGHT_WHITESPACE_PX

  return (
    <div
      className="min-h-screen p-8 pt-20 md:pl-[--balanced-left-padding]"
      style={
        {
          '--balanced-left-padding': `${balancedLeftPaddingPx}px`,
        } as React.CSSProperties
      }
    >
      <div className="md:flex md:items-start md:gap-8">
        <Sidebar />
        <div className="md:flex md:flex-1 md:justify-between md:items-start md:gap-8">
          <main className="max-w-2xl mt-8 md:mt-0">{children}</main>
          <div className="md:-mt-[98px] flex justify-center md:justify-end md:flex-shrink-0">
            <AsciiCube />
          </div>
        </div>
      </div>
    </div>
  )
}
