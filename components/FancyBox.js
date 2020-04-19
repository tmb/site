import { useEffect, useState } from 'react'

const FancyBox = ({ children }) => {
  const [animation, setAnimation] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setAnimation((a) => !a)
    }, 450)
    return () => {
      clearInterval(timer)
    }
  }, [])

  let pattern = ['+-', '-+']

  return (
    <article>
      <div aria-hidden className="top">
        {(animation ? pattern[0] : pattern[1]).repeat(250)}
      </div>
      <div aria-hidden className="left">
        {(animation ? pattern[0] : pattern[1]).repeat(250)}
      </div>
      <div aria-hidden className="bottom">
        {(animation ? pattern[0] : pattern[1]).repeat(250)}
      </div>
      <div aria-hidden className="right">
        {(animation ? pattern[0] : pattern[1]).repeat(250)}
      </div>
      {children}
      <style jsx>{`
        article {
          @media (min-width: 48rem) {
            max-width: 83ch;
          }
          max-width: 29ch;
          width: 100%;
          margin: auto;
          padding: 2rem;
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        article :global(p) {
          margin: 0.5rem 0;
        }
        div {
          user-select: none;
          position: absolute;
          overflow: hidden;
          line-height: 1;
        }
        .top {
          top: 0;
          left: 0;
          right: 0;
        }
        .bottom {
          bottom: 0;
          left: 0;
          right: 0;
          padding-left: 1ch;
        }
        .left {
          top: 0;
          left: 0;
          bottom: 0;
        }
        .right {
          top: 0;
          right: 0;
          bottom: 0;
        }
        .top,
        .bottom {
          white-space: nowrap;
        }
        .left,
        .right {
          overflow-wrap: break-word;
          width: 1ch;
          background-color: #fff;
        }
        @media (prefers-color-scheme: dark) {
          .left,
          .right {
            background-color: #1e1e1e;
          }
        }
      `}</style>
    </article>
  )
}

export default FancyBox
