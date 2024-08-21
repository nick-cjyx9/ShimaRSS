// deploy this: https://github.com/nick-cjyx9/parse_rss
// because the incomplete node lib support of cf workers, we use a vercel proj to parse RSS

import type Parser from 'rss-parser'

const parser_link = 'https://shima-rss-parser.nickchen.top/api/parseRSS'

export async function parseInfoFromRSS(url: string) {
  const fetch_link = new URL(parser_link)
  fetch_link.searchParams.append('link', url)
  const response = await fetch(fetch_link, {
    headers: {
      'Content-Type': 'application/json',
    },
  })
  const data: { [key: string]: any } & Parser.Output<{ [key: string]: any }> = await response.json()
  return data
}
