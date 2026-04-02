import AsciiCube from '@/components/AsciiCube'
import { CUBE_RIGHT_WHITESPACE_PX } from '@/components/AsciiCube/constants'

export default function Home() {
  // Base margin we want on both sides (px, matching Tailwind p-8 = 32px)
  const baseMarginPx = 32
  // On md+, add extra left padding to balance cube's internal whitespace
  const balancedLeftPaddingPx = baseMarginPx + CUBE_RIGHT_WHITESPACE_PX

  return (
    <div
      className="mt-12 min-h-screen p-8 md:pl-[--balanced-left-padding]"
      style={
        {
          '--balanced-left-padding': `${balancedLeftPaddingPx}px`,
        } as React.CSSProperties
      }
    >
      <div className="md:flex md:justify-between md:items-start md:gap-8">
        <main className="max-w-xl">
          <h1 className="font-bold mb-4">Theo Bleier (@tmb)</h1>
          <p className="mb-4">
            I work at{' '}
            <a
              href="https://simile.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Simile
            </a>
            .
          </p>{' '}
          <p className="mb-4">
            My primary interests lie in engineering, understanding how people
            work together, and how technological progress will change the fabric
            of our economy. I also like to go on really long walks.
          </p>
          <p className="mb-4">
            I live in San Francisco, CA, where I moved after spending most of my
            life in central Massachusetts.
          </p>
          <nav className="flex gap-1">
            <span>[</span>
            <a
              href="https://twitter.com/theombl"
              target="_blank"
              rel="noopener noreferrer"
            >
              twitter
            </a>
            <span>]</span>
            <span className="mx-1">|</span>
            <span>[</span>
            <a
              href="https://theombl.substack.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              substack
            </a>
            <span>]</span>
          </nav>
        </main>
        <div className="md:-mt-[92px] flex justify-center md:justify-end md:flex-shrink-0">
          <AsciiCube />
        </div>
      </div>
    </div>
  )
}
