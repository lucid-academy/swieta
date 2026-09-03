# ETAP 1 — DANE — IX Święto Chełmińskiego Przedmieścia

Czytaj razem z `PROMPT-chelminskie.md`. Ten plik go **uszczegóławia i miejscami
poprawia** — gdzie się rozjeżdżają, obowiązuje ten.

Zatrzymaj się po tym etapie i czekaj na akceptację. Nie rób etapu 2.

---

## Co to za święto (fakty, nie do zgadywania)

| | |
|---|---|
| nazwa | IX Święto Chełmińskiego Przedmieścia (potocznie **Chełmionka**) |
| termin | **niedziela 13 września 2026, 12:00–15:00** — jeden dzień, trzy godziny |
| miejsce | Park przy Toruńskich Wodociągach, ul. Świętego Józefa 37–49 |
| brama wjazdowa | ul. Świętego Józefa, `53.026275, 18.584979` |
| organizator | Stowarzyszenie „Chełmińskie Przedmieście – Tu Mieszkam”, z LGD dla Miasta Torunia / CAL Willa z pasją i Radą Okręgu Chełmińskie |
| finansowanie | głównie Gmina Miasta Toruń; Janasowie Nieruchomości, Admin Nieruchomości, Pres Developer |
| wydarzenie FB | https://fb.me/e/k7p3iUqIe |
| profil FB | https://www.facebook.com/Chelmionka/ |
| program online | https://chelmionka.pl/program-ix-swieta-chelminskiego-przedmiescia/ |
| dostępność | „Wydarzenie dostępne dla wszystkich. Masz pytania o dostępność? Zadzwoń: 500484458” |

## Wsad — `zrodla/chelminskie/`

```
program/  święto chelminskiego.pdf              zaproszenie od organizatorów, linki
          22082026 PROGRAM sceny i wydarzenia.docx   program: scena + strefy
          program IX święto Chelmionki.png       ten sam program jako grafika
          plakat IX święto Chelmionki.png        plakat — z niego bierzemy kategorie
          Namioty 2026.xlsx                      32 namioty: numer, GPS, nazwa, opis
          rozstawienie-namiotow.jpg/.pdf         odręczny szkic rozstawienia
          Brama wjazdowa w dniu święta.png       zrzut z Map Google, brama zakreślona
pocztowki/  sześć pocztówek M. Iwanowskiej-Ludwińskiej (2013)
magnesy/    magnesy z ośmiu poprzednich edycji
wyciag/     zaproszenie.txt, program.txt, namioty.txt  — tekst wyciągnięty z powyższych
            pdftext.mjs, docxtext.mjs, xlsxtext.mjs, pdfimg.mjs — czym go wyciągnięto
```

Na tej maszynie **nie ma Pythona, popplera ani ImageMagicka**. Skrypty
w `wyciag/` to zamiennik: czytają PDF (z ToUnicode CMap), docx i xlsx samym
Node’em, `pdfimg.mjs` wyjmuje z PDF-a osadzone JPEG-i. Do obrazów jest `sharp`
(już w `node_modules`). Jeśli będziesz musiał zajrzeć do któregoś źródła
ponownie — użyj ich, nie instaluj nic nowego.

---

## Czym to święto różni się od Bydgoskiego

To nie jest ta sama robota z inną nazwą. Zmierzone, nie oszacowane:

- **Cały teren ma 130 × 63 m.** Bydgoskie rozciągało się na kilometry.
- **32 namioty stoją średnio 4–6 m od siebie.** 21 par jest bliżej niż 6 m.
  Rozpychanie pinów, które wystarczało na Bydgoskim, tu nie wystarczy.
- **Wszystkie namioty są otwarte całe trzy godziny.** Nie mają godzin.
- **Godziny ma tylko scena** — 16 punktów co ~15 minut, 12:00–15:00.
- **Ulice są bez znaczenia.** Cały teren to jeden ogrodzony park; jedyna ulica,
  która cokolwiek znaczy, to Świętego Józefa z bramą.
- **Planer trasy nie ma czego planować.** Między najdalszymi namiotami w parku
  jest 70 m — 50 sekund marszu. Wzór z Bydgoskiego (`dystans × 1,3 ÷ 80 m/min`)
  przy każdej parze zwróciłby „1 minuta”.

Wniosek dla danych: **jednostką nie jest wydarzenie w czasie, tylko punkt na
planie terenu.** Czas dotyczy wyłącznie sceny i wieży ciśnień.

---

---

## Decyzje, które zapadły — nie podważaj ich

