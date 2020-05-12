import NavBar from '../components/NavBar'
import Post from '../components/Post'

const Blog = () => {
	return (
	<>
		<NavBar/>
		<div>
      <Post title={'Welcome!'} text={'Lorem ipsum'}/>        
      <style jsx>
		    {`
		      div {
            padding: 4rem;
            margin: auto;
		        width: 100%;
            max-width: 40rem;
		      }
		    `}
		  </style>
		</div>
	</>
	)

}

export default Blog
