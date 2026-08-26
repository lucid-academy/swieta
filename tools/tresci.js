#!/usr/bin/env node
/* Wciąga opisy i zdjęcia z zrodla/nowe/ do pliku z danymi.
 *
 *   node tools/tresci.js              # wciąga wszystko, co czeka
 *   node tools/tresci.js --na-sucho   # pokazuje, co by zrobił, nic nie zmienia
 *   node tools/tresci.js --swieto chelminskie
 *
 * Oczekuje jednego folderu na wydarzenie, nazwanego jego identyfikatorem:
 *
 *   zrodla/nowe/mariani-band/
 *     opis.txt        <- wklejony tekst
 *     IMG_4471.jpg    <- zdjęcia, nazwy bez znaczenia
 *
 * Zdjęcia lądują w img/ jako <identyfikator>-1.jpg wraz z miniaturą,
 * opis trafia do dane/<swieto>.js. Plik jest podmieniany chirurgicznie —
 * komentarze, wcięcia i notatki o pochodzeniu współrzędnych zostają
 * nietknięte, bo są warte więcej niż wygoda przepisania całości.
 *
 * Po udanym wciągnięciu folder wędruje do zrodla/nowe/_zrobione/,
 * żeby powtórne uruchomienie nie dokleiło tych samych zdjęć drugi raz.
 */

import { readdir, stat, readFile, writeFile, mkdir, rename } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const KORZEN = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OBRAZY = new Set(['.jpg', '.jpeg', '.png', '.webp', '.tif', '.tiff', '.avif', '.heic']);
const MAKS = 1200, MINI = 400, JAKOSC = 80;

let swieto = 'bydgoskie', naSucho = false;
const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '--swieto') swieto = argv[++i];
  else if (argv[i] === '--na-sucho') naSucho = true;
  else { console.error(`Nieznana opcja: ${argv[i]}`); process.exit(1); }
}

const PLIK = path.join(KORZEN, 'dane', `${swieto}.js`);
const SKRZYNKA = path.join(KORZEN, 'zrodla', 'nowe');

/* ---------- praca na tekście pliku ---------- */

/** Koniec napisu w apostrofach, z poszanowaniem \' i \\. */
function koniecNapisu(tekst, odKtoregoZnaku) {
  for (let i = odKtoregoZnaku; i < tekst.length; i++) {
    if (tekst[i] === '\\') { i++; continue; }
    if (tekst[i] === "'") return i;
  }
  return -1;
}

function jakoNapis(tekst) {
  return "'" + tekst
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\r\n?/g, '\n')
    .replace(/\n/g, '\\n') + "'";
}

/** Początek bloku wydarzenia o danym identyfikatorze. */
function blokWydarzenia(tekst, id) {
  const znacznik = `id: '${id}',`;
  let od = -1;
  // Ten sam identyfikator potrafi wystąpić i w lokalizacjach, i w wydarzeniach —
  // bierzemy to wystąpienie, po którym idzie pole `dzien`.
  for (let i = tekst.indexOf(znacznik); i !== -1; i = tekst.indexOf(znacznik, i + 1)) {
    const okno = tekst.slice(i, i + 400);
    if (/\bdzien:/.test(okno)) { od = i; break; }
  }
  if (od === -1) return null;
  let doKonca = tekst.indexOf("      id: '", od + znacznik.length);
  if (doKonca === -1) doKonca = tekst.length;
  return { od, doKonca };
}

function podmienNapis(tekst, blok, pole, wartosc) {
  const etykieta = `${pole}: '`;
  const i = tekst.indexOf(etykieta, blok.od);
  if (i === -1 || i > blok.doKonca) return null;
  const start = i + etykieta.length - 1;
  const koniec = koniecNapisu(tekst, start + 1);
  if (koniec === -1) return null;
  return tekst.slice(0, start) + jakoNapis(wartosc) + tekst.slice(koniec + 1);
}

function czytajTablice(tekst, blok, pole) {
  const etykieta = `${pole}: [`;
  const i = tekst.indexOf(etykieta, blok.od);
  if (i === -1 || i > blok.doKonca) return null;
  const start = i + etykieta.length;
  const koniec = tekst.indexOf(']', start);
  const srodek = tekst.slice(start, koniec).trim();
  const nazwy = srodek ? srodek.split(',').map(s => s.trim().replace(/^'|'$/g, '')).filter(Boolean) : [];
  return { start, koniec, nazwy };
}

/* ---------- zdjęcia ---------- */

async function przerob(zrodlo, docelowaNazwa) {
  const wyniki = [];
  for (const [przyrostek, bok] of [['', MAKS], ['-mini', MINI]]) {
    const cel = path.join(KORZEN, 'img', `${docelowaNazwa}${przyrostek}.jpg`);
    const info = await sharp(zrodlo)
      .rotate()
      .resize({ width: bok, height: bok, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: JAKOSC, mozjpeg: true, progressive: true })
      .toFile(cel);
    wyniki.push(`${path.basename(cel)} ${info.width}x${info.height} ${Math.round(info.size / 1024)} KB`);
  }
  return wyniki;
}

/* ---------- główna ---------- */