1. **Planer trasy zastępuje zegar święta.** Nie liczymy czasu przejścia.
   Interfejs pokazuje „teraz na scenie / za chwilę”, odlicza do najbliższego
   punktu i wyróżnia dwie rzeczy, które da się przegapić: scenę i wejścia
   na wieżę. Przed świętem odlicza dni. *(Etap 3 — ale dane muszą to unieść
   już teraz, patrz niżej.)*
2. **Kadr mapy obejmuje sam park.** Wieża ciśnień zostaje poza kadrem,
   ze strzałką „130 m na północ” i własną kartą. *(Etap 2 — ale lokalizacja
   musi być oznaczona już teraz.)*
3. **Sekcja pamięci wchodzi**: oś czasu ośmiu magnesów i galeria sześciu
   pocztówek. **Warunkowo — do czasu potwierdzenia zgód nic z tego nie
   publikujemy.** Patrz `pamiec` niżej.
4. **Dwie tury.** Tura pierwsza do **6 września** (bo bilety na wieżę wydają
   7–9 września i informacja musi zdążyć): plan terenu, 32 namioty, scena,
   informacja o biletach. Tura druga do **13 września**: zegar live, sekcja
   pamięci, dopieszczanie.

W tym etapie każda pozycja oznaczona **[tura 2]** może poczekać. Reszta
blokuje pierwszą publikację.

---

## Zadanie

Zbuduj `dane/chelminskie.js` w tym samym schemacie co `dane/bydgoskie.js`
(`window.DANE = {...}` — świadomie `.js`, nie `.json`, żeby działało przez
`file://`). Klucze najwyższego poziomu jak tam, plus jeden nowy:
`swieto, nurty, kategorie, tagi, lokalizacje, wydarzenia, onas, przyjaciele,
luki, pamiec`.

Niczego w silniku na tym etapie nie ruszaj.

### `swieto`

```js
id: 'chelminskie',
nazwa: 'IX Święto Chełmińskiego Przedmieścia',
skrot: 'Święto Chełmionki',
dzielnica: 'Chełmińskie Przedmieście',
dni: [{ id: 'niedziela', nazwa: 'Niedziela', data: '2026-09-13' }],
intro: — pole USUŃ w całości. To święto nie ma własnego wstępu.
```

### `nurty` — tu robią całą robotę

Silnik już umie nurty (na Bydgoskim rozdzielały święto od SUPERfestynu).
Tutaj rozdzielają dwie osie tego samego święta:

```js
{ id: 'scena',  nazwa: 'Scena główna', domyslny: false,
  opis: 'Szesnaście punktów programu, co kwadrans, od 12:00 do 15:00.' }
{ id: 'strefy', nazwa: 'Namioty i strefy', domyslny: true,
  opis: 'Trzydzieści dwa stoiska, wszystkie czynne przez całe święto.' }
```

### `lokalizacje`

Jeden wpis na namiot — **32 wpisy**, plus scena, plus wieża ciśnień.
`id` buduj z numeru i skrótu nazwy, np. `n07-archiwalne`, żeby numer
organizatorów był widoczny w danych.

Dopisz do schematu dwa pola:

- **`numer`** (1–32) — numer z arkusza organizatorów. To on będzie na pinie,
  nie ikona kategorii. Numery są ich własnym językiem: są i w xlsx-ie,
  i na odręcznym szkicu rozstawienia. Scena i wieża numeru nie mają
  — `numer: null`.
- **`pozaKadrem: true`** — tylko dla wieży ciśnień. Kadr mapy obejmuje sam
  park (decyzja 2), więc renderer z etapu 2 musi wiedzieć, że tego punktu
  nie wciąga do bounding boxa, tylko rysuje jako strzałkę z odległością.
  Wszystkie pozostałe: `pozaKadrem: false`. **Nie licz tu nic sam** —
  odległość i azymut wyliczy etap 2 ze współrzędnych.

### `wydarzenia`

Dwa rodzaje wpisów, rozróżniane polem `nurt`:

**A. Scena (`nurt: 'scena'`)** — 16 wpisów z `program.txt`, sekcja
„PROGRAM SCENY”. Każdy: `od` z programu, `do` = `od` następnego punktu
(ostatni, „Uroczyste zakończenie” 15:00, bez `do`). `lokalizacja: 'scena'`.
Prowadzący/wykonawca zostaje w tytule — tak podali.

