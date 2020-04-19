const H1 = ({ children }) => {
	return (
		<h1>
			{children}
			<style jsx>{`
				h1 {
					margin-bottom: 2rem;
				}
			`}</style>
		</h1>
	)
}

const P = ({ children }) => {
	return (
		<p>
			{children}
			<style jsx>{`
				p {
					margin-bottom: 1rem;
				}
			`}</style>
		</p>
	)
}

const A = ({ href, children }) => {
	return (
		<a href={href} target={href.includes("http") ? "_blank" : "_self"}>
			{children}
			<style jsx>{`
				a {
					color: #00caff;
				}
			`}</style>
		</a>
	)
}

export const Subtitle = ({ children }) => {
	return (
		<div className="subtitle">
			{children}
			<style jsx>
				{`
					.subtitle > :global(p) {
						margin-top: -2rem;
						margin-bottom: 2rem;
					}
				`}
			</style>
		</div>
	)
}

export default {
	h1: H1,
	p: P,
	a: A,
}
