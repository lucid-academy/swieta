#!/usr/bin/env node
/* Kod QR do strony święta.
 *
 *   node tools/qr.js                       # domyślny adres z danych
 *   node tools/qr.js --adres https://...    # inny adres
 *   node tools/qr.js --wyjscie img/qr       # inna nazwa plików
 *
 * Powstają cztery pliki:
 *   <nazwa>.svg          wektor do druku — skaluje się bez utraty jakości
 *   <nazwa>.png          2000 px, do wrzucenia w grafikę
 *   <nazwa>-druk.svg     czarno-biały, maksymalna pewność odczytu
 *   <nazwa>-druk.png     to samo rastrowo
 *
 * Wersja kolorowa używa palety mapy (tusz na papierze). Kontrast jest
 * sprawdzany przed zapisem, a każdy wynikowy PNG jest ODCZYTYWANY z powrotem
 * — bo kod QR, który się nie skanuje, jest gorszy niż jego brak.
 */

import { writeFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import QRCode from 'qrcode';
import jsQR from 'jsqr';
import sharp from 'sharp';

const KORZEN = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/* Paleta mapy — ten sam tusz i papier co na planszy. */
const TUSZ = '#4B402F';
const PAPIER = '#EBD9B7';

let adres = null, wyjscie = 'img/qr-swieto', swieto = 'bydgoskie';
const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '--adres') adres = argv[++i];
  else if (argv[i] === '--wyjscie') wyjscie = argv[++i];
  else if (argv[i] === '--swieto') swieto = argv[++i];
  else { console.error(`Nieznana opcja: ${argv[i]}`); process.exit(1); }
}

if (!adres) {
  const okno = {};
  new Function('window', readFileSync(path.join(KORZEN, 'dane', `${swieto}.js`), 'utf8'))(okno);
  adres = (okno.DANE.swieto && okno.DANE.swieto.adres) || 'https://lucidacademy.pl/projekty/swietobp/';
}

/* ---------- kontrola kontrastu ---------- */

const kanal = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
const lum = h => {
  const n = parseInt(h.slice(1), 16);
  return 0.2126 * kanal(n >> 16 & 255) + 0.7152 * kanal(n >> 8 & 255) + 0.0722 * kanal(n & 255);
};
const kontrast = (a, b) => {
  const l1 = lum(a), l2 = lum(b);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
};

const k = kontrast(TUSZ, PAPIER);
if (k < 4) {
  console.error(`Kontrast ${k.toFixed(2)} jest za niski dla kodu QR — czytniki potrzebują wyraźnej różnicy.`);
  process.exit(1);
}

/* ---------- generowanie ---------- */

/* Poziom H znosi uszkodzenie do 30% powierzchni. Kod idzie na plakaty
   i ulotki w plenerze, gdzie może zmoknąć albo się zabrudzić — margines
   bezpieczeństwa jest wart kilku modułów więcej. */
const USTAWIENIA = { errorCorrectionLevel: 'H', margin: 4 };

async function zrob(nazwa, kolory, szerokosc) {
  const svg = await QRCode.toString(adres, { ...USTAWIENIA, type: 'svg', color: kolory, width: szerokosc });
  await writeFile(path.join(KORZEN, nazwa + '.svg'), svg);
  await QRCode.toFile(path.join(KORZEN, nazwa + '.png'), adres, { ...USTAWIENIA, color: kolory, width: szerokosc });
  return path.join(KORZEN, nazwa + '.png');
}

/** Odczytuje gotowy plik z powrotem — jedyny wiarygodny dowód, że działa. */
async function sprawdzOdczyt(sciezkaPng) {
  const { data, info } = await sharp(sciezkaPng)
    .resize(600, 600, { fit: 'inside' })
    .ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const wynik = jsQR(new Uint8ClampedArray(data), info.width, info.height);
  return wynik ? wynik.data : null;
}

const kolorowy = await zrob(wyjscie, { dark: TUSZ, light: PAPIER }, 2000);
const czarnobialy = await zrob(wyjscie + '-druk', { dark: '#000000', light: '#FFFFFF' }, 2000);

console.log(`\nAdres w kodzie:\n  ${adres}\n`);
console.log(`Kontrast tusz/papier: ${k.toFixed(2)}  (czytniki potrzebują min. ok. 3)`);
console.log(`Korekcja błędów: H — kod działa po zabrudzeniu do 30% powierzchni\n`);

let bledy = 0;
for (const [opis, plik] of [['kolorowy', kolorowy], ['czarno-biały', czarnobialy]]) {
  const odczyt = await sprawdzOdczyt(plik);
  const ok = odczyt === adres;
  if (!ok) bledy++;
  console.log(`  ${opis.padEnd(14)} ${ok ? 'odczytany poprawnie' : 'NIE DA SIĘ ODCZYTAĆ: ' + odczyt}`);
}

console.log(`\nPliki: ${wyjscie}.svg/.png oraz ${wyjscie}-druk.svg/.png`);
if (bledy) { console.error('\nKtóryś kod się nie odczytuje — nie używaj go.'); process.exit(1); }
