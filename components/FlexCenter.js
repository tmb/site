const FlexCenter = (props) => (
	<>
		<div>
			{props.children}
		</div>
		<style jsx>{`
			div {
				display: flex;
				justify-content: center;
				align-items: center;
				height: 100vh;
				width: 100%;
			}
		`}</style>
	</>
	)

export default FlexCenter