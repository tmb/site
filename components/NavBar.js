import NavItem from './NavItem'
import useWindowDimensions from '../hooks/useWindowDimensions'

const NavBar = ({ children, fixed }) => {
	const { width, height } = useWindowDimensions()

	return (
		<>
			<div className="navBar">
				<p className="logo">tmb.sh</p>
				<NavItem link="/">home</NavItem>
				<NavItem link="/about">about</NavItem>
				{/* <NavItem link="/blog">blog</NavItem> */}
				<NavItem link="/invitation">invitation</NavItem>
				<nav aria-hidden className="line">{'-'.repeat(0.15 * width)}</nav>
			</div>
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
				.navBar {
					height: 3rem;
					width: 100vw;
					position: ${fixed ? 'absolute' : 'relative'};
					display: flex;
					justify-content: center;
					align-items: center;
				}
				span {
					white-space: pre;
				}
				.line {
					height: 1ch;
					overflow: hidden;
					position: absolute;
					bottom: 0;
					left: 0;
				}
			`}</style>
		</>
	)
}

export default NavBar