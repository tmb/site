import Link from 'next/link'
import { useRouter } from 'next/router'

const NavItem = ({ name, link, children }) => {
	const router = useRouter()
	
	const highlightCheck = (link) => {
		if (router.pathname.includes('posts') && link == "/blog") {
			return true;
		}

		return false;
	}

  return (
    <>
      <Link href={link}>
        <a>{children}</a>
      </Link>
      <style jsx>{`
        a {
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
      `}</style>
      <style jsx>{`
        a + a:before {
          content: ' || ';
          text-decoration: none;
          text-shadow: none;
          font-weight: normal;
          display: inline-block;
          white-space: pre;
          pointer-events: none;
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
