#!/usr/bin/env node
/* Kopiuje gotową mapę do repozytorium strony lucidacademy.pl.
 *
 *   node tools/publikuj.js                            # bydgoskie (domyślnie)
 *   node tools/publikuj.js --swieto chelminskie       # drugie święto
 *   node tools/publikuj.js --swieto chelminskie --na-sucho
 *   node tools/publikuj.js --cel ../inne-repo         # inny katalog docelowy
 *
 * ŹRÓDŁEM PRAWDY POZOSTAJE TO REPOZYTORIUM. Tam idzie tylko wynik —
 * bez zrodel, bez narzędzi, bez node_modules. Dzięki temu nie ma dwóch
 * miejsc, w których trzeba pamiętać o poprawce: pracujemy tutaj,
 * a publikacja jest jedną komendą.
 *
 * Każde święto dostaje własny katalog i własny `index.html`, w którym
 * podmieniona jest JEDNA linijka — domyślne święto. Dzięki temu adres na
 * stronie jest czysty (…/projekty/swietochp/), bez ?swieto= w pasku.
 * W repozytorium roboczym zostaje jeden silnik; rozdziela się dopiero tutaj.
 *
 * Do katalogu idą tylko dane tego jednego święta. Nie ma powodu wysyłać
 * na stronę Chełmińskiego stukilobajtowej geometrii Bydgoskiego.
 *
 * Katalog docelowy jest czyszczony przed kopiowaniem, więc pliki
 * usunięte u nas znikają też na stronie.
 */

import { readdir, stat, mkdir, copyFile, rm, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const KORZEN = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Katalog na stronie dla każdego święta. Netlify zamienia adresy na małe
// litery, więc kanoniczny adres to /projekty/swietobp/ i /projekty/swietochp/.
const KATALOGI = { bydgoskie: 'swietoBP', chelminskie: 'swietoCHP' };

let swieto = 'bydgoskie';
let cel = null;
let naSucho = false;

const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '--swieto') swieto = argv[++i];
  else if (argv[i] === '--cel') cel = path.resolve(argv[++i]);
  else if (argv[i] === '--na-sucho') naSucho = true;
  else { console.error(`Nieznana opcja: ${argv[i]}`); process.exit(1); }
}

if (!KATALOGI[swieto]) {
  console.error(`Nie znam święta "${swieto}". Znane: ${Object.keys(KATALOGI).join(', ')}`);
  process.exit(1);
}
if (!cel) cel = path.resolve(KORZEN, '..', 'LucidAcademy-onepage', 'projekty', KATALOGI[swieto]);

const DANE_SWIETA = [`dane/${swieto}.js`, `dane/mapa-${swieto}.js`];

async function zbierz(zrodlo, prefiks = '') {
  const wynik = [];
  const info = await stat(zrodlo);
  if (info.isFile()) return [{ sciezka: zrodlo, wzgledna: prefiks, bajty: info.size }];
  for (const w of await readdir(zrodlo, { withFileTypes: true })) {
    if (w.name.startsWith('.')) continue;
    wynik.push(...await zbierz(path.join(zrodlo, w.name), path.join(prefiks, w.name)));
  }
  return wynik;
}

/* Które pliki z img/ są temu świętu potrzebne. Katalog jest wspólny dla obu,
   a kopiowanie całości wysyłałoby 62 zdjęcia Bydgoskiego (7,5 MB) na stronę
   Chełmińskiego i odwrotnie. Bierzemy to, do czego dane naprawdę się odwołują:
   każdą ścieżkę `img/...` w pliku plus obie wersje każdego zdjęcia z `zdjecia`. */
