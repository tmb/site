import NavBar from './NavBar'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { MDXProvider } from '@mdx-js/react'
import components from './mdxElements'
import Meta from '../components/Meta'

export default (meta) =>
  ({ children }) => {
    return (
      <MDXProvider components={components}>
        <Meta title={meta.title} />
        <Head>
          <title>Theo Bleier | {meta.title}</title>
        </Head>
        <NavBar />
        <div className="post">
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
              padding: 4rem 1rem;
              line-height: 1.625;

              @media (min-width: 48rem) {
                max-width: 48rem;
              }

              max-width: 32rem;
              width: 100%;

              position: relative;
            }
          `}</style>
        </div>
      </MDXProvider>
    )
  }
