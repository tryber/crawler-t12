const axios = require('axios');

const IMDB_DOMAIN = 'https://www.imdb.com'
const TOP_MOVIES_URI = '/chart/top/'

const TITLE_REGEXP = /^<a href="\/title\/[0-9A-Za-z]{9}/gm
const SYNOPSIS_REGEXP = /"plotText":{"plainText":"(.+?)\"/gm
const ORIGINAL_TITLE_REGEXP = /Original title:(.+?)<\/div>/gm

const fetch = async (url) => {
  return (await axios.get(url)).data.toString();
}

const getTopMoviesUris = (page) => {
  const filtered = []
  const regexp = new RegExp(TITLE_REGEXP);
  page.split('\n').forEach(line => {
    if (title = regexp.exec(line)) {
      filtered.push(title[0].split('\"')[1])
    }
  })

  return filtered;
}

const scrapTitle = (page) => {
  const originalTitleRegexp = new RegExp(ORIGINAL_TITLE_REGEXP);
  const originalTitle = originalTitleRegexp.exec(page);

  return originalTitle[0].split(': ')[1].split('<')[0];
}

const scrapSynopsis = (page) => {
  const synopsisRegexp = new RegExp(SYNOPSIS_REGEXP);
  synopsis = synopsisRegexp.exec(page);
  return synopsis[0].split('\"')[5].replace('\\r\\n', '');
}

async function main() {
  const page = await fetch(`${IMDB_DOMAIN}${TOP_MOVIES_URI}`);
  const filtered = getTopMoviesUris(page);

  for (const title of filtered) {
    await new Promise((res) => setTimeout(() => res(), 3000)); // avoid being blocked by server
    const detailed = await fetch(`${IMDB_DOMAIN}${title}`);
  
    // scrap original title
    const originalTitle = scrapTitle(detailed);

    // scrap synposis
    const synposis = scrapSynopsis(detailed);

    console.log(`Title: ${originalTitle}\nSynopsis: ${synposis}\n`);
  }
}

main();