async function obrazkiSwieta() {
  const tresc = await readFile(path.join(KORZEN, 'dane', `${swieto}.js`), 'utf8');
  const chciane = new Set();

  for (const m of tresc.matchAll(/['"]img\/([^'"]+)['"]/g)) chciane.add(m[1]);

  const okno = {};
  new Function('window', tresc)(okno);
  for (const w of (okno.DANE.wydarzenia || [])) {
    for (const n of (w.zdjecia || [])) { chciane.add(`${n}.jpg`); chciane.add(`${n}-mini.jpg`); }
  }

  const wynik = [];
  const brakujace = [];
  for (const nazwa of chciane) {
    const plik = path.join(KORZEN, 'img', nazwa);
    if (!existsSync(plik)) { brakujace.push(nazwa); continue; }
    wynik.push({ sciezka: plik, wzgledna: path.join('img', nazwa), bajty: (await stat(plik)).size });
  }
  if (brakujace.length) {
    console.error(`\nDane wskazują na pliki, których nie ma w img/:`);
    brakujace.forEach(n => console.error(`  img/${n}`));
    console.error('Publikacja wstrzymana — na stronie byłyby puste ramki.\n');
    process.exit(1);
  }
  return wynik;
}

/** index.html z podmienionym domyślnym świętem — żeby adres nie potrzebował ?swieto=. */
async function zlozIndeks() {
  const zrodlo = await readFile(path.join(KORZEN, 'index.html'), 'utf8');
  const wzorzec = /var DOMYSLNE = '[a-z]+';/;
  if (!wzorzec.test(zrodlo)) {
    console.error('\nNie znalazłem w index.html linijki `var DOMYSLNE = ...`.');
    console.error('Mechanizm wyboru święta się zmienił — popraw tools/publikuj.js.\n');
    process.exit(1);
  }
  return zrodlo.replace(wzorzec, `var DOMYSLNE = '${swieto}';`);
}

async function glowna() {
  // Nie publikujemy czegoś, co się nie parsuje.
  for (const wzgledna of DANE_SWIETA) {
    const plik = path.join(KORZEN, wzgledna);
    if (!existsSync(plik)) {
      console.error(`\nBrakuje ${wzgledna} — uruchom generator albo tools/mapa.js.\n`);
      process.exit(1);
    }
    try { new Function('window', await readFile(plik, 'utf8'))({}); }
    catch (e) {
      console.error(`\n${wzgledna} się nie parsuje — publikacja wstrzymana.`);
      console.error(`${e.message}\nUruchom: node tools/sprawdz.js --swieto ${swieto}\n`);
      process.exit(1);
    }
  }

  const pliki = await obrazkiSwieta();
  for (const wzgledna of DANE_SWIETA) {
    pliki.push(...await zbierz(path.join(KORZEN, wzgledna), wzgledna.replace('/', path.sep)));
  }

  const indeks = await zlozIndeks();
  const bajty = pliki.reduce((s, p) => s + p.bajty, 0) + Buffer.byteLength(indeks);

  console.log(`\nŚwięto: ${swieto}`);
  console.log(`Źródło: ${KORZEN}`);
  console.log(`Cel:    ${cel}`);
  console.log(`Plików: ${pliki.length + 1}, razem ${(bajty / 1048576).toFixed(2)} MB\n`);

  const podsumuj = () => {
    console.log(`  index.html     1 plik (domyślne święto: ${swieto})`);
    DANE_SWIETA.forEach(d => console.log(`  ${d.padEnd(14)} 1 plik`));
    const ile = pliki.filter(p => p.wzgledna.startsWith('img')).length;
    console.log(`  img            ${ile} ${ile === 1 ? 'plik' : 'plików'}`);
  };

  if (naSucho) {
    podsumuj();
    console.log('\nPróba na sucho — nic nie skopiowano.\n');
    return;
  }

  if (existsSync(cel)) await rm(cel, { recursive: true, force: true });
  for (const p of pliki) {
    const docelowy = path.join(cel, p.wzgledna);
    await mkdir(path.dirname(docelowy), { recursive: true });
    await copyFile(p.sciezka, docelowy);
  }
  await writeFile(path.join(cel, 'index.html'), indeks, 'utf8');

  podsumuj();
  console.log(`\nSkopiowane. Teraz w repozytorium strony:`);
  console.log(`  git add projekty/${KATALOGI[swieto]} && git commit && git push\n`);
}

glowna().catch(e => { console.error('Błąd:', e.message); process.exit(1); });
