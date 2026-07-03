import axios from 'axios'
import * as cheerio from 'cheerio'
import { writeFileSync } from 'node:fs'

const baseUrl = 'https://www.gundam-gcg.com/jp/products/'
const dataFile = 'data/products.json'

function normalizeDate(raw) {
  if (!raw) {
    return null
  }
  const compact = raw.replace(/\s+/g, '')
  const m = compact.match(/(\d{4})[.\-/年](\d{1,2})[.\-/月](\d{1,2})/)
  if (!m) {
    return null
  }
  const [, y, mo, d] = m
  return `${y}-${mo.padStart(2, '0')}-${d.padStart(2, '0')}`
}

function parseSetCode(href) {
  if (!href) {
    return null
  }
  const m = href.match(/\/([a-z0-9-]+)\.html(?:\?|$)/i)
  return m?.[1]?.toLowerCase() ?? null
}

async function fetchProductPage(page) {
  const url = `${baseUrl}list.php?p=1&page=${page}`
  const res = await axios.get(url)
  const $ = cheerio.load(res.data)

  const products = []
  $('.productsDetail').each((_, el) => {
    const root = $(el)
    const anchor = root.find('a.productsDetailInner').first()
    const href = anchor.attr('href')
    const code = parseSetCode(href)
    if (!code) {
      return
    }

    const title = root.find('.cardTit').first().text().trim()

    let releaseDateRaw = ''
    root.find('.cardInfoTit').each((__, dt) => {
      const label = $(dt).text().trim()
      if (!releaseDateRaw && label.includes('発売日')) {
        releaseDateRaw = $(dt).next('.cardInfoTxt').text().trim()
      }
    })

    products.push({
      code,
      name: title,
      releaseDate: normalizeDate(releaseDateRaw),
      releaseDateRaw,
      url: href ? new URL(href, baseUrl).href : null,
    })
  })

  let maxPage = 1
  $('a[href^="?p=1&page="]').each((_, el) => {
    const href = $(el).attr('href')
    const m = href?.match(/[?&]page=(\d+)/)
    if (m) {
      maxPage = Math.max(maxPage, Number(m[1]))
    }
  })

  return { products, maxPage }
}

const map = {}
console.log('Fetching products page 1...')
const firstPage = await fetchProductPage(1)
let maxPage = firstPage.maxPage || 1

for (const product of firstPage.products) {
  if (!map[product.code]) {
    map[product.code] = {
      name: product.name,
      releaseDate: product.releaseDate,
      releaseDateRaw: product.releaseDateRaw,
      url: product.url,
    }
  }
}

for (let page = 2; page <= maxPage; page++) {
  console.log(`Fetching products page ${page}/${maxPage}...`)
  const { products } = await fetchProductPage(page)
  for (const product of products) {
    if (!map[product.code]) {
      map[product.code] = {
        name: product.name,
        releaseDate: product.releaseDate,
        releaseDateRaw: product.releaseDateRaw,
        url: product.url,
      }
    }
  }
}

writeFileSync(dataFile, JSON.stringify(map, null, 2))
console.log(`Saved ${Object.keys(map).length} products to ${dataFile}`)