async function glowna() {
  if (!existsSync(PLIK)) { console.error(`Nie ma pliku dane/${swieto}.js`); process.exit(1); }
  if (!existsSync(SKRZYNKA)) {
    console.log(`\nNie ma katalogu zrodla/nowe/ — nie ma czego wciągać.`);
    console.log(`Utwórz go i wrzuć folder nazwany identyfikatorem wydarzenia.\n`);
    return;
  }

  let tekst = await readFile(PLIK, 'utf8');
  const okno = {};
  new Function('window', tekst)(okno);
  const znane = new Set(okno.DANE.wydarzenia.map(w => w.id));

  const wpisy = (await readdir(SKRZYNKA, { withFileTypes: true }))
    .filter(w => w.isDirectory() && !w.name.startsWith('_'));

  if (!wpisy.length) { console.log('\nSkrzynka zrodla/nowe/ jest pusta.\n'); return; }

  let zmian = 0;
  const doPrzeniesienia = [];
  const problemy = [];

  for (const wpis of wpisy) {
    const id = wpis.name;
    const folder = path.join(SKRZYNKA, id);

    if (!znane.has(id)) {
      problemy.push(`folder "${id}" — nie ma wydarzenia o takim identyfikatorze (patrz JAK-DODAWAC-TRESC.md)`);
      continue;
    }
    const blok = blokWydarzenia(tekst, id);
    if (!blok) { problemy.push(`nie znalazłem bloku wydarzenia "${id}" w pliku danych`); continue; }

    console.log(`\n${id}`);
    let cosZrobiono = false;

    // opis
    const sciezkaOpisu = path.join(folder, 'opis.txt');
    if (existsSync(sciezkaOpisu)) {
      const opis = (await readFile(sciezkaOpisu, 'utf8')).replace(/^﻿/, '').trim();
      if (!opis) {
        problemy.push(`"${id}": opis.txt jest pusty`);
      } else {
        const nowy = podmienNapis(tekst, blok, 'opis', opis);
        if (!nowy) problemy.push(`"${id}": nie udało się podmienić opisu`);
        else {
          if (!naSucho) tekst = nowy;
          console.log(`  opis: ${opis.length} znaków, ${opis.split('\n').length} akapitów`);
          cosZrobiono = true;
        }
      }
    }

    // zdjęcia
    const pliki = (await readdir(folder, { withFileTypes: true }))
      .filter(p => p.isFile() && OBRAZY.has(path.extname(p.name).toLowerCase()))
      .map(p => p.name)
      .sort((a, b) => a.localeCompare(b, 'pl'));

    if (pliki.length) {
      const blokPo = blokWydarzenia(tekst, id);         // tekst mógł się przesunąć po podmianie opisu
      const tab = czytajTablice(tekst, blokPo, 'zdjecia');
      if (!tab) problemy.push(`"${id}": nie znalazłem pola zdjecia`);
      else {
        let numer = 1;
        while (tab.nazwy.indexOf(`${id}-${numer}`) !== -1) numer++;
        const dodane = [];
        for (const plik of pliki) {
          const nazwa = `${id}-${numer++}`;
          if (naSucho) console.log(`  zdjęcie: ${plik} -> img/${nazwa}.jpg (+ mini)`);
          else {
            const w = await przerob(path.join(folder, plik), nazwa);
            console.log(`  ${plik} -> ${w.join('   ')}`);
          }
          dodane.push(nazwa);
        }
        const razem = tab.nazwy.concat(dodane);
        if (!naSucho) {
          tekst = tekst.slice(0, tab.start) + razem.map(n => `'${n}'`).join(', ') + tekst.slice(tab.koniec);
        }
        cosZrobiono = true;
      }
    }

    if (cosZrobiono) { zmian++; doPrzeniesienia.push({ id, folder }); }
    else console.log('  (nic do wzięcia — brak opis.txt i zdjęć)');
  }

  if (problemy.length) {
    console.log('\nProblemy:');
    problemy.forEach(p => console.log('  • ' + p));
  }

  if (!zmian) { console.log('\nNic nie zmieniono.\n'); return; }

  if (naSucho) {
    console.log(`\nPróba na sucho — plik z danymi nietknięty. Zmian do wprowadzenia: ${zmian}.\n`);
    return;
  }

  // Sprawdzamy, czy wynik nadal jest poprawnym JavaScriptem, ZANIM go zapiszemy.
  try { new Function('window', tekst)({}); }
  catch (e) {
    console.error(`\n  BŁĄD: po podmianie plik nie jest poprawny (${e.message}).`);
    console.error('  Nic nie zapisałem — plik z danymi został nietknięty.\n');
    process.exit(1);
  }

  await writeFile(PLIK, tekst);
  const zrobione = path.join(SKRZYNKA, '_zrobione');
  await mkdir(zrobione, { recursive: true });
  const stempel = new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');
  for (const { id, folder } of doPrzeniesienia) {
    await rename(folder, path.join(zrobione, `${id}_${stempel}`));
  }

  console.log(`\nZapisane: dane/${swieto}.js — wydarzeń zmienionych: ${zmian}`);
  console.log(`Przetworzone foldery przeniesione do zrodla/nowe/_zrobione/`);
  console.log(`\nTeraz uruchom:  node tools/sprawdz.js\n`);
}

glowna().catch(e => { console.error('Błąd:', e.message); process.exit(1); });
