import Link from 'next/link'
import { useRouter } from 'next/router'

const NavItem = ({ name, link, children, noDivider }) => {
  const router = useRouter()

  const highlightCheck = (link) => {
    if (router.pathname.includes('posts') && link == '/blog') {
      return true
    }

    return false
  }

  return (
    <>
      <div className="nav-item">
        <Link href={link}>
          <p className="link">{children}</p>
        </Link>
        {!noDivider && <p className="divider">||</p>}
      </div>
      <style jsx>{`
        .link {
          font-weight: ${router.pathname == link || highlightCheck(link)
            ? 'bold'
            : 'normal'};
          text-shadow: ${router.pathname == link || highlightCheck(link)
            ? '0px -1px 4px #00caff'
            : 'none'};
          color: black;
          @media (prefers-color-scheme: dark) {
            color: white;
          }
        }

        .divider {
          margin: 0 1ch;
          user-select: none;
        }

        div {
          display: flex;
        }

        @media (prefers-color-scheme: dark) {
          a {
            color: white;
          }
        }
      `}</style>
    </>
  )
}

export default NavItem
