// Revalidate the Substack feed hourly so new posts show up without a rebuild.
export const revalidate = 3600

interface Post {
  title: string
  link: string
  date: Date
}

function decodeEntities(input: string): string {
  return input
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#8217;/g, '’')
    .replace(/&#8216;/g, '‘')
    .replace(/&#8220;/g, '“')
    .replace(/&#8221;/g, '”')
}

function extract(tag: string, block: string): string | null {
  const match = block.match(
    new RegExp(`<${tag}>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?</${tag}>`)
  )
  return match ? decodeEntities(match[1].trim()) : null
}

async function getPosts(): Promise<Post[]> {
  const res = await fetch('https://theombl.substack.com/feed')
  if (!res.ok) return []
  const xml = await res.text()

  const items = xml.match(/<item>[\s\S]*?<\/item>/g) ?? []
  return items
    .map((block) => {
      const title = extract('title', block)
      const link = extract('link', block)
      const pubDate = extract('pubDate', block)
      if (!title || !link || !pubDate) return null
      return { title, link, date: new Date(pubDate) }
    })
    .filter((p): p is Post => p !== null)
    .sort((a, b) => b.date.getTime() - a.date.getTime())
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default async function Writing() {
  const posts = await getPosts()

  if (posts.length === 0) {
    return <p>Nothing here yet.</p>
  }

  return (
    <ul className="flex flex-col gap-1">
      {posts.map((post) => (
        <li key={post.link}>
          <span aria-hidden>-</span>{' '}
          <a href={post.link} target="_blank" rel="noopener noreferrer">
            <span className="font-bold">{post.title}</span> ({formatDate(post.date)})
          </a>
        </li>
      ))}
    </ul>
  )
}
