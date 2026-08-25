#!/usr/bin/env node
/* Pobranie geometrii dzielnicy z OpenStreetMap do dane/mapa-<swieto>.js.
 *
 *   node tools/mapa.js                          # bydgoskie, domyślne uproszczenie
 *   node tools/mapa.js --swieto chelminskie     # drugie święto
 *   node tools/mapa.js --epsilon 1.5            # próg upraszczania w metrach
 *   node tools/mapa.js --z-pliku surowe.json    # bez pobierania, z zapisanej odpowiedzi
 *
 * Pobieramy raz i trzymamy w repo — strona ma działać bez internetu.
 *
 * Wycinek liczy się z lokalizacji w danych święta plus margines, więc dla
 * innej dzielnicy wystarczy podmienić plik danych. Współrzędne zapisujemy
 * jako metry od północno-zachodniego rogu wycinka (rzutowanie
 * równoprostokątne z korektą cos(lat0)) — krótkie liczby zamiast
 * siedmiu cyfr po przecinku, a renderer i tak musi umieć przeliczyć
 * GPS pinów na te same metry.
 *
 * Opcje:
 *   --swieto NAZWA     które dane wczytać (domyślnie bydgoskie)
 *   --epsilon METRY    próg Douglasa-Peuckera (domyślnie 1.5, 0 = bez upraszczania)
 *   --margines METRY   zapas wokół lokalizacji (domyślnie 400)
 *   --z-pliku PLIK     użyj zapisanej odpowiedzi Overpass zamiast pobierać
 *   --zapisz-surowe P  zapisz surową odpowiedź do pliku
 *   --wyjscie PLIK     gdzie zapisać wynik (domyślnie dane/mapa-<swieto>.js)
 *   --cicho            bez raportu
 */

import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const KORZEN = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OVERPASS = 'https://overpass-api.de/api/interpreter';
const METR_NA_STOPIEN = 111320;

/* ---------- klasyfikacja ---------- */

const GLOWNE  = ['motorway', 'trunk', 'primary', 'secondary', 'tertiary',
                 'motorway_link', 'trunk_link', 'primary_link', 'secondary_link', 'tertiary_link'];
const LOKALNE = ['residential', 'unclassified', 'living_street'];
const PIESZO  = ['pedestrian', 'footway', 'path'];

// Budynki, które trafiają na mapę mimo braku nazwy.
const BUDYNKI_PUBLICZNE = ['public', 'civic', 'school', 'university', 'church',
                           'chapel', 'cathedral', 'hospital', 'train_station', 'museum'];

/* ---------- argumenty ---------- */

function czytajArgumenty(argv) {
  const o = { swieto: 'bydgoskie', epsilon: 1.5, margines: 400, zPliku: null, zapiszSurowe: null, wyjscie: null, cicho: false };
  const liczba = (w, n) => {
    const x = Number(w);
    if (!Number.isFinite(x) || x < 0) throw new Error(`--${n} oczekuje liczby nieujemnej, dostało: ${w}`);
    return x;
  };
  for (let i = 0; i < argv.length; i++) {
    switch (argv[i]) {
      case '--swieto':        o.swieto = argv[++i]; break;
      case '--epsilon':       o.epsilon = liczba(argv[++i], 'epsilon'); break;
      case '--margines':      o.margines = liczba(argv[++i], 'margines'); break;
      case '--z-pliku':       o.zPliku = argv[++i]; break;
      case '--zapisz-surowe': o.zapiszSurowe = argv[++i]; break;
      case '--wyjscie':       o.wyjscie = argv[++i]; break;
      case '--cicho':         o.cicho = true; break;
      default: throw new Error(`Nieznana opcja: ${argv[i]}`);
    }
  }
  return o;
}

/* ---------- geometria ---------- */

/** Prostopadła odległość punktu od odcinka, w metrach. */
function odleglosc(p, a, b) {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  if (dx === 0 && dy === 0) return Math.hypot(p[0] - a[0], p[1] - a[1]);
  const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dy));
}

