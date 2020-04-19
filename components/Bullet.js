const Bullet = (props) => (
	<>
		<li>
			<a target="_blank" href={props.href}>{props.children}</a>
		</li>
		<style jsx>{`
			li {
				list-style-position: inside;
				list-style-type: none;
			}

			li a {
				color: black;
			}

			@media (prefers-color-scheme: dark) {
				li a {
					color: white;
				}
			}

			li:before {
				content: '*';
				margin-right: 1ch;
			}
		`}</style>
	</>
)

export default Bullet
