const got = require('got')
const cheerio = require('cheerio')
const level = require('level')
const debug = require('debug')('crawler')
const fs = require('fs')
const pMap = require('p-map')

const db = level('html.db')

async function getPage(href) {
  const exists = await db.get(href).catch(e => {})
  if (exists) {
    debug('exists', href)
    return
  }

  const ok = await got(href)
  await db.put(href, ok.body)
  debug('got', href)
}

async function crawl() {
  const home = await got('http://www.bluegrasslyrics.com')
  const $ = cheerio.load(home.body)
  const hrefs = $('.entry-content .list--songs .song a')
    .map((i, el) => $(el).attr('href'))
    .get()

  await pMap(hrefs, getPage, { concurrency: 3 })

  debug('parsing songs')
  parseSongs()
}

function parseSong(html) {
  const $ = cheerio.load(html)
  const title = $('.entry-title')
    .text()
    .trim()

  const href = $('link[rel="canonical"]').attr('href')
  let slug = href.split('/')
  slug = slug[slug.length - 2]

  const content = $('.entry-content').html()
  return {
    title,
    slug,
    content,
  }
}

async function parseSongs() {
  const songs = []
  db.createValueStream()
    .on('data', html => {
      songs.push(parseSong(html))
    })
    .on('end', () => {
      songs.sort((a, b) => (a.title < b.title ? -1 : 1))

      const j = JSON.stringify(songs)
      fs.writeFileSync('src/songs.json', j)
    })
}

crawl()
