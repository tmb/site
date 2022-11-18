import NavItem from './NavItem'
import useWindowDimensions from '../hooks/useWindowDimensions'
import { useState, useEffect } from 'react'

const NavBar = ({ children, fixed }) => {
  const { width, height } = useWindowDimensions()
  const [navWidth, setNavWidth] = useState(0)

  useEffect(() => {
    setNavWidth(width)
  }, [width])

  return (
    <div className="nav-bar">
      <p className="logo">tmb.sh</p>
      <div className="nav-items">
        <NavItem link="/">home</NavItem>
        <NavItem link="/about">about</NavItem>
        <NavItem link="/invitation" noDivider={true}>
          invitation
        </NavItem>
      </div>

      <nav aria-hidden className="line">
        {'-'.repeat(0.15 * navWidth)}
      </nav>

      <style jsx>{`
        .logo {
          position: absolute;
          margin-left: 1rem;
          left: 0;
          font-weight: bold;
          display: none;

          @media (min-width: 32rem) {
            display: block;
          }
        }

        .nav-items {
          display: flex;
        }

        .nav-bar {
          height: 3rem;
          width: 100%;
          position: relative;

          @media (min-width: 48rem) {
            position: ${fixed ? 'absolute' : 'relative'};
          }
          display: flex;
          justify-content: center;
          align-items: center;
        }

        span {
          white-space: pre;
        }
        .line {
          height: 1.3ch;
          overflow: hidden;
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
        }
      `}</style>
    </div>
  )
}

export default NavBar
