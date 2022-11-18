import NavBar from './NavBar'
import Meta from './Meta'
import Head from 'next/head'
import Link from 'next/link'
import { MDXProvider } from '@mdx-js/react'
import components from './mdxElements'
import { useRouter } from 'next/router'

export default (meta) =>
  ({ children }) => {
    const router = useRouter()

    return (
      <MDXProvider components={components}>
        <Meta
          title={"Theo Bleier's Blog - " + meta.title}
          description={meta.description}
          url={'https://tmb.sh' + router.pathname}
        />
        <Head>
          <title>Theo Bleier | {meta.title}</title>
        </Head>
        <NavBar />
        <div className="post">
          <Link href="/blog">← Back to index</Link>
          <div className="info">
            <h1>{meta.title}</h1>
            <span className="signa">Written on {meta.date} by Theo</span>
          </div>
          {children}
          <style jsx global>
            {`
              .post * {
                font-family: 'IBM Plex Serif';
              }
            `}
          </style>
          <style jsx>{`
            .post {
              margin-left: auto;
              margin-right: auto;
              padding: 4rem 2rem;
              line-height: 1.625;

              @media (min-width: 48rem) {
                max-width: 48rem;
              }

              max-width: 32rem;
              width: 100%;

              position: relative;

              .info {
                margin-bottom: 1.25rem;
                h1 {
                  margin-bottom: -0.5rem;
                }
              }
            }
          `}</style>
        </div>
      </MDXProvider>
    )
  }
