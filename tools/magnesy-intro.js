#!/usr/bin/env node
/* Przygotowanie magnesów pamiątkowych do intra (intro.html).
 *
 *   node tools/magnesy-intro.js
 *   node tools/magnesy-intro.js --zrodla "D:\gdzies\magnesy" --wyjscie img/magnesy
 *
 * Źródła leżą poza repozytorium (Desktop\Swieta dzielnic\CHP\...), bo to pliki
 * do druku po kilka MB. Tutaj powstają z nich lekkie WebP-y — całe intro ma
 * zmieścić się w kilkuset kilobajtach, bo ogląda je człowiek stojący w parku
 * na LTE.
 *
 * Trzy sposoby obróbki:
 *   prostokat — zwykły kadr, opcjonalnie po obcięciu ramki (2024)
 *   alfa      — plik ma już kanał alfa, wystarczy przyciąć do zawartości (2023)
 *   wytnij    — białe tło leci do przezroczystości (2025, 2026)
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const KORZEN = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const ZRODLA_DOMYSLNE =
  'C:\\Users\\piotr\\Desktop\\Swieta dzielnic\\CHP\\magnesy dotychczasowe-20260901T134928Z-1-001\\magnesy dotychczasowe';

/* ---------- co i jak ---------- */

const MAGNESY = [
  { rok: 2018, plik: '01 Pierwsze Swieto chelmionka magnes FINAL 2018.jpg', typ: 'prostokat', szer: 900 },
  { rok: 2019, plik: '02 Drugie Swieto chelmionka magnes FINAL 2019.jpg',   typ: 'prostokat', szer: 900 },
  // węgiel, mono, najsłabsze źródło — leci w drugim planie, więc nie potrzebuje pikseli
  { rok: 2020, plik: 'trzecie SChP-magnes_50x50 trzecie swieta.jpg',        typ: 'prostokat', szer: 440 },
  { rok: 2021, plik: '4 chelmionka magnes.jpg',                            typ: 'prostokat', szer: 720 },
  { rok: 2022, plik: 'V swieto chelmionki.png',                            typ: 'prostokat', szer: 720 },
  { rok: 2023, plik: '6 swieto.png',                                       typ: 'alfa',      szer: 720 },
  // szara ramka passe-partout, zmierzona na 45/40/47/49 px — z zapasem 2 px
  { rok: 2024, plik: 'magbes 7 swieto chelmionki.jpg',                     typ: 'prostokat', szer: 720,
    kadr: { gora: 47, dol: 42, lewo: 49, prawo: 51 } },
  { rok: 2025, plik: 'Projekt sklejka 8 Swieto chelmionki.jpg',            typ: 'wytnij',    szer: 720, tol: 8 },
  // różowa obwódka w pliku do druku to linia cięcia, a nie element projektu —
  // na fizycznym magnesie jej nie ma. Zjadamy 4 px do środka, żeby zniknęła.
  { rok: 2026, plik: 'Magnes_chelminskie final, 9.png',                    typ: 'wytnij',    szer: 900, tol: 7,
    zjedz: 4, wyostrz: true }
];

/* ---------- argumenty ---------- */

function czytajArgumenty(argv) {
  const o = { zrodla: ZRODLA_DOMYSLNE, wyjscie: 'img/magnesy' };
  for (let i = 0; i < argv.length; i++) {
    switch (argv[i]) {
      case '--zrodla':  o.zrodla  = argv[++i]; break;
      case '--wyjscie': o.wyjscie = argv[++i]; break;
      default: throw new Error(`nieznany argument: ${argv[i]}`);
    }
  }
  return o;
}

/* ---------- wycinanie białego tła ---------- */

/* Zalewanie od krawędzi kadru: przezroczyste robi się tylko to białe, które
 * łączy się z brzegiem. Biel w środku rysunku zostaje nietknięta. */
function zalejOdKrawedzi(px, W, H, tol) {
  const prog = 255 - tol;
  const zewn = new Uint8Array(W * H);
  const kolejka = new Int32Array(W * H);
  let glowa = 0, ogon = 0;

  const biale = (i) => px[i * 4] >= prog && px[i * 4 + 1] >= prog && px[i * 4 + 2] >= prog;
  const dodaj = (i) => { if (!zewn[i] && biale(i)) { zewn[i] = 1; kolejka[ogon++] = i; } };

  for (let x = 0; x < W; x++) { dodaj(x); dodaj((H - 1) * W + x); }
  for (let y = 0; y < H; y++) { dodaj(y * W); dodaj(y * W + W - 1); }

  while (glowa < ogon) {
    const i = kolejka[glowa++];
    const x = i % W, y = (i / W) | 0;
    if (x > 0)     dodaj(i - 1);
    if (x < W - 1) dodaj(i + 1);
    if (y > 0)     dodaj(i - W);
    if (y < H - 1) dodaj(i + W);
  }
  return zewn;
}

/* Rozszerzenie maski o n pikseli do środka — zjada linię cięcia. */
function rozszerz(zewn, W, H, n) {
  for (let krok = 0; krok < n; krok++) {
    const kopia = zewn.slice();
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x;
      if (kopia[i]) continue;
      if ((x > 0 && kopia[i - 1]) || (x < W - 1 && kopia[i + 1]) ||
          (y > 0 && kopia[i - W]) || (y < H - 1 && kopia[i + W])) zewn[i] = 1;
    }
  }
}

