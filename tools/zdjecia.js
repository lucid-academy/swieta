#!/usr/bin/env node
/* Przygotowanie grafiki do img/.
 *
 * Zdjęcia wydarzeń:  node tools/zdjecia.js
 *   zrodla/zdjecia/*  ->  img/nazwa.jpg (dłuższy bok 1200 px)
 *                     ->  img/nazwa-mini.jpg (dłuższy bok 400 px)
 *
 * Grafika mapy:      node tools/zdjecia.js zrodla/mapa/mapa.png --maks 2400 --bez-miniatur --nazwa mapa-bydgoskie
 *   Mapa potrzebuje większego boku, bo ludzie będą ją przybliżać palcami,
 *   i nie potrzebuje miniatury.
 *
 * Opcje:
 *   --maks N          dłuższy bok pliku pełnego (domyślnie 1200)
 *   --mini N          dłuższy bok miniatury (domyślnie 400)
 *   --jakosc N        jakość JPEG 1-100 (domyślnie 80)
 *   --wyjscie ŚCIEŻKA katalog wynikowy (domyślnie img)
 *   --nazwa NAZWA     wymuś nazwę wyniku (tylko dla pojedynczego pliku)
 *   --bez-miniatur    nie rób miniatur
 *   --nadpisz         przetwórz też pliki, które już są w wyjściu
 *
 * Obrazy nigdy nie są powiększane — plik mniejszy niż limit zostaje w swoim rozmiarze.
 */

import { readdir, stat, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const KORZEN = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ROZSZERZENIA = new Set(['.jpg', '.jpeg', '.png', '.webp', '.tif', '.tiff', '.avif']);

/* ---------- argumenty ---------- */

function czytajArgumenty(argv) {
  const o = {
    wejscie: null,
    wyjscie: 'img',
    maks: 1200,
    mini: 400,
    jakosc: 80,
    nazwa: null,
    miniatury: true,
    nadpisz: false
  };
  const liczba = (w, nazwa) => {
    const n = Number(w);
    if (!Number.isFinite(n) || n <= 0) throw new Error(`--${nazwa} oczekuje liczby dodatniej, dostało: ${w}`);
    return Math.round(n);
  };

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    switch (a) {
      case '--maks':    o.maks    = liczba(argv[++i], 'maks');   break;
      case '--mini':    o.mini    = liczba(argv[++i], 'mini');   break;
      case '--jakosc':  o.jakosc  = liczba(argv[++i], 'jakosc'); break;
      case '--wyjscie': o.wyjscie = argv[++i];                   break;
      case '--nazwa':   o.nazwa   = argv[++i];                   break;
      case '--bez-miniatur': o.miniatury = false;                break;
      case '--nadpisz':      o.nadpisz   = true;                 break;
      case '--pomoc':
      case '-h':
      case '--help':
        console.log(pomoc());
        process.exit(0);
        break;
      default:
        if (a.startsWith('--')) throw new Error(`Nieznana opcja: ${a}`);
        if (o.wejscie) throw new Error(`Podano dwie ścieżki wejściowe: ${o.wejscie} i ${a}`);
        o.wejscie = a;
    }
  }
  if (o.jakosc > 100) throw new Error('--jakosc nie może być większa niż 100');
  o.wejscie ??= 'zrodla/zdjecia';
  return o;
}

function pomoc() {
  return `Przygotowanie grafiki do img/.

  node tools/zdjecia.js [ścieżka] [opcje]

  ścieżka           plik albo katalog (domyślnie zrodla/zdjecia)
  --maks N          dłuższy bok pliku pełnego (domyślnie 1200)
  --mini N          dłuższy bok miniatury (domyślnie 400)
  --jakosc N        jakość JPEG 1-100 (domyślnie 80)
  --wyjscie ŚCIEŻKA katalog wynikowy (domyślnie img)
  --nazwa NAZWA     wymuś nazwę wyniku (tylko dla pojedynczego pliku)
  --bez-miniatur    nie rób miniatur
  --nadpisz         przetwórz też pliki, które już są w wyjściu`;
}

/* ---------- nazwy plików ---------- */

const ZAMIANY = {
  ą: 'a', ć: 'c', ę: 'e', ł: 'l', ń: 'n', ó: 'o', ś: 's', ź: 'z', ż: 'z',
  Ą: 'a', Ć: 'c', Ę: 'e', Ł: 'l', Ń: 'n', Ó: 'o', Ś: 's', Ź: 'z', Ż: 'z'
};

