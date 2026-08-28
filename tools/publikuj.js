#!/usr/bin/env node
/* Kopiuje gotową mapę do repozytorium strony lucidacademy.pl.
 *
 *   node tools/publikuj.js                       # kopiuje i pokazuje, co się zmieniło
 *   node tools/publikuj.js --na-sucho            # tylko pokazuje
 *   node tools/publikuj.js --cel ../inne-repo    # inny katalog docelowy
 *
 * ŹRÓDŁEM PRAWDY POZOSTAJE TO REPOZYTORIUM. Tam idzie tylko wynik —
 * bez zrodel, bez narzędzi, bez node_modules. Dzięki temu nie ma dwóch
 * miejsc, w których trzeba pamiętać o poprawce: pracujemy tutaj,
 * a publikacja jest jedną komendą.
 *
 * Katalog docelowy jest czyszczony przed kopiowaniem, więc pliki
 * usunięte u nas znikają też na stronie.
 */

import { readdir, stat, mkdir, copyFile, rm, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const KORZEN = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Co składa się na działającą stronę. Reszta repozytorium zostaje u nas.
const DO_SKOPIOWANIA = ['index.html', 'dane', 'img'];

let cel = path.resolve(KORZEN, '..', 'LucidAcademy-onepage', 'projekty', 'swietoBP');
let naSucho = false;

const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '--cel') cel = path.resolve(argv[++i]);
  else if (argv[i] === '--na-sucho') naSucho = true;
  else { console.error(`Nieznana opcja: ${argv[i]}`); process.exit(1); }
}

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

async function glowna() {
  // Nie publikujemy czegoś, co się nie parsuje.
  const dane = path.join(KORZEN, 'dane', 'bydgoskie.js');
  if (existsSync(dane)) {
    try { new Function('window', await readFile(dane, 'utf8'))({}); }
    catch (e) {
      console.error(`\nPlik z danymi się nie parsuje — publikacja wstrzymana.`);
      console.error(`${e.message}\nUruchom: node tools/sprawdz.js\n`);
      process.exit(1);
    }
  }

  const pliki = [];
  for (const co of DO_SKOPIOWANIA) {
    const zrodlo = path.join(KORZEN, co);
    if (!existsSync(zrodlo)) { console.error(`Brakuje ${co}`); process.exit(1); }
    pliki.push(...await zbierz(zrodlo, co));
  }
  const bajty = pliki.reduce((s, p) => s + p.bajty, 0);

  console.log(`\nŹródło: ${KORZEN}`);
  console.log(`Cel:    ${cel}`);
  console.log(`Plików: ${pliki.length}, razem ${(bajty / 1048576).toFixed(2)} MB\n`);

  if (naSucho) {
    DO_SKOPIOWANIA.forEach(co => {
      const ile = pliki.filter(p => p.wzgledna.startsWith(co)).length;
      console.log(`  ${co.padEnd(14)} ${ile} ${ile === 1 ? 'plik' : 'plików'}`);
    });
    console.log('\nPróba na sucho — nic nie skopiowano.\n');
    return;
  }

  if (existsSync(cel)) await rm(cel, { recursive: true, force: true });
  for (const p of pliki) {
    const docelowy = path.join(cel, p.wzgledna);
    await mkdir(path.dirname(docelowy), { recursive: true });
    await copyFile(p.sciezka, docelowy);
  }

  DO_SKOPIOWANIA.forEach(co => {
    const ile = pliki.filter(p => p.wzgledna.startsWith(co)).length;
    console.log(`  ${co.padEnd(14)} ${ile} ${ile === 1 ? 'plik' : 'plików'}`);
  });
  console.log(`\nSkopiowane. Teraz w repozytorium strony:`);
  console.log(`  git add projekty/swietoBP && git commit && git push\n`);
}

glowna().catch(e => { console.error('Błąd:', e.message); process.exit(1); });
