import Link from 'next/link'

const Post = ({ meta }) => {
  return (
    <div>
      <div className="info">
        <Link href={meta.path}>{meta.title}</Link>
        <span className="date">
          {new Date(meta.date).toLocaleDateString('en-US')} in {meta.in}
        </span>
      </div>
      <p>{meta.description}</p>
      <style jsx>{`
        * {
          font-family: 'IBM Plex Serif';
        }

        .info {
          margin-bottom: 1rem;

          a {
            font-size: 2em;
            display: block;
          }
        }

        .date {
          font-style: italic;
        }

        div {
          margin-bottom: 1.5rem;
        }
      `}</style>
    </div>
  )
}

export default Post