/** Douglas-Peucker. Zachowuje końce, więc skrzyżowania nie odjeżdżają. */
function uprosc(punkty, epsilon) {
  if (epsilon <= 0 || punkty.length < 3) return punkty;
  let maks = 0, indeks = 0;
  for (let i = 1; i < punkty.length - 1; i++) {
    const d = odleglosc(punkty[i], punkty[0], punkty[punkty.length - 1]);
    if (d > maks) { maks = d; indeks = i; }
  }
  if (maks <= epsilon) return [punkty[0], punkty[punkty.length - 1]];
  return [
    ...uprosc(punkty.slice(0, indeks + 1), epsilon).slice(0, -1),
    ...uprosc(punkty.slice(indeks), epsilon)
  ];
}

/** Największe odchylenie uproszczonej linii od oryginału, w metrach. */
function odchylenie(oryginal, uproszczony) {
  let maks = 0;
  let j = 0;
  for (const p of oryginal) {
    while (j < uproszczony.length - 2 &&
           odleglosc(p, uproszczony[j], uproszczony[j + 1]) > odleglosc(p, uproszczony[j + 1], uproszczony[j + 2])) j++;
    maks = Math.max(maks, odleglosc(p, uproszczony[j], uproszczony[j + 1]));
  }
  return maks;
}

function wWieloboku([x, y], wielobok) {
  let w = false;
  for (let i = 0, j = wielobok.length - 1; i < wielobok.length; j = i++) {
    const [xi, yi] = wielobok[i], [xj, yj] = wielobok[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) w = !w;
  }
  return w;
}

/** Pole wielokąta w metrach kwadratowych (wzór na sznurowadło). */
function pole(punkty) {
  let s = 0;
  for (let i = 0, j = punkty.length - 1; i < punkty.length; j = i++) {
    s += (punkty[j][0] + punkty[i][0]) * (punkty[j][1] - punkty[i][1]);
  }
  return Math.abs(s / 2);
}

/* ---------- Overpass ---------- */

function zapytanie(b) {
  const w = `${b.poludnie},${b.zachod},${b.polnoc},${b.wschod}`;
  return `[out:json][timeout:120];
(
  way["highway"~"^(motorway|trunk|primary|secondary|tertiary|motorway_link|trunk_link|primary_link|secondary_link|tertiary_link|residential|unclassified|living_street|pedestrian|footway|path)$"](${w});
  way["leisure"~"^(park|garden)$"](${w});
  way["landuse"~"^(forest|allotments|cemetery|meadow)$"](${w});
  way["natural"~"^(water|wood)$"](${w});
  way["waterway"="river"](${w});
  way["building"](${w});
);
out geom;`;
}

async function pobierz(b) {
  const r = await fetch(OVERPASS, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'swieta-mapa/1.0 (mapa swieta dzielnicowego, jednorazowe pobranie)'
    },
    body: 'data=' + encodeURIComponent(zapytanie(b))
  });
  if (!r.ok) throw new Error(`Overpass odpowiedział ${r.status}: ${(await r.text()).slice(0, 200)}`);
  return r.json();
}

/* ---------- główna ---------- */

