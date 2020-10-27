import Head from 'next/head'

export default ({
  name = 'Theo Bleier',
  title = 'Theo Bleier',
  description = 'Theo Bleier likes computers.',
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

    <link rel="apple-touch-icon" sizes="180x180" href="/ics/apple-touch-icon.png" />
    <link rel="icon" type="image/png" sizes="32x32" href="/ics/favicon-32x32.png" />
    <link rel="icon" type="image/png" sizes="16x16" href="/ics/favicon-16x16.png" />
    <link rel="manifest" href="/ics/site.webmanifest"/>
    <link rel="mask-icon" href="/ics/safari-pinned-tab.svg" color="#00caff"/>
    <link rel="shortcut icon" href="/ics/favicon.ico"/>
    <meta name="msapplication-config" content="/ics/browserconfig.xml"/>
    
  </Head>
)
