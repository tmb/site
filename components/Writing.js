const Writing = ({ children }) => {
	return (
		<>
			<div className="container">{children}</div>
			<style jsx global>{`
				.container {
					margin-top: 4rem;
					margin-bottom: 4rem;
					margin-left: auto;
					margin-right: auto;

					max-width: 48rem;
					width: 100%;

					position: relative;

					* {
						font-family: IBM Plex Serif !important;
					}
					
					h1 {
						margin-bottom: 2rem;
					}

					a {
						color: #00caff;
					}

					p {
						margin-bottom: 1rem;
					}
				}
				`}</style>
		</>
	)
}

export const Subtitle = ({children}) => {
	return (
		<>
			<p>{children}</p>
			<style jsx>
				{`

					p {
						margin-top: -2rem;
					}

					`}
			</style>
		</>
		)
}

export default Writing
