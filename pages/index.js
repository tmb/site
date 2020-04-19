import Head from 'next/head'
import FancyBox from '../components/FancyBox'
import Bullet from '../components/Bullet'
import NavBar from '../components/NavBar'
import Link from 'next/link'
import { useContext } from 'react'
import ThemeContext from '../contexts/ThemeContext'

const Index = () => {
  const [theme, setTheme] = useContext(ThemeContext)

  return (
    <>
      <Head>
        <title>Theo Bleier</title>
      </Head>
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
          }

          a {
            color: white;
          }

          ul {
            margin-top: 0.5rem;
            margin-bottom: 0.5rem;
          }

          .container {
            display: flex;
            place-items: center;
            min-height: 100vh;
            padding: 0 1rem;
          }
        `}
      </style>
    </>
  )
}

export default Index
