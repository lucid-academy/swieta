#!/usr/bin/env node
/* Kontrola pliku z danymi przed publikacją.
 *
 *   node tools/sprawdz.js                    # sprawdza dane/bydgoskie.js
 *   node tools/sprawdz.js --swieto chelminskie
 *
 * Plik z danymi jest JavaScriptem, więc jeden zgubiony apostrof w polskim
 * tekście potrafi wygasić całą stronę — i to bez żadnego komunikatu.
 * To narzędzie łapie takie rzeczy, zanim zobaczy je ktokolwiek inny.
 *
 * Kod wyjścia 1, jeśli są błędy. Ostrzeżenia nie blokują.
 */

import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const KORZEN = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

let swieto = 'bydgoskie';
const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '--swieto') swieto = argv[++i];
  else { console.error(`Nieznana opcja: ${argv[i]}`); process.exit(1); }
}

const bledy = [];
const uwagi = [];
const blad = (m) => bledy.push(m);
const uwaga = (m) => uwagi.push(m);

/* ---------- wczytanie ---------- */

const sciezkaDanych = path.join(KORZEN, 'dane', `${swieto}.js`);
if (!existsSync(sciezkaDanych)) {
  console.error(`Nie ma pliku ${path.relative(KORZEN, sciezkaDanych)}`);
  process.exit(1);
}

const okno = {};
try {
  new Function('window', readFileSync(sciezkaDanych, 'utf8'))(okno);
} catch (e) {
  console.error(`\n  BŁĄD SKŁADNI w dane/${swieto}.js\n  ${e.message}\n`);
  console.error('  Najczęstsza przyczyna: apostrof w tekście, który zamknął napis');
  console.error("  za wcześnie. W środku napisu pisz \\' zamiast '.\n");
  process.exit(1);
}

const D = okno.DANE;
if (!D) { console.error('Plik nie ustawił window.DANE.'); process.exit(1); }

/* ---------- struktura ---------- */

for (const pole of ['swieto', 'kategorie', 'tagi', 'lokalizacje', 'wydarzenia']) {
  if (!D[pole]) blad(`brak pola \`${pole}\``);
}
if (bledy.length) { wypisz(); process.exit(1); }

if (!D.swieto.id) uwaga('swieto.id jest pusty — plan i intro zapiszą się pod nazwą zastępczą');
if (!Array.isArray(D.swieto.dni) || !D.swieto.dni.length) blad('swieto.dni jest puste');

const kategorie = new Set(D.kategorie.map(k => k.id));
const nurty = new Set((D.nurty || []).map(n => n.id));
const tagi = new Set(D.tagi.map(t => t.id));
const dni = new Set((D.swieto.dni || []).map(d => d.id));
const lokalizacje = new Map(D.lokalizacje.map(l => [l.id, l]));

/* ---------- identyfikatory ---------- */

function duplikaty(lista, co) {
  const widziane = new Set();
  for (const id of lista) {
    if (widziane.has(id)) blad(`powtórzony identyfikator ${co}: "${id}"`);
    widziane.add(id);
  }
}
duplikaty(D.lokalizacje.map(l => l.id), 'lokalizacji');
duplikaty(D.wydarzenia.map(w => w.id), 'wydarzenia');

// Ten sam identyfikator w obu zbiorach nie jest błędem, ale myli narzędzia.
for (const w of D.wydarzenia) {
  if (lokalizacje.has(w.id)) {
    uwaga(`wydarzenie "${w.id}" ma ten sam identyfikator co lokalizacja — lepiej rozróżnić`);
  }
}

/* ---------- lokalizacje ---------- */

const M = wczytajMape();
for (const l of D.lokalizacje) {
  if (!l.nazwa) blad(`lokalizacja "${l.id}": brak nazwy`);
  if (!l.gps) { uwaga(`lokalizacja "${l.id}" nie ma współrzędnych — pin się nie pojawi`); continue; }
  if (typeof l.gps.lat !== 'number' || typeof l.gps.lng !== 'number') {
    blad(`lokalizacja "${l.id}": współrzędne nie są liczbami`);
    continue;
  }
  if (M && (l.gps.lat < M.bbox.poludnie || l.gps.lat > M.bbox.polnoc ||
            l.gps.lng < M.bbox.zachod  || l.gps.lng > M.bbox.wschod)) {
    blad(`lokalizacja "${l.id}": współrzędne wypadają poza wycinek mapy — pin byłby niewidoczny`);
  }
  if (!l.zrodloGps) uwaga(`lokalizacja "${l.id}": brak notatki, skąd wzięta współrzędna`);
}

