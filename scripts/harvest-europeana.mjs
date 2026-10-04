import fs from 'node:fs';
import path from 'node:path';

const key = process.env.EUROPEANA_API_KEY?.trim();
if (!key) {
  console.error('Mangler EUROPEANA_API_KEY. Legg den i .env.local (se README).');
  process.exit(1);
}

const args = process.argv.slice(2);
const option = (name, fallback) => {
  const index = args.indexOf(name);
  return index < 0 ? fallback : args[index + 1];
};
const query = option('--query', 'Sarpsborg');
const limit = Number(option('--limit', '100'));
if (!query || !Number.isInteger(limit) || limit < 1 || limit > 5000) {
  console.error('Bruk: npm run harvest:europeana -- [--query Sarpsborg] [--limit 100] (maks 5000).');
  process.exit(1);
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function search(cursor, rows) {
  const url = new URL('https://api.europeana.eu/record/v2/search.json');
  url.searchParams.set('query', query);
  url.searchParams.set('rows', String(rows));
  url.searchParams.set('profile', 'rich');
  url.searchParams.set('cursor', cursor);
  for (let attempt = 0; attempt < 4; attempt++) {
    let response;
    try {
      response = await fetch(url, {
        headers: { 'X-Api-Key': key, Accept: 'application/json' },
        signal: AbortSignal.timeout(30000),
      });
    } catch (error) {
      if (attempt === 3) throw error;
      await sleep(1000 * (attempt + 1));
      continue;
    }
    if (response.ok) return response.json();
    if ((response.status === 429 || response.status >= 500) && attempt < 3) {
      const retryAfter = Number(response.headers.get('retry-after'));
      await sleep(Number.isFinite(retryAfter) && retryAfter > 0 ? Math.min(retryAfter, 60) * 1000 : 1000 * (attempt + 1));
      continue;
    }
    throw new Error(`Europeana svarte HTTP ${response.status}. Kontroller nøkkel og søkegrense.`);
  }
}

const first = (value) => Array.isArray(value) ? value[0] ?? null : value ?? null;
const records = [];
const seen = new Set();
let cursor = '*';
let totalResults = null;
while (records.length < limit) {
  const body = await search(cursor, Math.min(100, limit - records.length));
  if (!body.success) throw new Error('Europeana meldte at søket mislyktes.');
  totalResults = body.totalResults ?? totalResults;
  const items = body.items ?? [];
  for (const item of items) {
    if (!item.id || seen.has(item.id)) continue;
    seen.add(item.id);
    records.push({
      id: item.id,
      title: first(item.title),
      description: first(item.dcDescription),
      year: first(item.year),
      type: item.type ?? null,
      country: item.country ?? [],
      provider: first(item.provider),
      dataProvider: first(item.dataProvider),
      rights: first(item.rights),
      preview: first(item.edmPreview),
      sourceUrl: first(item.edmIsShownAt),
      mediaUrl: first(item.edmIsShownBy),
      europeanaUrl: `https://www.europeana.eu/item${item.id}`,
    });
  }
  if (!items.length || !body.nextCursor || body.nextCursor === cursor) break;
  cursor = body.nextCursor;
}

const slug = query.toLocaleLowerCase('nb-NO').normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'sok';
const output = path.join('data', 'source-harvest', `europeana-${slug}.json`);
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, JSON.stringify({ query, fetchedAt: new Date().toISOString(), totalResults, saved: records.length, note: 'Søketreff er kandidater, ikke verifiserte bilder av stedet. Sjekk avbildet sted, duplikater og rettigheter før publisering.', records }, null, 2) + '\n');
console.log(`Lagret ${records.length} av ${totalResults ?? 'ukjent antall'} søketreff i ${output}. Ingen bildefiler er lastet ned.`);
