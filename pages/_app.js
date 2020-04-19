// import App from 'next/app'
import '../fonts.css'
import ThemeContext from '../contexts/ThemeContext'
import { useState } from 'react'
import Head from 'next/head'

function MyApp({ Component, pageProps }) {
	const themeHook = useState('light')

	return (
		<>
			<ThemeContext.Provider value={themeHook}>
				<Head>
					<title>Theo Bleier</title>
				</Head>
				<Component {...pageProps} />
				<style jsx global>{`
					body {
						margin: 0;
						padding: 0;
					}
					* {
						box-sizing: border-box;
						margin: 0;
						padding: 0;
						font-family: "IBM Plex Mono", Menlo, monospace;
					}
					@media (prefers-color-scheme: dark) {
						body {
							background-color: #1e1e1e;
							color: #fff;
							a {
								color: #fff;
							}
						}
					}
				`}</style>
			</ThemeContext.Provider>
		</>
	)
}

// Only uncomment this method if you have blocking data requirements for
// every single page in your application. This disables the ability to
// perform automatic static optimization, causing every page in your app to
// be server-side rendered.
//
// MyApp.getInitialProps = async (appContext) => {
//   // calls page's `getInitialProps` and fills `appProps.pageProps`
//   const appProps = await App.getInitialProps(appContext);
//
//   return { ...appProps }
// }

export default MyApp
