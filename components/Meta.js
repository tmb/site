import Head from 'next/head'

export default ({
  name = 'Theo Bleier',
  title = 'Theo Bleier',
  description = 'Theo Bleier is a 16-year-old hacker. Right now, he works at Hack Club wearing many hats.',
  image = 'https://tmb.sh/card.png',
  url = 'https://tmb.sh',
}) => (
  <Head>
    <title>{title}</title>
    <meta property="og:title" content={title} />
    <meta name="twitter:title" content={title} />
    <meta name="og:url" content={url} />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content={name} />
    <meta name="description" content={description} />
    <meta property="og:description" content={description} />
    <meta name="twitter:description" content={description} />
    <meta property="og:image" content={image} />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:image" content={image} />
    <meta name="msapplication-TileColor" content="#00caff" />
    <meta name="theme-color" content="#00caff" />
  </Head>
)