> Program mówi wprost: *„godziny orientacyjne — jak to na święcie, może nie
> być punktualnie jak w szwajcarskim zegarku”*. **To nie jest notatka
> wewnętrzna, tylko świadomy żart organizatorów — zostaw go** i pokaż
> w interfejsie przy zegarze sceny. On zdejmuje ze strony odpowiedzialność
> za minutową dokładność.

**B. Namioty (`nurt: 'strefy'`)** — 32 wpisy z `namioty.txt`.
`od: '12:00'`, `do: '15:00'` dla wszystkich, **oprócz** namiotu 15
(wieża ciśnień): biletowany i limitowany, trzy wejścia w stałych godzinach.
Nie modeluj tego jako trzech wydarzeń ani nie udawaj, że trwa od 12:15
do 14:15. Jedno wydarzenie, plus nowe pole:

```js
wejscia: ['12:15', '13:15', '14:15']
```

Zegar z etapu 3 czyta tę tablicę wprost. Nie znamy długości zwiedzania
— nie zgaduj jej.

Opis bierz z kolumny D arkusza (pełny, nieskrócony), tytuł z kolumny C.
Kolumna C bywa całym zdaniem — skróć na `tytul`, resztę zostaw w `opis`.

Wiersze 33 i 34 arkusza (**Organizatorzy**, **Podziękowania dla Wszystkich
Partnerów**) nie są namiotami i nie mają współrzędnych. Idą do `onas`
i `przyjaciele`, nie do `wydarzenia`.

---

## Współrzędne — tym razem inaczej niż na Bydgoskim

**Sekcja o rozwijaniu `maps.app.goo.gl` i parze `!3d!4d` z `PROMPT-chelminskie.md`
jest tu bezprzedmiotowa. Nie rozwijaj żadnych linków, nie geokoduj z adresu.**
Organizatorzy podali w arkuszu **32 gotowe pary dziesiętne**, kolumna B.
Bierz je wprost.

Co masz z nimi zrobić:

1. **Sanity check zakresu.** Wszystkie 32 mają wpaść w prostokąt
   `53.0258–53.0270 × 18.5839–18.5850`. Cokolwiek wypadnie poza — zgłoś.
2. **Reverse geocoding zostaje**, ale jako kontrola, nie jako źródło.
   Przy 4-metrowych odstępach OSM zwróci dla większości tę samą nazwę
   (park / Stacja pomp Stare Bielany) — to jest oczekiwane i nie jest błędem.
   Wpisz wynik do `zrodloGps` uczciwie: *„arkusz organizatorów Namioty 2026,
   wiersz N; reverse geocoding OSM: …”*.
3. **Znany błąd do zgłoszenia, nie do naprawienia po cichu:**
   namiot **#5 (Pasieka Bzyk)** i namiot **#25 (Stoisko Dobrej Fundacji)**
   mają **identyczne** współrzędne `53.025939, 18.584789`. Odręczny szkic
   pokazuje je jako dwie osobne kratki. Jedna z tych par jest przekopiowana.
   Zostaw obie jak są, oznacz **obie** `przyblizone: true` i wpisz do `luki`.
   Nie zgaduj, która jest prawdziwa.
4. **Namiot #15 (wieża ciśnień) leży 130 m na północ od reszty.** To nie jest
   błąd — wieża naprawdę tam stoi (OSM: `man_made=water_tower`). Ale sam
   rozciąga kadr mapy dwukrotnie. Zostaw współrzędne, dopisz komentarz,
   że etap 2 musi się z tym zmierzyć.
5. **Adres w zaproszeniu (37–49) a adres bramy z Map Google (46–50)
   nie są sprzeczne.** OSM potwierdza: `Stacja pomp Stare Bielany`,
   `addr:street=Świętego Józefa`, `addr:housenumber=37-49`, operator
   Toruńskie Wodociągi. 37–49 to adres terenu, 46–50 to numeracja przy bramie.
   W danych podaj **37–49** jako adres święta i osobno bramę jako punkt wejścia.

---

## Kategorie

> **POPRAWKA po wykonaniu etapu (3 września).** Pierwotnie miały to być
> kategorie z plakatu. Przy realnym przypisaniu wszystkich 32 stoisk okazało
> się, że plakatowa szóstka jest hasłem promocyjnym, a nie taksonomią:
> zdrowie, ekologia, informacja i sport nie mają w niej miejsca, więc
> kilkanaście stoisk wpadłoby do „atrakcji” jako do śmietnika.
>
> **Kolorem pinu sterują strefy z programu** — pięć stref plus scena pokrywa
> wszystkie 32 stoiska bez reszty, bo organizatorzy zbudowali je dokładnie
> pod ten zestaw. Plakatowa szóstka ikon została użyta tam, gdzie jest
> naprawdę dobra: jako **język obrazkowy na poziomie pojedynczego stoiska**,
> przez pole `ikona`. Poniższa tabela zostaje jako zapis tego, skąd wzięły
> się ikony.