function wczytajMape() {
  const p = path.join(KORZEN, 'dane', `mapa-${swieto}.js`);
  if (!existsSync(p)) { uwaga(`brak dane/mapa-${swieto}.js — nie sprawdzę, czy piny mieszczą się w mapie`); return null; }
  const o = {};
  try { new Function('window', readFileSync(p, 'utf8'))(o); return o.MAPA; }
  catch { uwaga('nie udało się wczytać pliku mapy'); return null; }
}

/* ---------- wydarzenia ---------- */

const godzina = /^([01]\d|2[0-3]):[0-5]\d$/;
const uzyteTagi = new Set();
let bezOpisu = 0, bezKonca = 0;

for (const w of D.wydarzenia) {
  const gdzie = `wydarzenie "${w.id}"`;
  if (!w.tytul) blad(`${gdzie}: brak tytułu`);
  if (!dni.has(w.dzien)) blad(`${gdzie}: dzień "${w.dzien}" nie istnieje w swieto.dni`);
  if (!lokalizacje.has(w.lokalizacja)) blad(`${gdzie}: lokalizacja "${w.lokalizacja}" nie istnieje`);
  if (!kategorie.has(w.kategoria)) blad(`${gdzie}: kategoria "${w.kategoria}" nie istnieje`);
  if (w.nurt && !nurty.has(w.nurt)) blad(`${gdzie}: nurt "${w.nurt}" nie istnieje`);

  if (!godzina.test(w.od || '')) blad(`${gdzie}: godzina rozpoczęcia "${w.od}" nie jest w formacie GG:MM`);
  if (w.do) {
    if (!godzina.test(w.do)) blad(`${gdzie}: godzina zakończenia "${w.do}" nie jest w formacie GG:MM`);
    else if (w.do <= w.od) blad(`${gdzie}: kończy się (${w.do}) nie później niż zaczyna (${w.od})`);
  } else bezKonca++;

  if (!w.opis) bezOpisu++;

  for (const t of (w.tagi || [])) {
    if (!tagi.has(t)) blad(`${gdzie}: tag "${t}" nie istnieje`);
    uzyteTagi.add(t);
  }

  for (const l of (w.linki || [])) {
    if (!l.etykieta) blad(`${gdzie}: link bez etykiety`);
    if (!/^https?:\/\//.test(l.url || '')) blad(`${gdzie}: link "${l.etykieta}" nie zaczyna się od http`);
  }

  for (const n of (w.zdjecia || [])) {
    for (const wariant of [`${n}.jpg`, `${n}-mini.jpg`]) {
      if (!existsSync(path.join(KORZEN, 'img', wariant))) {
        blad(`${gdzie}: brak pliku img/${wariant} — przepuść zdjęcie przez tools/zdjecia.js`);
      }
    }
  }

  if (w.promocja && !/^https?:\/\//.test(w.promocja.url || '')) {
    uwaga(`${gdzie}: promocja bez poprawnego adresu — przycisk się nie pokaże`);
  }
}

for (const t of tagi) {
  if (!uzyteTagi.has(t)) uwaga(`tag "${t}" nie jest użyty przy żadnym wydarzeniu — filtr będzie pusty`);
}

/* ---------- intro ---------- */

if (D.swieto.intro) {
  const i = D.swieto.intro;
  const pliki = [i.film, i.okladka, i.tlo && i.tlo.daleko, i.tlo && i.tlo.srodek,
                 i.tlo && i.tlo.blisko, i.tlo && i.tlo.animacja].filter(Boolean);
  for (const p of pliki) {
    if (!existsSync(path.join(KORZEN, p))) blad(`intro: brak pliku ${p}`);
  }
}

/* ---------- wynik ---------- */

function wypisz() {
  if (bledy.length) {
    console.log(`\n  BŁĘDY (${bledy.length}) — to zatrzyma stronę albo popsuje treść:\n`);
    bledy.forEach(b => console.log('   • ' + b));
  }
  if (uwagi.length) {
    console.log(`\n  Do wiadomości (${uwagi.length}):\n`);
    uwagi.forEach(u => console.log('   · ' + u));
  }
}

console.log(`\ndane/${swieto}.js — ${D.wydarzenia.length} wydarzeń, ${D.lokalizacje.length} lokalizacji`);
console.log(`bez opisu: ${bezOpisu}   bez godziny zakończenia: ${bezKonca}`);
wypisz();

if (bledy.length) {
  console.log('\n  Popraw błędy i uruchom ponownie.\n');
  process.exit(1);
}
console.log(bledy.length || uwagi.length ? '' : '\n  Wszystko w porządku.\n');
if (uwagi.length) console.log('\n  Błędów nie ma — można publikować.\n');
