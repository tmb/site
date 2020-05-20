import FancyBox from '../components/FancyBox'
import Bullet from '../components/Bullet'
import NavBar from '../components/NavBar'
import Link from 'next/link'
import { useContext } from 'react'
import ThemeContext from '../contexts/ThemeContext'
import Meta from '../components/Meta'

const Index = () => {
  const [theme, setTheme] = useContext(ThemeContext)

  return (
    <>
      <Meta/>
      <NavBar fixed={true} />
      <div className="container">
        <FancyBox>
          <div className="grid">
            <div>
              <p className="title">
                <strong># theo bleier</strong>
              </p>
              <p className="subtitle">
                <i>_hacker_</i>
              </p>

              <ul>
                <Bullet href="https://github.com/tmb">github</Bullet>
                <Bullet href="https://twitter.com/theombl">twitter</Bullet>
                <Bullet href="https://linkedin.com/in/theombl">linkedin</Bullet>
                <Bullet href="mailto:me@tmb.sh">e-mail</Bullet>
              </ul>

              <p>
                <Link href="/about">
                  <a>[more]</a>
                </Link>
                (/more)
              </p>
            </div>
            <div>
              <img src="me.jpg" />
            </div>
          </div>
        </FancyBox>
      </div>
      <style jsx>
        {`
          .title {
            margin-bottom: 0;
          }

          .subtitle {
            margin-top: 0rem;
          }

          img {
            max-width: 100%;
          }

          @media (min-width: 48rem) {
            .grid {
              grid-template-columns: repeat(2, 1fr);
            }
          }

          .grid {
            display: grid;
            grid-gap: 1rem;
          }

          ul {
            margin-top: 0.5rem;
            margin-bottom: 0.5rem;
          }

          .container {
            display: flex;
            place-items: center;

            @media (min-width: 48rem) {
              min-height: 100vh;
              margin-top: 0;
              margin-bottom: 0;
            }

            flex-grow: 1;

            padding: 1rem;
          }
        `}
      </style>
      <style jsx global>{`
        #__next {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }
      `}</style>
    </>
  )
}

export default Index
