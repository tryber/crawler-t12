const axios = require('axios');
const utf8 = require('utf8');
const he = require('he');

const IMDB_DOMAIN = 'https://www.imdb.com'
const TOP_MOVIES_URI = '/chart/top/'

const TITLE_REGEXP = /^<a href="\/title\/[0-9A-Za-z]{9}/gm
const SYNOPSIS_REGEXP = /"plotText":{"plainText":"(.+?)\"/gm
const ORIGINAL_TITLE_REGEXP = /Original title:(.+?)<\/div>/gm

const fetch = async (url) => {
  return (await axios.get(url)).data.toString();
}

const getTopMoviesUris = (page) => {
  const filtered = new Set();
  const regexp = new RegExp(TITLE_REGEXP);
  page.split('\n').forEach(line => {
    if (title = regexp.exec(line)) {
      filtered.add(title[0].split('\"')[1])
    }
  })

  return filtered;
}

const scrapeTitle = (page) => {
  const originalTitleRegexp = new RegExp(ORIGINAL_TITLE_REGEXP);
  const originalTitle = originalTitleRegexp.exec(page);

  return originalTitle[0].split(': ')[1].split('<')[0];
}

const scrapeSynopsis = (page) => {
  const synopsisRegexp = new RegExp(SYNOPSIS_REGEXP);
  synopsis = synopsisRegexp.exec(page);

  return synopsis[0].split('\"')[5].replace('\\r\\n', '');
}

async function main() {
  try {
    const page = await fetch(`${IMDB_DOMAIN}${TOP_MOVIES_URI}`);
    const filtered = getTopMoviesUris(page);
  
    for (const title of filtered) {
      try {
        await new Promise((res) => setTimeout(() => res(), 3000)); // TRYING TO avoid being blocked by server
        const detailed = await fetch(`${IMDB_DOMAIN}${title}`);
      
        // scrap original title
        const originalTitle = utf8.encode(he.decode(scrapeTitle(detailed)));
    
        // scrap synposis
        const synposis = utf8.encode(he.decode(scrapeSynopsis(detailed)));
    
        console.log(`Title: ${originalTitle}\nSynopsis: ${synposis}\n`);
      } catch (err) {
        console.error(err.message);
        continue;
      }
    }
  } catch (err) {
    console.error(err.message);
  }
}

main();