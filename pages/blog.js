import NavBar from '../components/NavBar'
import Post from '../components/Post'
import Meta from '../components/Meta'

const Blog = (props) => {
  const posts = JSON.parse(props.posts)
  return (
    <>
      <Meta
        title={'Blog'}
        description={'The place where Theo writes things!'}
        url={'https://tmb.sh/blog'}
      />
      <NavBar />
      <div>
        {posts.map((p, i) => {
          return <Post meta={p} />
        })}
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

export async function getStaticProps(context) {
  const fs = require('fs')
  const path = require('path')

  let posts = []

  let postPath = path.join(process.cwd(), 'pages/posts')

  fs.readdirSync(postPath).forEach(async (file) => {
    // this is so deeply, incredibly janky. if you are reading this and have a better way to go about it, pls lmk lol
    let content = fs.readFileSync(path.join(postPath, file), 'utf-8')
    let regex = /export const meta = {(.*?)}/s

    let result = content.match(regex)[1]
    let toEval = `let obj = {${result}}; obj;`.replace(/\n/g, '')

    let meta = eval(toEval)
    meta.path = '/posts/' + file.replace('.mdx', '')
    if (!meta.draft) {
      posts.push(meta)
    }
  })
  return { props: { posts: JSON.stringify(posts) } }
}

export default Blog
