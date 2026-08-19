interface Post {
  title: string
  author: string
  href?: string
}

interface Section {
  title: string
  notes?: string[]
  posts: Post[]
}

const sections: Section[] = [
  {
    title: 'How people work',
    notes: [
      'It is not gauche to understand how to understand others’ incentives. Working with others is the primary lever we have to accomplish hard things; we should strive to be good at it.',
    ],
    posts: [
      {
        title: 'Gervais Principle',
        author: 'Venkatesh Rao',
        href: 'https://www.ribbonfarm.com/the-gervais-principle/',
      },
      {
        title: 'Shields Down',
        author: 'Michael Lopp (rands)',
        href: 'https://randsinrepose.com/archives/shields-down/',
      },
      {
        title: 'Doubt Calculus',
        author: 'Venkatesh Rao',
        href: 'https://contraptions.venkateshrao.com/p/benefit-of-doubt-calculus',
      },
      {
        title: 'Everybody is the main character',
        author: 'Sebastian Bensusan',
        href: 'https://blog.sbensu.com/posts/everybody-is-the-main-character/',
      },
      {
        title: 'Lieutenants are the limiting reagent',
        author: 'Sebastian Bensusan',
        href: 'https://blog.sbensu.com/posts/lieutenants/',
      },
      {
        title: 'Trust as a bottleneck to growing teams quickly',
        author: 'Ben Kuhn',
        href: 'https://www.benkuhn.net/trust/',
      },
      {
        title: 'The Contagion',
        author: 'Michael Lopp (rands)',
        href: 'https://randsinrepose.com/archives/the-contagion/',
      },
      {
        title: 'Coordination Headwind (“the slime mold talk”)',
        author: 'Alex Komoroske',
        href: 'https://komoroske.com/slime-mold/',
      },
    ],
  },
  {
    title: 'Hiring',
    notes: ['Hiring is hard; “excellent” is not a one-dimensional object.'],
    posts: [
      {
        title: 'What’s going on here, with this human',
        author: 'Graham Duncan',
        href: 'https://grahamduncan.blog/whats-going-on-here/',
      },
      {
        title: 'Team oriented vs outcome oriented',
        author: 'Sebastian Bensusan',
        href: 'https://blog.sbensu.com/posts/team-oriented-vs-outcome-oriented/',
      },
    ],
  },
  {
    title: 'Engineering',
    posts: [
      {
        title: 'The Wrong Abstraction',
        author: 'Sandi Metz',
        href: 'https://sandimetz.com/blog/2016/1/20/the-wrong-abstraction',
      },
      {
        title: 'Jeeps, Ferraris, and Other Engineers',
        author: 'Mahesh Balakrishnan',
        href: 'https://maheshba.bitbucket.io/blog/2025/04/29/cars.html',
      },
    ],
  },
  {
    title: 'Energy',
    posts: [
      {
        title: 'Energy Cheat Sheet',
        author: 'Brian Potter',
        href: 'https://www.construction-physics.com/p/energy-cheat-sheet',
      },
      {
        title: 'The Electric Slide',
        author: 'Packy McCormick and Sam D’Amico',
        href: 'https://www.notboring.co/p/the-electric-slide',
      },
    ],
  },
  {
    title: 'Manufacturing',
    posts: [
      {
        title: 'Speed Can Reindustrialize America',
        author: 'Austin Vernon',
        href: 'https://www.austinvernon.site/blog/manufacturing.html',
      },
      {
        title: 'Freedom’s Forge',
        author: 'Arthur Herman',
        href: 'https://www.penguinrandomhouse.com/books/208564/freedoms-forge-by-arthur-herman/',
      },
    ],
  },
  {
    title: 'Supply chains',
    posts: [
      {
        title: 'The Box',
        author: 'Marc Levinson',
        href: 'https://press.princeton.edu/books/paperback/9780691170817/the-box',
      },
      {
        title: 'Apple in China',
        author: 'Patrick McGee',
        href: 'https://www.simonandschuster.com/books/Apple-in-China/Patrick-McGee/9781668053386',
      },
    ],
  },
  {
    title: 'Miscellaneous',
    posts: [
      {
        title: 'Boom',
        author: 'Byrne Hobart',
        href: 'https://press.stripe.com/boom',
      },
      {
        title: 'Breakneck',
        author: 'Dan Wang',
        href: 'https://danwang.co/breakneck/',
      },
    ],
  },
  {
    title: 'Newsletters',
    posts: [
      {
        title: 'The Diff',
        author: 'Byrne Hobart',
        href: 'https://www.thediff.co/',
      },
      {
        title: 'Money Stuff',
        author: 'Matt Levine',
        href: 'https://www.bloomberg.com/account/newsletters/money-stuff',
      },
      {
        title: 'Stratechery',
        author: 'Ben Thompson',
        href: 'https://stratechery.com/',
      },
    ],
  },
]

// Last name of the (first) author, used to sort sections alphabetically.
// Strips parentheticals ("(rands)") and takes the first of multiple authors.
function lastName(author: string): string {
  const primary = author
    .split(/\s+and\s+/)[0]
    .replace(/\s*\([^)]*\)/g, '')
    .trim()
  const parts = primary.split(/\s+/)
  return parts[parts.length - 1].toLowerCase()
}

function PostItem({ title, author, href }: Post) {
  return (
    <li>
      <span aria-hidden>-</span>{' '}
      {href ? (
        <a href={href} target="_blank" rel="noopener noreferrer">
          {title}
        </a>
      ) : (
        title
      )}{' '}
      by {author}
    </li>
  )
}

export default function Reading() {
  return (
    <div className="flex flex-col gap-10">
      {sections.map((section) => (
        <section key={section.title}>
          <h2 className="font-bold mb-3">{section.title}</h2>
          {section.notes?.map((note, i) => (
            <p key={i} className="mb-4 max-w-xl">
              {note}
            </p>
          ))}
          <ul className="flex flex-col">
            {[...section.posts]
              .sort((a, b) =>
                lastName(a.author).localeCompare(lastName(b.author)),
              )
              .map((post) => (
                <PostItem key={post.title} {...post} />
              ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
