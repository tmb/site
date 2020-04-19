import NavBar from './NavBar'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { MDXProvider } from '@mdx-js/react'
import components from './mdxElements'

export default (meta) => ({ children }) => {
	return (
		<MDXProvider components={components}>
			<Head>
				<title>Theo Bleier | {meta.title}</title>
			</Head>
			<NavBar />
			<div className="post">
				{children}
				<style jsx global>{`
					.post * {
						font-family: "IBM Plex Serif"
					}
					`}
				</style>
				<style jsx>{`
					.post {
						margin-top: 4rem;
						margin-bottom: 4rem;
						margin-left: auto;
						margin-right: auto;

						max-width: 48rem;
						width: 100%;

						position: relative;
					}
					`}</style>
			</div>
		</MDXProvider>
	)
}