Plakat ma pas sześciu ikon z podpisami — to ich własny język obrazkowy:

| id | nazwa (dokładnie z plakatu) | ikona na plakacie |
|---|---|---|
| `muzyka` | Muzyka | nuty |
| `jedzenie` | Jedzenie | talerz ze sztućcami |
| `konkursy` | Konkursy dla dzieci | puchar |
| `sasiedzkie` | Spotkania sąsiedzkie | dwie postaci z dymkami |
| `atrakcje` | Atrakcje | balony |
| `historia` | Spotkania z historią | stos książek |

Kolory dobierz z palety plakatu (ciepły brąz na kremowym papierze), ale
**zmierz kontrast**, nie oceniaj okiem — próg 3,5:1 wobec tła mapy.
Na Bydgoskim ochra miała 2,33 i ginęła.

Uwaga: na pinie ma być **numer**, więc kontrast liczysz dla **cyfry na
wypełnieniu pinu**, a nie dla samego pinu wobec papieru. To inna miara.

### Strefy ≠ obszary na mapie

Program dzieli namioty na pięć stref: Rodzinna, Zdrowia i Rekreacji, Kultury
i Historii, Natury i Edukacji, Informacji. **Sprawdziłem — one nie są ciągłe
przestrzennie.** Straż Miejska ze „Strefy informacji” stoi 50 m od reszty tej
strefy, po drugiej stronie łąki. Zapisz strefę jako pole przy lokalizacji
(`strefa: 'informacji'`) i użyj jej do filtrowania — ale **nie rysuj stref
jako obszarów na mapie**, bo to byłby fałsz.

### Tagi

Nie przyjmuj listy z góry. Wyprowadź z treści 32 opisów i pokaż do
zatwierdzenia. Kandydaci, którzy sami się narzucają po lekturze: `bezpłatne`,
`dla dzieci`, `weź udział`, `do zjedzenia`, `zapisy`, `dla seniorów`,
`limitowane`. Brak tagu znaczy „nie wiemy”, nie „nie dotyczy”.

---

## `pamiec` — dziewięć edycji **[tura 2]**

To święto ma coś, czego Bydgoskie nie miało: własną pamięć. Osiem magnesów
(po jednym na edycję) i sześć pocztówek Małgorzaty Iwanowskiej-Ludwińskiej
z 2013 roku. Wszystko leży w `zrodla/chelminskie/magnesy/` i `.../pocztowki/`.

Nowy klucz najwyższego poziomu:

```js
pamiec: {
  zgoda: null,          // dopóki null — sekcja NIE renderuje się w ogóle
  wstep: '…',
  magnesy:   [ { rok: 2018, edycja: 'I',  tytul: '…', plik: 'img/pamiec/…', opis: null }, … ],
  pocztowki: [ { tytul: '…', autor: 'Małgorzata Iwanowska-Ludwińska',
                 rok: 2013, plik: 'img/pamiec/…', podpis: null }, … ]
}
```

**Blokada jest celowa.** Pocztówki są sygnowane przez autorkę, magnesy należą
do stowarzyszenia. Dopóki `zgoda` jest `null`, silnik ma tej sekcji nie
pokazywać — tak samo jak `intro` znika po usunięciu pola. Nie obchodź tego
i nie wstawiaj tam `true` „na próbę”.

Czego **nie** rób na tym etapie:
- nie przetwarzaj obrazów (to `tools/zdjecia.js`, po decyzji o zgodach),
- nie odczytuj odręcznych podpisów z pocztówek — są pisane ołówkiem
  i częściowo nieczytelne. `podpis: null` i pytanie do organizatorów.
  Zgadnięty tytuł cudzej pracy to gorszy błąd niż jego brak.

Datowanie magnesów wyprowadź z nazw plików i z samych grafik (rok bywa
wydrukowany na magnesie). Gdzie się nie zgadza — `rok: null` i do `luki`.

---

## Co wyciąć, a czego nie — pokaż listę, zanim usuniesz

Przeczesałem materiały pod kątem notatek wewnętrznych. **Nie ma tu
odpowiednika urlopu przy warsztatach cyrkowych ani uwagi o pożarach
z Bydgoskiego** — arkusz jest pisany od razu pod czytelnika. Do rozstrzygnięcia
są dwa fragmenty i jedna lista literówek:

1. **Namiot #9 (informacyjny), ostatni akapit** — instrukcja dla załogi:
   *„A jeśli jesteś wolontariuszem i akurat nie masz przydzielonego zadania,
   koniecznie zajrzyj do namiotu informacyjnego. Nasi koordynatorzy z pewnością
   znajdą dla Ciebie zajęcie…”*. Adresat to wolontariusz, nie odwiedzający.
   **Nie usuwaj sam — pokaż i zapytaj.**
2. **Namiot #32 (Budżet Obywatelski), ostatnie zdanie** — *„W szczególności
   zachęcamy do głosowania na 10 Święto Chełmińskiego Przemieścia: CH0626
   Chełmińskie”*. To nie notatka wewnętrzna, tylko agitacja w głosowaniu BO
   (trwa 7–20 września 2026). Publikacja tego pod szyldem fundacji jest
   decyzją, nie automatem. **Pokaż i zapytaj.**
3. **Literówki w arkuszu:** „Sasiedzkie”, „przypomiec”, „Kujawsko-Pomorskirej”,
   „Storisko”, „Strazy”, „Urządu”, „pametajcie”, „wjście”, „Przemieścia”,
   „zagłosowac”, „Bike Caffee”, „Food Track”, „**AQUA**” (gwiazdki
   z Markdowna). **Nie poprawiaj po cichu.** Zbierz listę, pokaż, i dopiero
   po decyzji popraw — z komentarzem obok, żeby nikt tego nie „naprawił”
   z powrotem do wersji ze źródła.

---

## `luki` — czego jeszcze nie wiemy

Ta sekcja jest funkcją, nie wstydem. Na dziś wchodzą do niej co najmniej:

- Namioty #5 i #25 mają tę samą współrzędną — jeden z pinów stoi w złym miejscu.
- Bilety na wieżę ciśnień wydawane były **7–9 września**, w CAL Willa z pasją,
  ul. Grunwaldzka 38. **Kto czyta to w dniu święta, już ich nie dostanie.**
  Napisz to wprost, nie chowaj w opisie.
- Namiot #27 (Małe Muzeum Historii Edycji Pana Tadeusza) **nie ma opisu**
  — kolumna D pusta.
- Godziny sceny są orientacyjne z woli organizatorów.
- Program nie podaje, gdzie są toalety, i nie mówi nic o parkowaniu.

---

## Czego nie robić

- **Nie zgaduj współrzędnych.** Nie ma takiej potrzeby — są wszystkie.
- **Nie wymyślaj opisów.** #27 nie ma opisu i ma go nie mieć.
- **Nie zbieraj treści przez Facebooka** — blokuje pobieranie (400).
  Linki do wydarzenia zostawiamy jako linki.
- **Nie edytuj `dane/chelminskie.js` ręcznie bez `node tools/sprawdz.js`.**
  To JavaScript; apostrof w polskim tekście gasi całą stronę bez komunikatu,
  a w tych opisach apostrofów i cudzysłowów jest sporo („”, ‑, •, 🌿).
- **Nie ruszaj `index.html` ani `tools/`** na tym etapie.

---

## Co oddać na koniec etapu

1. `dane/chelminskie.js` — przechodzące `node tools/sprawdz.js --swieto chelminskie`.
2. **Lista 32 namiotów + 16 punktów sceny** z lokalizacją, współrzędną,
   kategorią, strefą i tagami — w formie do przejrzenia okiem, nie jako plik JS.
3. **Osobno: lista współrzędnych do weryfikacji przez organizatorów** —
   ta z #5/#25 na czele.
4. **Osobno: lista fragmentów do wycięcia lub poprawienia** (te trzy punkty
   wyżej), z cytatem i propozycją, ale bez wprowadzania zmian.
5. Propozycja zestawu tagów, do zatwierdzenia.
6. Zatrzymanie się i czekanie. Commit dopiero po akceptacji.

Punkty 1–5 są potrzebne do tury pierwszej. `pamiec` może przyjść później,
ale **struktura klucza ma powstać od razu**, z `zgoda: null` — żeby etap 3
nie musiał wracać do danych.

## Termin

Tura pierwsza ma stać **6 września**. Święto jest 13 września, ale bilety
na wieżę wydają 7–9 września — informacja, która pojawi się później,
jest martwa. To jest powód terminu, nie widzimisię. Jeśli coś ma nie zdążyć,
powiedz o tym od razu, a nie w przeddzień.