async function glowna() {
  const o = czytajArgumenty(process.argv.slice(2));
  const gadaj = (...a) => { if (!o.cicho) console.log(...a); };

  // 1. Wycinek liczony z lokalizacji święta.
  const window = {};
  new Function('window', readFileSync(path.join(KORZEN, 'dane', `${o.swieto}.js`), 'utf8'))(window);
  const lokalizacje = window.DANE.lokalizacje.filter(l => l.gps);
  if (!lokalizacje.length) throw new Error('Żadna lokalizacja nie ma współrzędnych.');

  const laty = lokalizacje.map(l => l.gps.lat), lngi = lokalizacje.map(l => l.gps.lng);
  const lat0 = (Math.min(...laty) + Math.max(...laty)) / 2;
  const skalaDlugosci = Math.cos(lat0 * Math.PI / 180);
  const dLat = o.margines / METR_NA_STOPIEN;
  const dLng = o.margines / (METR_NA_STOPIEN * skalaDlugosci);

  const bbox = {
    poludnie: +(Math.min(...laty) - dLat).toFixed(5),
    zachod:   +(Math.min(...lngi) - dLng).toFixed(5),
    polnoc:   +(Math.max(...laty) + dLat).toFixed(5),
    wschod:   +(Math.max(...lngi) + dLng).toFixed(5)
  };

  // Metry od północno-zachodniego rogu. Ten sam wzór musi siedzieć w rendererze.
  const naMetry = (lat, lng) => [
    (lng - bbox.zachod) * METR_NA_STOPIEN * skalaDlugosci,
    (bbox.polnoc - lat) * METR_NA_STOPIEN
  ];
  const szerokosc = Math.round((bbox.wschod - bbox.zachod) * METR_NA_STOPIEN * skalaDlugosci);
  const wysokosc  = Math.round((bbox.polnoc - bbox.poludnie) * METR_NA_STOPIEN);

  gadaj(`Święto:   ${o.swieto} (${lokalizacje.length} lokalizacji)`);
  gadaj(`Wycinek:  ${szerokosc} x ${wysokosc} m, margines ${o.margines} m`);
  gadaj(`Epsilon:  ${o.epsilon} m\n`);

  // 2. Dane z OSM.
  const surowe = o.zPliku
    ? JSON.parse(readFileSync(path.resolve(KORZEN, o.zPliku), 'utf8'))
    : await pobierz(bbox);
  if (o.zapiszSurowe) writeFileSync(path.resolve(KORZEN, o.zapiszSurowe), JSON.stringify(surowe));
  gadaj(`Z OSM:    ${surowe.elements.length} elementów${o.zPliku ? ' (z pliku)' : ''}`);

  const wMetrach = e => (e.geometry || []).filter(Boolean).map(p => naMetry(p.lat, p.lon));

  // 3. Filtry. Parki najpierw — potrzebne, żeby wybrać ścieżki w parku.
  const parki = surowe.elements
    .filter(e => e.tags?.leisure === 'park' && e.geometry?.length > 3)
    .map(e => ({ e, pkt: wMetrach(e) }))
    .filter(x => pole(x.pkt) > 5000);

  // Większość punktów w parku, nie „choć jeden" — inaczej ścieżka, która ledwo
  // muska park, wchodzi na mapę całą swoją kilometrową długością.
  const wParku = pkt => {
    const w = pkt.filter(q => parki.some(p => wWieloboku(q, p.pkt))).length;
    return w > pkt.length / 2;
  };

  const warstwy = { woda: [], zielen: [], budynki: [], ulice: { glowne: [], lokalne: [], pieszo: [] } };
  const licznik = { pominiete: 0 };

  let punktowPrzed = 0, punktowPo = 0, najwiekszeOdchylenie = 0;

  const dodaj = (cel, e, pkt, zamkniety = false) => {
    punktowPrzed += pkt.length;
    const u = uprosc(pkt, o.epsilon);
    punktowPo += u.length;
    if (o.epsilon > 0 && pkt.length > 2) najwiekszeOdchylenie = Math.max(najwiekszeOdchylenie, odchylenie(pkt, u));
    const obiekt = { p: u.flat().map(v => Math.round(v * 10) / 10) };
    if (e.tags?.name) obiekt.n = e.tags.name;
    if (zamkniety) obiekt.z = 1;
    cel.push(obiekt);
  };

  for (const e of surowe.elements) {
    const t = e.tags || {};
    const pkt = wMetrach(e);
    if (pkt.length < 2) continue;
    const zamkniety = pkt.length > 3 &&
      Math.hypot(pkt[0][0] - pkt.at(-1)[0], pkt[0][1] - pkt.at(-1)[1]) < 0.5;

    if (t.highway) {
      if (GLOWNE.includes(t.highway))       dodaj(warstwy.ulice.glowne, e, pkt);
      else if (LOKALNE.includes(t.highway)) dodaj(warstwy.ulice.lokalne, e, pkt);
      else if (PIESZO.includes(t.highway)) {
        // Chodniki wzdłuż ulic tylko dublują siatkę i zatykają mapę.
        // Zostają deptaki i to, co prowadzi przez park.
        if (t.highway === 'pedestrian' || wParku(pkt)) dodaj(warstwy.ulice.pieszo, e, pkt);
        else licznik.pominiete++;
      }
      continue;
    }

    if (t.natural === 'water' || t.waterway === 'river') { dodaj(warstwy.woda, e, pkt, zamkniety); continue; }

    if (t.leisure === 'park' || t.landuse === 'forest' || t.landuse === 'allotments' ||
        t.landuse === 'cemetery' || t.landuse === 'meadow' || t.natural === 'wood') {
      // Skrawki zieleni między kamienicami to szum — liczy się park i las.
      if (pole(pkt) > 2000) dodaj(warstwy.zielen, e, pkt, zamkniety);
      else licznik.pominiete++;
      continue;
    }

    if (t.building) {
      const publiczny = t.amenity || BUDYNKI_PUBLICZNE.includes(t.building) || t.tourism || t.historic;
      if ((publiczny || t.name) && pole(pkt) > 150) dodaj(warstwy.budynki, e, pkt, zamkniety);
      else licznik.pominiete++;
    }
  }

  // 4. Zapis.
  const dane = {
    zrodlo: 'OpenStreetMap',
    licencja: 'ODbL 1.0',
    pobrano: new Date().toISOString().slice(0, 10),
    bbox,
    rzutowanie: { lat0: +lat0.toFixed(6), skalaDlugosci: +skalaDlugosci.toFixed(6), metrNaStopien: METR_NA_STOPIEN },
    szerokosc, wysokosc,
    epsilon: o.epsilon,
    warstwy
  };

  const wyjscie = path.resolve(KORZEN, o.wyjscie || path.join('dane', `mapa-${o.swieto}.js`));
  writeFileSync(wyjscie,
    `/* Geometria dzielnicy z OpenStreetMap (© autorzy OpenStreetMap, ODbL 1.0).\n` +
    `   Pobrane raz przez tools/mapa.js — strona nie odpytuje sieci.\n` +
    `   Współrzędne w metrach od północno-zachodniego rogu wycinka.\n` +
    `   Uproszczenie Douglasa-Peuckera, epsilon ${o.epsilon} m. */\n\n` +
    `window.MAPA = ${JSON.stringify(dane)};\n`);

  const kb = (readFileSync(wyjscie).length / 1024).toFixed(0);
  const ile = w => w.reduce((s, x) => s + x.p.length / 2, 0);
  gadaj(`
Warstwy:
  ulice główne     ${String(warstwy.ulice.glowne.length).padStart(5)} obiektów ${String(ile(warstwy.ulice.glowne)).padStart(6)} pkt
  ulice lokalne    ${String(warstwy.ulice.lokalne.length).padStart(5)} obiektów ${String(ile(warstwy.ulice.lokalne)).padStart(6)} pkt
  ciągi piesze     ${String(warstwy.ulice.pieszo.length).padStart(5)} obiektów ${String(ile(warstwy.ulice.pieszo)).padStart(6)} pkt
  zieleń           ${String(warstwy.zielen.length).padStart(5)} obiektów ${String(ile(warstwy.zielen)).padStart(6)} pkt
  woda             ${String(warstwy.woda.length).padStart(5)} obiektów ${String(ile(warstwy.woda)).padStart(6)} pkt
  budynki          ${String(warstwy.budynki.length).padStart(5)} obiektów ${String(ile(warstwy.budynki)).padStart(6)} pkt
  odfiltrowane     ${String(licznik.pominiete).padStart(5)} obiektów

Punkty: ${punktowPrzed} -> ${punktowPo} (${(100 - punktowPo / punktowPrzed * 100).toFixed(1)}% mniej)
Największe odchylenie od oryginału: ${najwiekszeOdchylenie.toFixed(2)} m
Zapisane: ${path.relative(KORZEN, wyjscie)}, ${kb} KB`);

  return { kb: +kb, punktowPo, najwiekszeOdchylenie };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  glowna().catch(e => { console.error('Błąd:', e.message); process.exit(1); });
}

export { uprosc, odchylenie, pole, wWieloboku };