/** Nazwa pliku bez polskich znaków, spacji i wielkich liter. */
export function nazwaPliku(tekst) {
  const bezOgonkow = [...tekst].map(z => ZAMIANY[z] ?? z).join('');
  return bezOgonkow
    .normalize('NFD').replace(/[̀-ͯ]/g, '')  // reszta diakrytyków
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'plik';
}

/* ---------- przetwarzanie ---------- */

async function zbierzPliki(wejscie) {
  const pelna = path.resolve(KORZEN, wejscie);
  if (!existsSync(pelna)) throw new Error(`Nie ma takiej ścieżki: ${wejscie}`);
  if ((await stat(pelna)).isFile()) return [pelna];

  const wpisy = await readdir(pelna, { withFileTypes: true });
  return wpisy
    .filter(w => w.isFile() && ROZSZERZENIA.has(path.extname(w.name).toLowerCase()))
    .map(w => path.join(pelna, w.name))
    .sort((a, b) => a.localeCompare(b, 'pl'));
}

async function przetworz(zrodlo, o, katalogWyjscia) {
  const bazowa = o.nazwa ? nazwaPliku(o.nazwa) : nazwaPliku(path.basename(zrodlo, path.extname(zrodlo)));
  const wynik = [];

  const warianty = [{ przyrostek: '', bok: o.maks }];
  if (o.miniatury) warianty.push({ przyrostek: '-mini', bok: o.mini });

  for (const { przyrostek, bok } of warianty) {
    const docelowy = path.join(katalogWyjscia, `${bazowa}${przyrostek}.jpg`);

    if (!o.nadpisz && existsSync(docelowy)) {
      wynik.push({ plik: path.basename(docelowy), stan: 'pominięty (już jest)' });
      continue;
    }

    const info = await sharp(zrodlo)
      .rotate()                                        // uszanuj EXIF-ową orientację
      .resize({ width: bok, height: bok, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: o.jakosc, mozjpeg: true, progressive: true })
      .toFile(docelowy);

    wynik.push({
      plik: path.basename(docelowy),
      stan: `${info.width}x${info.height}`,
      kb: Math.round(info.size / 1024)
    });
  }
  return { bazowa, wynik };
}

/* ---------- główna ---------- */

async function glowna() {
  let o;
  try {
    o = czytajArgumenty(process.argv.slice(2));
  } catch (e) {
    console.error(`Błąd: ${e.message}\n`);
    console.error(pomoc());
    process.exit(1);
  }

  const katalogWyjscia = path.resolve(KORZEN, o.wyjscie);
  await mkdir(katalogWyjscia, { recursive: true });

  let pliki;
  try {
    pliki = await zbierzPliki(o.wejscie);
  } catch (e) {
    console.error(`Błąd: ${e.message}`);
    process.exit(1);
  }

  if (!pliki.length) {
    console.error(`Nie znalazłem żadnych obrazów w: ${o.wejscie}`);
    process.exit(1);
  }
  if (o.nazwa && pliki.length > 1) {
    console.error('Opcja --nazwa działa tylko dla pojedynczego pliku.');
    process.exit(1);
  }

  console.log(`${o.wejscie} -> ${o.wyjscie}   (dłuższy bok ${o.maks} px${o.miniatury ? `, miniatury ${o.mini} px` : ', bez miniatur'}, jakość ${o.jakosc})\n`);

  let bledy = 0, zapisane = 0, pominiete = 0;

  for (const zrodlo of pliki) {
    const wagaZrodla = Math.round((await stat(zrodlo)).size / 1024);
    try {
      const { wynik } = await przetworz(zrodlo, o, katalogWyjscia);
      const opis = wynik.map(w => w.kb === undefined ? w.stan : `${w.plik} ${w.stan} ${w.kb} KB`).join('   ');
      console.log(`  ${path.basename(zrodlo).padEnd(16)} ${String(wagaZrodla + ' KB').padStart(8)}  ->  ${opis}`);
      zapisane += wynik.filter(w => w.kb !== undefined).length;
      pominiete += wynik.filter(w => w.kb === undefined).length;
    } catch (e) {
      bledy++;
      console.error(`  ${path.basename(zrodlo).padEnd(16)} BŁĄD: ${e.message}`);
    }
  }

  console.log(`\nZapisane: ${zapisane}${pominiete ? `, pominięte: ${pominiete} (użyj --nadpisz)` : ''}${bledy ? `, błędy: ${bledy}` : ''}`);
  if (bledy) process.exit(1);
}

// Uruchom tylko wtedy, gdy plik odpalono wprost — import (np. w teście) nic nie przetwarza.
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  glowna();
}