/* Wylanie koloru z krawędzi obiektu na zewnątrz. Bez tego skalowanie w dół
 * wmiesza biel spod alfy w krawędź i na ciemnym tle zrobi się jasna obwódka. */
function wylejKolor(px, zewn, W, H, pierscienie) {
  let front = zewn.slice();
  for (let krok = 0; krok < pierscienie; krok++) {
    const nowy = front.slice();
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x;
      if (!front[i]) continue;
      const sasiedzi = [];
      if (x > 0)     sasiedzi.push(i - 1);
      if (x < W - 1) sasiedzi.push(i + 1);
      if (y > 0)     sasiedzi.push(i - W);
      if (y < H - 1) sasiedzi.push(i + W);
      for (const s of sasiedzi) {
        if (front[s]) continue;
        px[i * 4]     = px[s * 4];
        px[i * 4 + 1] = px[s * 4 + 1];
        px[i * 4 + 2] = px[s * 4 + 2];
        nowy[i] = 0;
        break;
      }
    }
    front = nowy;
  }
}

/* ---------- pomocnicze ---------- */

function ramkaZawartosci(px, W, H) {
  let minx = W, miny = H, maxx = -1, maxy = -1;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (px[(y * W + x) * 4 + 3] < 8) continue;
    if (x < minx) minx = x;
    if (x > maxx) maxx = x;
    if (y < miny) miny = y;
    if (y > maxy) maxy = y;
  }
  if (maxx < 0) throw new Error('cała grafika wyszła przezroczysta — za duża tolerancja?');
  return { left: minx, top: miny, width: maxx - minx + 1, height: maxy - miny + 1 };
}

const kb = (n) => `${Math.round(n / 1024)} kB`;

/* ---------- obróbka ---------- */

async function przerob(m, o) {
  const zrodlo = path.join(o.zrodla, m.plik);
  if (!existsSync(zrodlo)) throw new Error(`brak pliku: ${zrodlo}`);
  const cel = path.join(KORZEN, o.wyjscie, `${m.rok}.webp`);

  let obraz = sharp(zrodlo, { unlimited: true });
  const meta = await obraz.metadata();

  if (m.kadr) {
    obraz = obraz.extract({
      left: m.kadr.lewo,
      top: m.kadr.gora,
      width: meta.width - m.kadr.lewo - m.kadr.prawo,
      height: meta.height - m.kadr.gora - m.kadr.dol
    });
  }

  let potok;
  let opis;

  if (m.typ === 'prostokat') {
    potok = obraz
      .resize({ width: m.szer, kernel: sharp.kernel.lanczos3, withoutEnlargement: true })
      .webp({ quality: 76, effort: 6 });
    opis = m.kadr ? 'prostokąt po obcięciu ramki' : 'prostokąt';
  } else {
    // alfa i wytnij idą przez surowy bufor
    const { data: px, info } = await obraz.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const W = info.width, H = info.height;

    if (m.typ === 'wytnij') {
      const zewn = zalejOdKrawedzi(px, W, H, m.tol ?? 8);
      if (m.zjedz) rozszerz(zewn, W, H, m.zjedz);
      let sciete = 0;
      for (let i = 0; i < W * H; i++) if (zewn[i]) { px[i * 4 + 3] = 0; sciete++; }
      wylejKolor(px, zewn, W, H, 3);
      opis = `wycięte tło (${((sciete * 100) / (W * H)).toFixed(0)}% kadru)`;
    } else {
      opis = 'alfa ze źródła';
    }

    const ramka = ramkaZawartosci(px, W, H);
    potok = sharp(px, { raw: { width: W, height: H, channels: 4 } })
      .extract(ramka)
      .resize({ width: m.szer, kernel: sharp.kernel.lanczos3 });
    if (m.wyostrz) potok = potok.sharpen({ sigma: 0.8, m1: 0.4, m2: 0.9 });
    potok = potok.webp({ quality: 82, alphaQuality: 92, effort: 6 });
    opis += `, kadr ${ramka.width}×${ramka.height}`;
  }

  const wynik = await potok.toBuffer({ resolveWithObject: true });
  await writeFile(cel, wynik.data);
  return { rok: m.rok, opis, w: wynik.info.width, h: wynik.info.height, bajty: wynik.data.length };
}

/* ---------- główna ---------- */

async function glowna() {
  const o = czytajArgumenty(process.argv.slice(2));
  await mkdir(path.join(KORZEN, o.wyjscie), { recursive: true });

  let razem = 0;
  for (const m of MAGNESY) {
    const r = await przerob(m, o);
    razem += r.bajty;
    console.log(
      `${r.rok}  ${String(r.w).padStart(4)}×${String(r.h).padEnd(4)}  ${kb(r.bajty).padStart(7)}   ${r.opis}`
    );
  }
  console.log(`\nrazem ${kb(razem)} w ${o.wyjscie}/`);
}

glowna().catch((e) => { console.error('Błąd:', e.message); process.exitCode = 1; });
