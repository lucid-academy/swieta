/* IX Święto Chełmińskiego Przedmieścia (Chełmionka) — dane wydarzenia.
   Niedziela 13 września 2026, 12:00-15:00, Park przy Toruńskich Wodociągach.

   Świadomie .js zamiast .json, żeby strona działała otwarta z dysku (file://).

   Źródła treści:
     zrodla/chelminskie/program/Namioty 2026.xlsx            — 32 stoiska, opisy, GPS
     zrodla/chelminskie/program/22082026 PROGRAM sceny...docx — 15 punktów sceny
     zrodla/chelminskie/program/plakat IX święto Chelmionki.png
     zrodla/chelminskie/program/rozstawienie-namiotow.jpg    — odręczny szkic

   Współrzędne: podane wprost przez organizatorów w arkuszu, para dziesiętna
   na stoisko. NIC tu nie jest geokodowane ani zgadnięte. Pole `zrodloGps`
   przy każdej lokalizacji mówi, skąd się wzięła i czy była ruszana.

   Czym to święto różni się od Bydgoskiego — i dlaczego dane wyglądają inaczej:
   cały teren ma 130 x 63 m, trwa trzy godziny, a wszystkie stoiska są otwarte
   przez cały ten czas. Godziny ma tylko scena i wieża ciśnień. Dlatego
   jednostką nie jest wydarzenie w czasie, tylko punkt na planie terenu,
   a pin niesie NUMER organizatorów (pole `numer`), nie ikonę kategorii.

   Plik wygenerowany raz przez zrodla/chelminskie/wyciag/buduj-dane.mjs,
   dalej utrzymywany ręcznie. Przed każdą publikacją:
       node tools/sprawdz.js --swieto chelminskie
*/

window.DANE = {

  swieto: {
    id: 'chelminskie',
    nazwa: 'IX Święto Chełmińskiego Przedmieścia',
    skrot: 'Święto Chełmionki',
    miasto: 'Toruń',
    dzielnica: 'Chełmińskie Przedmieście',
    stopka: 'Zrealizowano dzięki wsparciu Gminy Miasta Toruń',
    dni: [
      { id: 'niedziela', nazwa: 'Niedziela', data: '2026-09-13' }
    ],

    /* Adres i wejście. Zaproszenie podaje 37-49, zrzut z Map Google przy
       bramie pokazuje 46-50 — to nie jest sprzeczność. OSM potwierdza
       `Stacja pomp Stare Bielany`, addr:housenumber=37-49, operator
       Toruńskie Wodociągi: 37-49 to adres terenu, 46-50 numeracja przy bramie. */
    adres: 'Park przy Toruńskich Wodociągach, ul. Świętego Józefa 37-49',
    godziny: '12:00-15:00',
    wejscie: 'brama',
    dostepnosc: 'Wydarzenie dostępne dla wszystkich. Masz pytania o dostępność? Zadzwoń: 500 484 458',

    /* ETAP 2 — geometria i proporcje mapy. */
    mapa: { plik: null, szerokosc: null, wysokosc: null },

    /* Intro świadomie usunięte — to święto nie ma własnego wstępu,
       a brak pola `intro` wyłącza je w całości. */

    licznik: {
      kod: null,
      domena: 'lucid-academy.github.io',
      nota: 'Zliczamy anonimowe odsłony — bez ciasteczek i bez danych osobowych.'
    }
  },

  /* NURTY — dwie osie tego samego święta. Scena ma godziny, stoiska nie. */
  nurty: [
    { id: 'strefy', nazwa: 'Namioty i strefy', domyslny: true,
      opis: 'Trzydzieści dwa stoiska, wszystkie czynne od 12:00 do 15:00. Nie trzeba nic planować — wystarczy przyjść.' },
    { id: 'scena', nazwa: 'Scena główna', domyslny: false,
      opis: 'Piętnaście punktów programu, mniej więcej co kwadrans. Organizatorzy uprzedzają: godziny są orientacyjne, jak to na święcie.' }
  ],

  /* KATEGORIE = STREFY z programu organizatorów.
     Sześć wartości pokrywa wszystkie 32 stoiska plus scenę, bez kategorii-śmietnika.
     Zestaw sześciu ikon z plakatu (nuty, talerz, puchar, dwie postaci, balony,
     książki) jest lepszym językiem obrazkowym, ale nie taksonomią — trafia więc
     na poziom pojedynczego stoiska, przez pole `ikona`.

     Kolory zmierzone, nie ocenione okiem. Dwa progi, bo pin niesie białą cyfrę:
       biały tekst na wypełnieniu >= 4,5:1
       wypełnienie wobec papieru mapy (#EBD9B7) >= 3,5:1
     Pierwszy kandydat na strefę rodzinną (#B25E12) miał 3,36 wobec papieru
     i wypadł — ta sama pułapka co ochra na Bydgoskim. */
  kategorie: [
    { id: 'scena',      nazwa: 'Scena główna',        kolor: '#A8382C', ikona: 'nuta' },      // 6,43 / 4,63
    { id: 'rodzinna',   nazwa: 'Strefa rodzinna',     kolor: '#A5540E', ikona: 'latawiec' }, // 5,42 / 3,91
    { id: 'zdrowie',    nazwa: 'Zdrowie i rekreacja', kolor: '#2F6B92', ikona: 'kula' },     // 5,77 / 4,16
    { id: 'kultura',    nazwa: 'Kultura i historia',  kolor: '#6B4489', ikona: 'dom' },      // 7,46 / 5,38
    { id: 'natura',     nazwa: 'Natura i edukacja',   kolor: '#3B7A46', ikona: 'nozyce' },   // 5,17 / 3,73
    { id: 'informacja', nazwa: 'Informacja',          kolor: '#55503C', ikona: 'punkt' }     // 8,08 / 5,83
  ],

  /* TAGI wyprowadzone z treści 32 opisów, nie z listy narzuconej z góry.
     Brak tagu znaczy „nie wiemy", nie „nie dotyczy".

     Był tu jeszcze tag „Dla seniorów", ale trafiał tylko na dwa stoiska
     (CAL Willa z pasją i Rada Seniorów) — dokładnie ten sam przypadek co
     „z psem" na Bydgoskim. Filtr, który zawsze pokazuje dwie pozycje,
     jest gorszy niż jego brak. Wypadł. */
  tagi: [
    { id: 'dla-dzieci',   nazwa: 'Dla dzieci',    opis: 'Opis wprost wymienia dzieci albo najmłodszych.' },
    { id: 'wez-udzial',   nazwa: 'Weź udział',    opis: 'Coś się robi, nie tylko ogląda: warsztat, quiz, badanie, wspólne kolorowanie.' },
    { id: 'zapisy',       nazwa: 'Zapisy lub bilet', opis: 'Trzeba się zapisać albo mieć bilet odebrany wcześniej.' },
    { id: 'do-zjedzenia', nazwa: 'Do zjedzenia',  opis: 'Będzie co zjeść albo wypić.' },
    { id: 'platne',       nazwa: 'Za opłatą',     opis: 'Opis mówi o możliwości zakupu. Reszta stoisk jest bezpłatna.' }
  ],

  lokalizacje: [
    {
      "id": "scena",
      "nazwa": "Scena główna",
      "adres": "Park przy Toruńskich Wodociągach, ul. Świętego Józefa 37-49",
      "numer": null,
      "strefa": "scena",
      "gps": {
        "lat": 53.02583,
        "lng": 18.58456
      },
      "zrodloGps": "odręczny szkic rozstawienia — scena zamyka teren od południa, między namiotem TKKF (#21) a wodopojem (#23); współrzędna przybliżona, do potwierdzenia w etapie 2 na geometrii OSM",
      "przyblizone": true,
      "pozaKadrem": false,
      "mapa": null
    },
    {
      "id": "brama",
      "nazwa": "Brama wjazdowa",
      "adres": "ul. Świętego Józefa",
      "numer": null,
      "strefa": "informacja",
      "gps": {
        "lat": 53.026275,
        "lng": 18.584979
      },
      "zrodloGps": "zrzut z Map Google od organizatorów („Brama wjazdowa w dniu święta.png”), pinezka 53.026275, 18.584979; OSM potwierdza w tym miejscu barrier=gate przy ul. Świętego Józefa",
      "przyblizone": false,
      "pozaKadrem": false,
      "mapa": null
    },
    {
      "id": "n01-animacje",
      "nazwa": "Animacje z harcerzami i wolontariuszami",
      "adres": "Park przy Toruńskich Wodociągach, ul. Świętego Józefa 37-49",
      "numer": 1,
      "strefa": "rodzinna",
      "gps": {
        "lat": 53.026045,
        "lng": 18.584397
      },
      "zrodloGps": "arkusz organizatorów „Namioty 2026”, wiersz 2, kolumna B (53.026045, 18.584397)",
      "przyblizone": false,
      "pozaKadrem": false,
      "mapa": null
    },
    {
      "id": "n02-dmuchance",
      "nazwa": "Dmuchańce",
      "adres": "Park przy Toruńskich Wodociągach, ul. Świętego Józefa 37-49",
      "numer": 2,
      "strefa": "rodzinna",
      "gps": {
        "lat": 53.026308,
        "lng": 18.584204
      },
      "zrodloGps": "arkusz organizatorów „Namioty 2026”, wiersz 3, kolumna B (53.026308, 18.584204)",
      "przyblizone": false,
      "pozaKadrem": false,
      "mapa": null
    },
    {
      "id": "n03-willa",
      "nazwa": "Warsztaty artystyczne — CAL Willa z pasją",
      "adres": "Park przy Toruńskich Wodociągach, ul. Świętego Józefa 37-49",
      "numer": 3,
      "strefa": "rodzinna",
      "gps": {
        "lat": 53.025975,
        "lng": 18.584813
      },
      "zrodloGps": "arkusz organizatorów „Namioty 2026”, wiersz 4, kolumna B (53.025975, 18.584813)",
      "przyblizone": false,
      "pozaKadrem": false,
      "mapa": null
    },
    {
      "id": "n04-biblioteki",
      "nazwa": "Biblioteki Chełmionka i Lelewela",
      "adres": "Park przy Toruńskich Wodociągach, ul. Świętego Józefa 37-49",
      "numer": 4,
      "strefa": "kultura",
      "gps": {
        "lat": 53.026104,
        "lng": 18.584877
      },
      "zrodloGps": "arkusz organizatorów „Namioty 2026”, wiersz 5, kolumna B (53.026104, 18.584877)",
      "przyblizone": false,
      "pozaKadrem": false,
      "mapa": null
    },
    {
      "id": "n05-pasieka",
      "nazwa": "Pasieka Bzyk — Pszczele laboratorium",
      "adres": "Park przy Toruńskich Wodociągach, ul. Świętego Józefa 37-49",
      "numer": 5,
      "strefa": "natura",
      "gps": {
        "lat": 53.025928,
        "lng": 18.584786
      },
      "zrodloGps": "arkusz organizatorów „Namioty 2026” podawał dla stoisk 5 i 25 tę samą parę 53.025939, 18.584789 — organizatorzy potwierdzili, że stoiska stoją obok siebie i była to pomyłka przy klikaniu. Odręczny szkic daje kolejność w rzędzie: CAL, Bardzo Dobra Fundacja, Pszczółki, Tilia. Pin postawiony na odcinku między namiotem 3 a 30; przesunięcie jest nasze, nie organizatorów",
      "przyblizone": true,
      "pozaKadrem": false,
      "mapa": null
    },
    {
      "id": "n06-wystawa",
      "nazwa": "Wystawa „Przywróćmy Pamięć o Chełmionce”",
      "adres": "Park przy Toruńskich Wodociągach, ul. Świętego Józefa 37-49",
      "numer": 6,
      "strefa": "kultura",
      "gps": {
        "lat": 53.026249,
        "lng": 18.584468
      },
      "zrodloGps": "arkusz organizatorów „Namioty 2026”, wiersz 7, kolumna B (53.026249, 18.584468)",
      "przyblizone": false,
      "pozaKadrem": false,
      "mapa": null
    },
    {
      "id": "n07-archiwalne",
      "nazwa": "Chełmionka — Sąsiedzkie Spotkania Archiwalne",
      "adres": "Park przy Toruńskich Wodociągach, ul. Świętego Józefa 37-49",
      "numer": 7,
      "strefa": "kultura",
      "gps": {
        "lat": 53.02628,
        "lng": 18.584618
      },
      "zrodloGps": "arkusz organizatorów „Namioty 2026”, wiersz 8, kolumna B (53.026280, 18.584618)",
      "przyblizone": false,
      "pozaKadrem": false,
      "mapa": null
    },
    {
      "id": "n08-tu-mieszkam",
      "nazwa": "Chełmionka — tu mieszkam, tu działam",
      "adres": "Park przy Toruńskich Wodociągach, ul. Świętego Józefa 37-49",
      "numer": 8,
      "strefa": "kultura",
      "gps": {
        "lat": 53.026294,
        "lng": 18.584535
      },
      "zrodloGps": "arkusz organizatorów „Namioty 2026”, wiersz 9, kolumna B (53.026294, 18.584535)",
      "przyblizone": false,
      "pozaKadrem": false,
      "mapa": null
    },
    {
      "id": "n09-informacja",
      "nazwa": "Namiot informacyjny święta",
      "adres": "Park przy Toruńskich Wodociągach, ul. Świętego Józefa 37-49",
      "numer": 9,
      "strefa": "informacja",
      "gps": {
        "lat": 53.026264,
        "lng": 18.584685
      },
      "zrodloGps": "arkusz organizatorów „Namioty 2026”, wiersz 10, kolumna B (53.026264, 18.584685)",
      "przyblizone": false,
      "pozaKadrem": false,
      "mapa": null
    },
    {
      "id": "n10-rada-okregu",
      "nazwa": "Rada Okręgu „Chełmińskie” — quiz o Chełmionce",
      "adres": "Park przy Toruńskich Wodociągach, ul. Świętego Józefa 37-49",
      "numer": 10,
      "strefa": "informacja",
      "gps": {
        "lat": 53.026246,
        "lng": 18.584769
      },
      "zrodloGps": "arkusz organizatorów „Namioty 2026”, wiersz 11, kolumna B (53.026246, 18.584769)",
      "przyblizone": false,
      "pozaKadrem": false,
      "mapa": null
    },
    {
      "id": "n11-neuca",
      "nazwa": "Namiot profilaktyczny NEUCA i PharmaHelp",
      "adres": "Park przy Toruńskich Wodociągach, ul. Świętego Józefa 37-49",
      "numer": 11,
      "strefa": "zdrowie",
      "gps": {
        "lat": 53.026422,
        "lng": 18.584498
      },
      "zrodloGps": "arkusz organizatorów „Namioty 2026”, wiersz 12, kolumna B (53.026422, 18.584498)",
      "przyblizone": false,
      "pozaKadrem": false,
      "mapa": null
    },
    {
      "id": "n12-swiat-zdrowia",
      "nazwa": "Fundacja Świat Zdrowia",
      "adres": "Park przy Toruńskich Wodociągach, ul. Świętego Józefa 37-49",
      "numer": 12,
      "strefa": "zdrowie",
      "gps": {
        "lat": 53.026388,
        "lng": 18.584482
      },
      "zrodloGps": "arkusz organizatorów „Namioty 2026”, wiersz 13, kolumna B (53.026388, 18.584482)",
      "przyblizone": false,
      "pozaKadrem": false,
      "mapa": null
    },
    {
      "id": "n13-kapiel-lesna",
      "nazwa": "Kąpiel leśna",
      "adres": "Park przy Toruńskich Wodociągach, ul. Świętego Józefa 37-49",
      "numer": 13,
      "strefa": "natura",
      "gps": {
        "lat": 53.026052,
        "lng": 18.584861
      },
      "zrodloGps": "arkusz organizatorów „Namioty 2026”, wiersz 14, kolumna B (53.026052, 18.584861)",
      "przyblizone": false,
      "pozaKadrem": false,
      "mapa": null
    },
    {
      "id": "n14-autodrom",
      "nazwa": "Autodrom",
      "adres": "Park przy Toruńskich Wodociągach, ul. Świętego Józefa 37-49",
      "numer": 14,
      "strefa": "rodzinna",
      "gps": {
        "lat": 53.026369,
        "lng": 18.583984
      },
      "zrodloGps": "arkusz organizatorów „Namioty 2026”, wiersz 15, kolumna B (53.026369, 18.583984)",
      "przyblizone": false,
      "pozaKadrem": false,
      "mapa": null
    },
    {
      "id": "n15-wieza",
      "nazwa": "Wieża ciśnień i Muzeum Wodociągów",
      "adres": "Park przy Toruńskich Wodociągach, ul. Świętego Józefa 37-49",
      "numer": 15,
      "strefa": "kultura",
      "gps": {
        "lat": 53.026972,
        "lng": 18.58422
      },
      "zrodloGps": "arkusz organizatorów „Namioty 2026”, wiersz 16, kolumna B (53.026972, 18.584220)",
      "przyblizone": false,
      "pozaKadrem": true,
      "mapa": null
    },
    {
      "id": "n16-pup",
      "nazwa": "Powiatowy Urząd Pracy",
      "adres": "Park przy Toruńskich Wodociągach, ul. Świętego Józefa 37-49",
      "numer": 16,
      "strefa": "informacja",
      "gps": {
        "lat": 53.026138,
        "lng": 18.584896
      },
      "zrodloGps": "arkusz organizatorów „Namioty 2026”, wiersz 17, kolumna B (53.026138, 18.584896)",
      "przyblizone": false,
      "pozaKadrem": false,
      "mapa": null
    },
    {
      "id": "n17-mpo",
      "nazwa": "MPO — edukacja ekologiczna",
      "adres": "Park przy Toruńskich Wodociągach, ul. Świętego Józefa 37-49",
      "numer": 17,
      "strefa": "natura",
      "gps": {
        "lat": 53.025939,
        "lng": 18.584338
      },
      "zrodloGps": "arkusz organizatorów „Namioty 2026”, wiersz 18, kolumna B (53.025939, 18.584338)",
      "przyblizone": false,
      "pozaKadrem": false,
      "mapa": null
    },
    {
      "id": "n18-adwokaci",
      "nazwa": "Kujawsko-Pomorska Izba Adwokacka",
      "adres": "Park przy Toruńskich Wodociągach, ul. Świętego Józefa 37-49",
      "numer": 18,
      "strefa": "informacja",
      "gps": {
        "lat": 53.026172,
        "lng": 18.584904
      },
      "zrodloGps": "arkusz organizatorów „Namioty 2026”, wiersz 19, kolumna B (53.026172, 18.584904)",
      "przyblizone": false,
      "pozaKadrem": false,
      "mapa": null
    },
    {
      "id": "n19-straz",
      "nazwa": "Straż Miejska",
      "adres": "Park przy Toruńskich Wodociągach, ul. Świętego Józefa 37-49",
      "numer": 19,
      "strefa": "informacja",
      "gps": {
        "lat": 53.025992,
        "lng": 18.584371
      },
      "zrodloGps": "arkusz organizatorów „Namioty 2026”, wiersz 20, kolumna B (53.025992, 18.584371)",
      "przyblizone": false,
      "pozaKadrem": false,
      "mapa": null
    },
    {
      "id": "n20-gramy",
      "nazwa": "3-2-1 Gramy — animacje sportowe",
      "adres": "Park przy Toruńskich Wodociągach, ul. Świętego Józefa 37-49",
      "numer": 20,
      "strefa": "zdrowie",
      "gps": {
        "lat": 53.025855,
        "lng": 18.584754
      },
      "zrodloGps": "arkusz organizatorów „Namioty 2026”, wiersz 21, kolumna B (53.025855, 18.584754)",
      "przyblizone": false,
      "pozaKadrem": false,
      "mapa": null
    },
    {
      "id": "n21-tkkf",
      "nazwa": "TKKF — sport i rekreacja",
      "adres": "Park przy Toruńskich Wodociągach, ul. Świętego Józefa 37-49",
      "numer": 21,
      "strefa": "zdrowie",
      "gps": {
        "lat": 53.025802,
        "lng": 18.58473
      },
      "zrodloGps": "arkusz organizatorów „Namioty 2026”, wiersz 22, kolumna B (53.025802, 18.584730)",
      "przyblizone": false,
      "pozaKadrem": false,
      "mapa": null
    },
    {
      "id": "n22-pomorzanin",
      "nazwa": "KS Pomorzanin Toruń",
      "adres": "Park przy Toruńskich Wodociągach, ul. Świętego Józefa 37-49",
      "numer": 22,
      "strefa": "zdrowie",
      "gps": {
        "lat": 53.026456,
        "lng": 18.584236
      },
      "zrodloGps": "arkusz organizatorów „Namioty 2026”, wiersz 23, kolumna B (53.026456, 18.584236)",
      "przyblizone": false,
      "pozaKadrem": false,
      "mapa": null
    },
    {
      "id": "n23-wodopoj",
      "nazwa": "Wodopój Toruńskich Wodociągów",
      "adres": "Park przy Toruńskich Wodociągach, ul. Świętego Józefa 37-49",
      "numer": 23,
      "strefa": "rodzinna",
      "gps": {
        "lat": 53.025862,
        "lng": 18.584142
      },
      "zrodloGps": "arkusz organizatorów „Namioty 2026”, wiersz 24, kolumna B (53.025862, 18.584142)",
      "przyblizone": false,
      "pozaKadrem": false,
      "mapa": null
    },
    {
      "id": "n24-seniorzy",
      "nazwa": "Rada Seniorów przy Prezydencie Miasta",
      "adres": "Park przy Toruńskich Wodociągach, ul. Świętego Józefa 37-49",
      "numer": 24,
      "strefa": "informacja",
      "gps": {
        "lat": 53.02622,
        "lng": 18.584925
      },
      "zrodloGps": "arkusz organizatorów „Namioty 2026”, wiersz 25, kolumna B (53.026220, 18.584925)",
      "przyblizone": false,
      "pozaKadrem": false,
      "mapa": null
    },
    {
      "id": "n25-dobra-fundacja",
      "nazwa": "Dobra Fundacja — stoisko z zabawkami",
      "adres": "Park przy Toruńskich Wodociągach, ul. Świętego Józefa 37-49",
      "numer": 25,
      "strefa": "rodzinna",
      "gps": {
        "lat": 53.025951,
        "lng": 18.5848
      },
      "zrodloGps": "arkusz organizatorów „Namioty 2026” podawał dla stoisk 5 i 25 tę samą parę 53.025939, 18.584789 — organizatorzy potwierdzili, że stoiska stoją obok siebie i była to pomyłka przy klikaniu. Odręczny szkic daje kolejność w rzędzie: CAL, Bardzo Dobra Fundacja, Pszczółki, Tilia. Pin postawiony na odcinku między namiotem 3 a 30; przesunięcie jest nasze, nie organizatorów",
      "przyblizone": true,
      "pozaKadrem": false,
      "mapa": null
    },
    {
      "id": "n26-bikecafe",
      "nazwa": "BikeCafe",
      "adres": "Park przy Toruńskich Wodociągach, ul. Świętego Józefa 37-49",
      "numer": 26,
      "strefa": "rodzinna",
      "gps": {
        "lat": 53.025962,
        "lng": 18.584188
      },
      "zrodloGps": "arkusz organizatorów „Namioty 2026”, wiersz 27, kolumna B (53.025962, 18.584188)",
      "przyblizone": false,
      "pozaKadrem": false,
      "mapa": null
    },
    {
      "id": "n27-pan-tadeusz",
      "nazwa": "Małe Muzeum Historii Edycji Pana Tadeusza",
      "adres": "Park przy Toruńskich Wodociągach, ul. Świętego Józefa 37-49",
      "numer": 27,
      "strefa": "kultura",
      "gps": {
        "lat": 53.026068,
        "lng": 18.584872
      },
      "zrodloGps": "arkusz organizatorów „Namioty 2026”, wiersz 28, kolumna B (53.026068, 18.584872)",
      "przyblizone": false,
      "pozaKadrem": false,
      "mapa": null
    },
    {
      "id": "n28-bractwo",
      "nazwa": "Bractwo św. Jakuba Apostoła",
      "adres": "Park przy Toruńskich Wodociągach, ul. Świętego Józefa 37-49",
      "numer": 28,
      "strefa": "informacja",
      "gps": {
        "lat": 53.026201,
        "lng": 18.584917
      },
      "zrodloGps": "arkusz organizatorów „Namioty 2026”, wiersz 29, kolumna B (53.026201, 18.584917)",
      "przyblizone": false,
      "pozaKadrem": false,
      "mapa": null
    },
    {
      "id": "n29-food-trucki",
      "nazwa": "Food trucki",
      "adres": "Park przy Toruńskich Wodociągach, ul. Świętego Józefa 37-49",
      "numer": 29,
      "strefa": "rodzinna",
      "gps": {
        "lat": 53.025894,
        "lng": 18.584156
      },
      "zrodloGps": "arkusz organizatorów „Namioty 2026”, wiersz 30, kolumna B (53.025894, 18.584156)",
      "przyblizone": false,
      "pozaKadrem": false,
      "mapa": null
    },
    {
      "id": "n30-tilia",
      "nazwa": "Szkoła Leśna na Barbarce i Tilia",
      "adres": "Park przy Toruńskich Wodociągach, ul. Świętego Józefa 37-49",
      "numer": 30,
      "strefa": "natura",
      "gps": {
        "lat": 53.025904,
        "lng": 18.584773
      },
      "zrodloGps": "arkusz organizatorów „Namioty 2026”, wiersz 31, kolumna B (53.025904, 18.584773)",
      "przyblizone": false,
      "pozaKadrem": false,
      "mapa": null
    },
    {
      "id": "n31-lody",
      "nazwa": "Lody Lenkiewicz",
      "adres": "Park przy Toruńskich Wodociągach, ul. Świętego Józefa 37-49",
      "numer": 31,
      "strefa": "rodzinna",
      "gps": {
        "lat": 53.025923,
        "lng": 18.584172
      },
      "zrodloGps": "arkusz organizatorów „Namioty 2026”, wiersz 32, kolumna B (53.025923, 18.584172)",
      "przyblizone": false,
      "pozaKadrem": false,
      "mapa": null
    },
    {
      "id": "n32-budzet",
      "nazwa": "Namiot Budżetu Obywatelskiego 2027",
      "adres": "Park przy Toruńskich Wodociągach, ul. Świętego Józefa 37-49",
      "numer": 32,
      "strefa": "informacja",
      "gps": {
        "lat": 53.026231,
        "lng": 18.584833
      },
      "zrodloGps": "arkusz organizatorów „Namioty 2026”, wiersz 33, kolumna B (53.026231, 18.584833)",
      "przyblizone": false,
      "pozaKadrem": false,
      "mapa": null
    }
  ],

  wydarzenia: [
    {
      "id": "n01-animacje-w",
      "dzien": "niedziela",
      "od": "12:00",
      "do": "15:00",
      "nurt": "strefy",
      "tytul": "Animacje z harcerzami i wolontariuszami",
      "lokalizacja": "n01-animacje",
      "miejsce": "Namiot Animacje z harcerzami oraz wolontariuszami z SP 5: Robienie figurek z balonów, kolorowe warkoczyki, malowanie twarzy, bańki mydlane",
      "opis": "Jak co roku Święto Chełmińskiego Przedmieścia wspierane jest przez wolontariuszy z SP5, SP3 oraz harcerzy. W tym roku zapraszamy na kącik animacyjny wolontariuszy, gdzie możecie znaleźć takie atrakcje jak zaplatanie kolorowych warkoczyków, kolorowanie włosów, malowanie twarzy, figurki z balonów, bańki mydlane.",
      "kategoria": "rodzinna",
      "tagi": [
        "dla-dzieci",
        "wez-udzial"
      ],
      "linki": [],
      "zdjecia": [],
      "dodatki": null,
      "ikona": "latawiec"
    },
    {
      "id": "n02-dmuchance-w",
      "dzien": "niedziela",
      "od": "12:00",
      "do": "15:00",
      "nurt": "strefy",
      "tytul": "Dmuchańce",
      "lokalizacja": "n02-dmuchance",
      "miejsce": "Namiot Dmuchańce",
      "opis": "nieodpłatne - Eliminator, Plac Zabaw Pingwiny, Zjeżdżalnia egzotyczna.",
      "kategoria": "rodzinna",
      "tagi": [
        "dla-dzieci"
      ],
      "linki": [],
      "zdjecia": [],
      "dodatki": null,
      "ikona": "latawiec"
    },
    {
      "id": "n03-willa-w",
      "dzien": "niedziela",
      "od": "12:00",
      "do": "15:00",
      "nurt": "strefy",
      "tytul": "Warsztaty artystyczne — CAL Willa z pasją",
      "lokalizacja": "n03-willa",
      "miejsce": "Namiot Warsztaty artystyczne z CAL Willą z pasją",
      "opis": "Willa z pasją zaprasza na spotkanie w indiańskim klimacie!\nW tym roku nasze stanowisko zabierze Was w niezwykłą podróż inspirowaną kulturą i symboliką Indian. Zarówno na dzieci, jak i seniorów czekać będą kreatywne warsztaty, twórcze wyzwania i okazja do wspólnego spędzenia czasu. Będzie kolorowo, kreatywnie i z odrobiną indiańskiego klimatu!\nDodatkowo na naszym stanowisku poznacie Bank Czasu – sąsiedzką wymianę czasu, umiejętności i wzajemnej pomocy bez użycia pieniędzy. Będzie można zapisać, czego potrzebujemy, oraz podzielić się tym, co możemy zaoferować innym, aby sąsiedzkie wsparcie mogło wychodzić poza mury Willi z pasją i łączyć mieszkańców.",
      "kategoria": "rodzinna",
      "tagi": [
        "dla-dzieci",
        "wez-udzial",
        "zapisy"
      ],
      "linki": [],
      "zdjecia": [],
      "dodatki": null,
      "ikona": "nozyce"
    },
    {
      "id": "n04-biblioteki-w",
      "dzien": "niedziela",
      "od": "12:00",
      "do": "15:00",
      "nurt": "strefy",
      "tytul": "Biblioteki Chełmionka i Lelewela",
      "lokalizacja": "n04-biblioteki",
      "miejsce": "Stoisko naszych lokalnych bibliotek: Biblioteki Chełmionka oraz biblioteki Lelewela (Filie Książnicy Kopernikańskiej)",
      "opis": "W namiocie naszych lokalnych, chełmionkowych bibliotek (Biblioteka Chełmionka oraz Biblioteka Lelewela) czeka na Państwa konkurs z wiedzy o Chełmińskim Przedmieściu, w którym można wygrać ciekawe książki oraz kącik plastyczny.",
      "kategoria": "kultura",
      "tagi": [
        "dla-dzieci",
        "wez-udzial"
      ],
      "linki": [],
      "zdjecia": [],
      "dodatki": null,
      "ikona": "kostka"
    },
    {
      "id": "n05-pasieka-w",
      "dzien": "niedziela",
      "od": "12:00",
      "do": "15:00",
      "nurt": "strefy",
      "tytul": "Pasieka Bzyk — Pszczele laboratorium",
      "lokalizacja": "n05-pasieka",
      "miejsce": "Namiot Pasieka Bzyk",
      "opis": "„Pszczele laboratorium”. Zajęcia i ciekawostki pszczele, pokaz narzędzi pszczelarskich, degustacja produktów pszczelich i wiele innych.",
      "kategoria": "natura",
      "tagi": [
        "dla-dzieci",
        "wez-udzial",
        "do-zjedzenia"
      ],
      "linki": [],
      "zdjecia": [],
      "dodatki": null,
      "ikona": "punkt"
    },
    {
      "id": "n06-wystawa-w",
      "dzien": "niedziela",
      "od": "12:00",
      "do": "15:00",
      "nurt": "strefy",
      "tytul": "Wystawa „Przywróćmy Pamięć o Chełmionce”",
      "lokalizacja": "n06-wystawa",
      "miejsce": "Wystawa plenerowa „Przywróćmy Pamięć o Chełmionce”",
      "opis": "Wystawa przedstawiająca historię Chełmińskiego Przedmieścia na przestrzeni wieków, historię głównej ulicy w Toruniu-ulicy Szosa Chełmińska, a także wystawa opowiadająca o życiu i twórczości Małgorzaty Iwanowskiej-Ludwińskiej.",
      "kategoria": "kultura",
      "tagi": [],
      "linki": [],
      "zdjecia": [],
      "dodatki": null,
      "ikona": "dom"
    },
    {
      "id": "n07-archiwalne-w",
      "dzien": "niedziela",
      "od": "12:00",
      "do": "15:00",
      "nurt": "strefy",
      "tytul": "Chełmionka — Sąsiedzkie Spotkania Archiwalne",
      "lokalizacja": "n07-archiwalne",
      "miejsce": "Namiot Projektu „Chełmionka - Sąsiedzkie Spotkania Archiwalne”",
      "opis": "W naszym namiocie będzie można:\n• porozmawiać o Archiwum Społecznym Chełmionki - jego historii i zbiorach,\n• podzielić się wspomnieniami, zdjęciami i pamiątkami,\n• zagrać w Chełmionkowe Memory,\n• przypomnieć sobie wygląd historycznych kamienic na Chełmińskim Przedmieściu - wspólnie je pokolorować\n• zrobić sobie Chełmionkowy tatuaż — zabawny, sąsiedzki, inspirowany lokalną historią.",
      "kategoria": "kultura",
      "tagi": [
        "dla-dzieci",
        "wez-udzial"
      ],
      "linki": [],
      "zdjecia": [],
      "dodatki": null,
      "ikona": "dom"
    },
    {
      "id": "n08-tu-mieszkam-w",
      "dzien": "niedziela",
      "od": "12:00",
      "do": "15:00",
      "nurt": "strefy",
      "tytul": "Chełmionka — tu mieszkam, tu działam",
      "lokalizacja": "n08-tu-mieszkam",
      "miejsce": "Namiot Projektu „Chełmionka – tu mieszkam, tu działam”,",
      "opis": "Zapraszamy do namiotu projektu „Chełmionka – tu mieszkam, tu działam”, gdzie:\n• opowiemy o nadchodzących działaniach projektowych,\n• przedstawimy Archiwum Społeczne Chełmionki,\n• będzie można zagrać w Chełmionkowe Memory,\n• stworzyć własną mapę obecności na Chełmionce — zaznaczając miejsca ważne w życiu mieszkańców.",
      "kategoria": "kultura",
      "tagi": [
        "wez-udzial"
      ],
      "linki": [],
      "zdjecia": [],
      "dodatki": null,
      "ikona": "dom"
    },
    {
      "id": "n09-informacja-w",
      "dzien": "niedziela",
      "od": "12:00",
      "do": "15:00",
      "nurt": "strefy",
      "tytul": "Namiot informacyjny święta",
      "lokalizacja": "n09-informacja",
      "miejsce": "Namiot informacyjny święta – tu znajdziecie informacje, pomoc i dobrą energię!",
      "opis": "Namiot Informacyjny Święta\nCharakterystyczny czerwony namiot z logo Stowarzyszenia Chełmińskie Przedmieście – Tu Mieszkam to centrum informacji o wydarzeniu. Dowiecie się tutaj co, gdzie i kiedy się odbywa, otrzymacie program święta oraz wskazówki, jak trafić do poszczególnych atrakcji.\nTo również doskonały punkt orientacyjny i miejsce zbiórki dla rodzin, znajomych czy grup uczestników. Jeśli się zgubicie lub będziecie czegoś szukać, zacznijcie właśnie tutaj.",
      "kategoria": "informacja",
      "tagi": [],
      "linki": [],
      "zdjecia": [],
      "dodatki": null
    },
    {
      "id": "n10-rada-okregu-w",
      "dzien": "niedziela",
      "od": "12:00",
      "do": "15:00",
      "nurt": "strefy",
      "tytul": "Rada Okręgu „Chełmińskie” — quiz o Chełmionce",
      "lokalizacja": "n10-rada-okregu",
      "miejsce": "Stoisko Rady Okręgu „Chełmińskie” - punkt informacyjny o zmianach w radach okręgu i quiz dla Dzieci o Chełmionce",
      "opis": "Zapraszamy na nową odsłonę quizu wiedzy o Chełmionce - na najmłodszych piękne karty z pytaniami oraz szkicami Pani Małgorzaty Iwanowskiej-Ludwińskiej a także oczywiście gadżety za prawidłowe odpowiedzi.\nDodatkowo w namiocie możecie zapoznać się z nowymi granicami okręgów (pamiętajcie, od kolejnych wyborów w miejsce naszego okręgu będą 3 okręgi: Chełmińskie, Koniuchy, Bielany)",
      "kategoria": "informacja",
      "tagi": [
        "dla-dzieci",
        "wez-udzial"
      ],
      "linki": [],
      "zdjecia": [],
      "dodatki": null,
      "ikona": "kostka"
    },
    {
      "id": "n11-neuca-w",
      "dzien": "niedziela",
      "od": "12:00",
      "do": "15:00",
      "nurt": "strefy",
      "tytul": "Namiot profilaktyczny NEUCA i PharmaHelp",
      "lokalizacja": "n11-neuca",
      "miejsce": "Namiot Profilaktyczny Neuca obsługiwany przez fundację farmaceutek PharmaHelp",
      "opis": "Fundacja NEUCA dla Zdrowia w swoim namiocie, w ramach ogólnopolskiego programu Narodowe Badanie Poziomu Cukru, oferuje bezpłatne badania glukozy wraz z materiałami edukacyjnymi do samokontroli.\nBadania i konsultacje prowadzą farmaceutki z Fundacji PharmaHelp, zapewniając:\n– pomiar ciśnienia i glikemii z omówieniem wyników,\n– profesjonalne porady farmaceutyczne (leki, suplementy, wyniki badań),\n– informacje o karcie „Liście na ratunek”,\n– wsparcie w zdrowym stylu życia ,\n– edukację zdrowotną: profilaktyka i szczepienia.\nNEUCA i PharmaHelp — razem dla zdrowia mieszkańców.",
      "kategoria": "zdrowie",
      "tagi": [
        "wez-udzial"
      ],
      "linki": [],
      "zdjecia": [],
      "dodatki": null
    },
    {
      "id": "n12-swiat-zdrowia-w",
      "dzien": "niedziela",
      "od": "12:00",
      "do": "15:00",
      "nurt": "strefy",
      "tytul": "Fundacja Świat Zdrowia",
      "lokalizacja": "n12-swiat-zdrowia",
      "miejsce": "Zielony namiot Fundacji Świat Zdrowia",
      "opis": "W zielonym namiocie Fundacji Świat Zdrowia będzie można skorzystać z pomiaru BMI oraz wypełnić krótką ankietę udziału w programie profilaktycznym dla dzieci.\nZapraszamy uczniów klas I–III szkół podstawowych z Torunia do bezpłatnego programu „Qźnia Zdrowia Kids” (2025–2029), którego celem jest wczesne wykrywanie nadwagi i otyłości oraz wspieranie rodzin w budowaniu zdrowych nawyków.\nProgram oferuje rozszerzone wsparcie dla 180 dzieci z najwyższymi wartościami BMI:\n– konsultacje dietetyczne i psychologiczne,\n– zajęcia ruchowe,\n– działania profilaktyczne i specjalistyczne wsparcie.",
      "kategoria": "zdrowie",
      "tagi": [
        "dla-dzieci",
        "wez-udzial",
        "zapisy"
      ],
      "linki": [],
      "zdjecia": [],
      "dodatki": null
    },
    {
      "id": "n13-kapiel-lesna-w",
      "dzien": "niedziela",
      "od": "12:00",
      "do": "15:00",
      "nurt": "strefy",
      "tytul": "Kąpiel leśna",
      "lokalizacja": "n13-kapiel-lesna",
      "miejsce": "Namiot Kąpieli leśna na Chełmińskim Przedmieściu",
      "opis": "W ramach Święta Chełmińskiego Przedmieścia zapraszamy na wyjątkowe sąsiedzkie spotkanie wśród chełmionkowych drzew. Kąpiel leśna (jap. shinrin-yoku) to spokojne, uważne zanurzenie się w atmosferze lasu i kontakt z przyrodą wszystkimi zmysłami.\nSpotkanie poprowadzi torunianka Agnieszka Szarafin-Kreft, certyfikowana przewodniczka kąpieli i terapii leśnej. Tutaj nie liczą się kilometry ani tempo, lecz chwila wytchnienia i bycie blisko natury. 🌿",
      "kategoria": "natura",
      "tagi": [
        "wez-udzial"
      ],
      "linki": [],
      "zdjecia": [],
      "dodatki": null,
      "ikona": "punkt"
    },
    {
      "id": "n14-autodrom-w",
      "dzien": "niedziela",
      "od": "12:00",
      "do": "15:00",
      "nurt": "strefy",
      "tytul": "Autodrom",
      "lokalizacja": "n14-autodrom",
      "miejsce": "Autodrom",
      "opis": "Po raz kolejny zapraszamy do symulatora dachowania, dzięki któremu można doświadczyć, co dzieje się z człowiekiem w trakcie takiego wypadku, jak zachowuje się auto podczas dachowania oraz jak działają pasy bezpieczeństwa.",
      "kategoria": "rodzinna",
      "tagi": [
        "wez-udzial"
      ],
      "linki": [],
      "zdjecia": [],
      "dodatki": null,
      "ikona": "kula"
    },
    {
      "id": "n15-wieza-w",
      "dzien": "niedziela",
      "od": "12:15",
      "do": null,
      "nurt": "strefy",
      "tytul": "Wieża ciśnień i Muzeum Wodociągów",
      "lokalizacja": "n15-wieza",
      "miejsce": "Zwiedzanie zabytkowej wieży ciśnień oraz wyjątkowego Muzeum Wodociągów (wejście biletowane,limitowane)",
      "opis": "Wejścia biletowane o 12:15, 13:15, 14:15; bilety do odbioru CAL Willa z pasją, ul. Grunwaldzka 38 w dniach: 07–09 września (poniedziałek, wtorek, środa)",
      "kategoria": "kultura",
      "tagi": [
        "zapisy"
      ],
      "linki": [],
      "zdjecia": [],
      "dodatki": null,
      "ikona": "dom",
      "wejscia": [
        "12:15",
        "13:15",
        "14:15"
      ]
    },
    {
      "id": "n16-pup-w",
      "dzien": "niedziela",
      "od": "12:00",
      "do": "15:00",
      "nurt": "strefy",
      "tytul": "Powiatowy Urząd Pracy",
      "lokalizacja": "n16-pup",
      "miejsce": "Namiot Powiatowego Urzędu Pracy w Toruniu",
      "opis": "Będzie można się zapoznać z ofertą oraz bieżącymi inicjatywami PUPu.",
      "kategoria": "informacja",
      "tagi": [],
      "linki": [],
      "zdjecia": [],
      "dodatki": null
    },
    {
      "id": "n17-mpo-w",
      "dzien": "niedziela",
      "od": "12:00",
      "do": "15:00",
      "nurt": "strefy",
      "tytul": "MPO — edukacja ekologiczna",
      "lokalizacja": "n17-mpo",
      "miejsce": "Namiot MPO",
      "opis": "Miejskie Przedsiębiorstwo Oczyszczania poprzez zabawę odsłania tajniki prawidłowej segregacji śmieci oraz generalne zasady dbania o środowisko naturalne.",
      "kategoria": "natura",
      "tagi": [
        "dla-dzieci",
        "wez-udzial"
      ],
      "linki": [],
      "zdjecia": [],
      "dodatki": null
    },
    {
      "id": "n18-adwokaci-w",
      "dzien": "niedziela",
      "od": "12:00",
      "do": "15:00",
      "nurt": "strefy",
      "tytul": "Kujawsko-Pomorska Izba Adwokacka",
      "lokalizacja": "n18-adwokaci",
      "miejsce": "Namiot Kujawsko-Pomorskiej Izby Adwokackiej w Toruniu",
      "opis": "Rozmowy o działaniu izby, kolorowanki, konkursy, książeczki tłumaczące w prosty i przyjemny sposób jak to jest z tym prawem.",
      "kategoria": "informacja",
      "tagi": [
        "dla-dzieci",
        "wez-udzial"
      ],
      "linki": [],
      "zdjecia": [],
      "dodatki": null
    },
    {
      "id": "n19-straz-w",
      "dzien": "niedziela",
      "od": "12:00",
      "do": "15:00",
      "nurt": "strefy",
      "tytul": "Straż Miejska",
      "lokalizacja": "n19-straz",
      "miejsce": "Stoisko Straży Miejskiej",
      "opis": "Toruńska Straż Miejska zaprasza do swojego namiotu pełnego ciekawostek na temat bezpieczeństwa, przepisów ruchu drogowego.",
      "kategoria": "informacja",
      "tagi": [
        "dla-dzieci"
      ],
      "linki": [],
      "zdjecia": [],
      "dodatki": null
    },
    {
      "id": "n20-gramy-w",
      "dzien": "niedziela",
      "od": "12:00",
      "do": "15:00",
      "nurt": "strefy",
      "tytul": "3-2-1 Gramy — animacje sportowe",
      "lokalizacja": "n20-gramy",
      "miejsce": "Marcin Gębicki i Sportowa Inicjatywa Rozwojowa 3-2-1 Gramy",
      "opis": "3-2-1 Gramy to inicjatywa animacji sportowych dla dzieci i młodzieży, bezpłatnych zajęć integracyjnych. Z pasją, zaangażowaniem i stałą obecnością.",
      "kategoria": "zdrowie",
      "tagi": [
        "dla-dzieci",
        "wez-udzial"
      ],
      "linki": [],
      "zdjecia": [],
      "dodatki": null,
      "ikona": "kula"
    },
    {
      "id": "n21-tkkf-w",
      "dzien": "niedziela",
      "od": "12:00",
      "do": "15:00",
      "nurt": "strefy",
      "tytul": "TKKF — sport i rekreacja",
      "lokalizacja": "n21-tkkf",
      "miejsce": "TKKF",
      "opis": "Toruński Związek TKKF od ponad 30 lat działa na rzecz sportu, rekreacji i zdrowego stylu życia, szkoląc instruktorów zgodnie z ustawą o Zintegrowanym Systemie Kwalifikacji. Prowadzi także Ośrodek Terapii Ruchowej – Fitness Klub TKKF, gdzie w przyjaznej atmosferze zadbasz o ciało i duszę. Więcej informacji na: www.maraton.pl i www.fitnessklubtkkf.pl.",
      "kategoria": "zdrowie",
      "tagi": [
        "wez-udzial"
      ],
      "linki": [],
      "zdjecia": [],
      "dodatki": null,
      "ikona": "kula"
    },
    {
      "id": "n22-pomorzanin-w",
      "dzien": "niedziela",
      "od": "12:00",
      "do": "15:00",
      "nurt": "strefy",
      "tytul": "KS Pomorzanin Toruń",
      "lokalizacja": "n22-pomorzanin",
      "miejsce": "KS Pomorzanin Toruń",
      "opis": "KS Pomorzanin Toruń to najstarszy klub sportowy w mieście, świętujący w tym roku 90-lecie działalności. Dawniej wielosekcyjny, obecnie skupiający się na akademii piłkarskiej, wspierając także sekcje hokeja na trawie i boksu. Dziś to przede wszystkim dynamiczna akademia piłkarska z blisko 300 zawodnikami i seniorską drużyną w rozgrywkach ligowych. To klub tworzony przez ludzi z pasją, który integruje toruńską społeczność poprzez sport i wspólne wartości.",
      "kategoria": "zdrowie",
      "tagi": [
        "dla-dzieci"
      ],
      "linki": [],
      "zdjecia": [],
      "dodatki": null,
      "ikona": "kula"
    },
    {
      "id": "n23-wodopoj-w",
      "dzien": "niedziela",
      "od": "12:00",
      "do": "15:00",
      "nurt": "strefy",
      "tytul": "Wodopój Toruńskich Wodociągów",
      "lokalizacja": "n23-wodopoj",
      "miejsce": "Wodopój Toruńskich Wodociągów",
      "opis": "W tym roku po raz kolejny każdy z Państwa ma okazję się napić najlepszej wody - prosto z nowoczesnego Wozu/dystrybutora Toruńskich Wodociągów. W tym miejscu jak zawsze bardzo dziękujemy za udostępnienie nam tego cudownego miejsca oraz ogromną otwartość i pomoc logistyczną w przygotowaniu dzisiejszego święta.",
      "kategoria": "rodzinna",
      "tagi": [
        "do-zjedzenia"
      ],
      "linki": [],
      "zdjecia": [],
      "dodatki": null,
      "ikona": "talerz"
    },
    {
      "id": "n24-seniorzy-w",
      "dzien": "niedziela",
      "od": "12:00",
      "do": "15:00",
      "nurt": "strefy",
      "tytul": "Rada Seniorów przy Prezydencie Miasta",
      "lokalizacja": "n24-seniorzy",
      "miejsce": "Stoisko Rady Seniorów przy PMT",
      "opis": "Rada Seniorów przy Prezydencie Miasta Torunia będzie na swoim stanowisku informować mieszkańców o działaniach na rzecz osób starszych, konsultacjach społecznych i możliwościach włączania się w inicjatywy poprawiające jakość życia seniorów w Toruniu.",
      "kategoria": "informacja",
      "tagi": [],
      "linki": [],
      "zdjecia": [],
      "dodatki": null
    },
    {
      "id": "n25-dobra-fundacja-w",
      "dzien": "niedziela",
      "od": "12:00",
      "do": "15:00",
      "nurt": "strefy",
      "tytul": "Dobra Fundacja — stoisko z zabawkami",
      "lokalizacja": "n25-dobra-fundacja",
      "miejsce": "Stoisko Dobrej Fundacji",
      "opis": "Bardzo dobre charytatywne stoisko zabawkowe.",
      "kategoria": "rodzinna",
      "tagi": [],
      "linki": [],
      "zdjecia": [],
      "dodatki": null
    },
    {
      "id": "n26-bikecafe-w",
      "dzien": "niedziela",
      "od": "12:00",
      "do": "15:00",
      "nurt": "strefy",
      "tytul": "BikeCafe",
      "lokalizacja": "n26-bikecafe",
      "miejsce": "BikeCafe",
      "opis": "Bike cafe jest z nami od pierwszej edycji święta serwując co roku przepyszną kawę i inne napoje (możliwość zakupu).",
      "kategoria": "rodzinna",
      "tagi": [
        "do-zjedzenia",
        "platne"
      ],
      "linki": [],
      "zdjecia": [],
      "dodatki": null,
      "ikona": "talerz"
    },
    {
      "id": "n27-pan-tadeusz-w",
      "dzien": "niedziela",
      "od": "12:00",
      "do": "15:00",
      "nurt": "strefy",
      "tytul": "Małe Muzeum Historii Edycji Pana Tadeusza",
      "lokalizacja": "n27-pan-tadeusz",
      "miejsce": "Stoisko Małego Muzeum Historii Edycji Pana Tadeusza",
      "opis": null,
      "kategoria": "kultura",
      "tagi": [],
      "linki": [],
      "zdjecia": [],
      "dodatki": null,
      "ikona": "dom"
    },
    {
      "id": "n28-bractwo-w",
      "dzien": "niedziela",
      "od": "12:00",
      "do": "15:00",
      "nurt": "strefy",
      "tytul": "Bractwo św. Jakuba Apostoła",
      "lokalizacja": "n28-bractwo",
      "miejsce": "Stoisko Kuj.-Pom. Bractwo św. Jakuba Apostoła w Toruniu",
      "opis": "Kujawsko‑Pomorskie Bractwo św. Jakuba Apostoła w Toruniu będzie opowiadać o tradycjach pielgrzymowania, lokalnych odcinkach Drogi św. Jakuba oraz działaniach na rzecz zachowania dziedzictwa kulturowego regionu.",
      "kategoria": "informacja",
      "tagi": [],
      "linki": [],
      "zdjecia": [],
      "dodatki": null
    },
    {
      "id": "n29-food-trucki-w",
      "dzien": "niedziela",
      "od": "12:00",
      "do": "15:00",
      "nurt": "strefy",
      "tytul": "Food trucki",
      "lokalizacja": "n29-food-trucki",
      "miejsce": "Food trucki,- mała przekąska dla głodomorów",
      "opis": "Dla głodomorów polecamy frytki, zapiekanki, hot-dogi (możliwość zakupu).",
      "kategoria": "rodzinna",
      "tagi": [
        "do-zjedzenia",
        "platne"
      ],
      "linki": [],
      "zdjecia": [],
      "dodatki": null,
      "ikona": "talerz"
    },
    {
      "id": "n30-tilia-w",
      "dzien": "niedziela",
      "od": "12:00",
      "do": "15:00",
      "nurt": "strefy",
      "tytul": "Szkoła Leśna na Barbarce i Tilia",
      "lokalizacja": "n30-tilia",
      "miejsce": "Namiot Szkoły Leśnej na Barbarce i Stowarzyszenia Tilia",
      "opis": "Na stanowisku Szkoły Leśnej na Barbarce Pokażemy, jak poprzez proste codzienne działania można chronić środowisko i ograniczać ilość odpadów. Czekają na Was zagadki, quizy i miniwarsztaty ekologiczne.\nKażdy chętny będzie mógł także własnoręcznie wykonać unikatowy magnes z recyklingowych elementów drewnianych.\nZapraszamy do wspólnej zabawy i odkrywania, że małe zmiany mają znaczenie!\nDziałania realizowane są w ramach projektu pn. „Ograniczaj, segreguj, odzyskuj — Toruń wie jak postępować z odpadami”, który realizowany jest dzięki wsparciu Gminy Miasta Toruń",
      "kategoria": "natura",
      "tagi": [
        "dla-dzieci",
        "wez-udzial"
      ],
      "linki": [],
      "zdjecia": [],
      "dodatki": null
    },
    {
      "id": "n31-lody-w",
      "dzien": "niedziela",
      "od": "12:00",
      "do": "15:00",
      "nurt": "strefy",
      "tytul": "Lody Lenkiewicz",
      "lokalizacja": "n31-lody",
      "miejsce": "Lody Lenkiewicz",
      "opis": "Możliwość zakupu najlepszych i największych lodów w Toruniu-od Lenkiewicza.",
      "kategoria": "rodzinna",
      "tagi": [
        "do-zjedzenia",
        "platne"
      ],
      "linki": [],
      "zdjecia": [],
      "dodatki": null,
      "ikona": "talerz"
    },
    {
      "id": "n32-budzet-w",
      "dzien": "niedziela",
      "od": "12:00",
      "do": "15:00",
      "nurt": "strefy",
      "tytul": "Namiot Budżetu Obywatelskiego 2027",
      "lokalizacja": "n32-budzet",
      "miejsce": "Namiot Budżetu Obywatelskiego 2027",
      "opis": "Od 7 do 20 września 2026 odbywa się głosowanie do Budżetu Obywatelskiego. Po raz pierwszy, na naszym święcie można zagłosować w namiocie BO - do czego gorąco zachęcamy. Nie ma złych projektów. Każdy znajdzie coś dla siebie zarówno z listy lokalnej jak i ogólnomiejskiej. W szczególności zachęcamy do głosowania na 10 Święto Chełmińskiego Przedmieścia: CH0626 Chełmińskie",
      "kategoria": "informacja",
      "tagi": [
        "wez-udzial"
      ],
      "linki": [],
      "zdjecia": [],
      "dodatki": null
    },
    {
      "id": "scena-01",
      "dzien": "niedziela",
      "od": "12:00",
      "do": "12:05",
      "nurt": "scena",
      "tytul": "Uroczyste przywitanie",
      "lokalizacja": "scena",
      "miejsce": "Scena główna",
      "opis": null,
      "kategoria": "scena",
      "tagi": [],
      "linki": [],
      "zdjecia": [],
      "ikona": "punkt",
      "dodatki": null
    },
    {
      "id": "scena-02",
      "dzien": "niedziela",
      "od": "12:05",
      "do": "12:20",
      "nurt": "scena",
      "tytul": "Zumba",
      "lokalizacja": "scena",
      "miejsce": "Scena główna — TKKF",
      "opis": null,
      "kategoria": "scena",
      "tagi": [],
      "linki": [],
      "zdjecia": [],
      "ikona": "taniec",
      "dodatki": null
    },
    {
      "id": "scena-03",
      "dzien": "niedziela",
      "od": "12:20",
      "do": "12:35",
      "nurt": "scena",
      "tytul": "Rodzinny konkurs ruchowy",
      "lokalizacja": "scena",
      "miejsce": "Scena główna — Tomasz Wiese",
      "opis": null,
      "kategoria": "scena",
      "tagi": [],
      "linki": [],
      "zdjecia": [],
      "ikona": "kula",
      "dodatki": null
    },
    {
      "id": "scena-04",
      "dzien": "niedziela",
      "od": "12:35",
      "do": "12:50",
      "nurt": "scena",
      "tytul": "Konkurs wiedzy o Chełmionce",
      "lokalizacja": "scena",
      "miejsce": "Scena główna — Anna Natalia Kmieć",
      "opis": null,
      "kategoria": "scena",
      "tagi": [],
      "linki": [],
      "zdjecia": [],
      "ikona": "kostka",
      "dodatki": null
    },
    {
      "id": "scena-05",
      "dzien": "niedziela",
      "od": "12:50",
      "do": "13:05",
      "nurt": "scena",
      "tytul": "Opowiadanie „Hejt w internecie”",
      "lokalizacja": "scena",
      "miejsce": "Scena główna — czyta adw. Edyta Bocianiak, przewodnicząca Komisji Edukacji Izby Adwokackiej",
      "opis": null,
      "kategoria": "scena",
      "tagi": [],
      "linki": [],
      "zdjecia": [],
      "ikona": "punkt",
      "dodatki": null
    },
    {
      "id": "scena-06",
      "dzien": "niedziela",
      "od": "13:05",
      "do": "13:20",
      "nurt": "scena",
      "tytul": "Konkurs sportowy",
      "lokalizacja": "scena",
      "miejsce": "Scena główna — 3-2-1 Gramy & Marcin Gębicki",
      "opis": null,
      "kategoria": "scena",
      "tagi": [],
      "linki": [],
      "zdjecia": [],
      "ikona": "kula",
      "dodatki": null
    },
    {
      "id": "scena-07",
      "dzien": "niedziela",
      "od": "13:20",
      "do": "13:35",
      "nurt": "scena",
      "tytul": "„Co z tymi Radami?”",
      "lokalizacja": "scena",
      "miejsce": "Scena główna — RO11 & Marcin Czyżniewski",
      "opis": null,
      "kategoria": "scena",
      "tagi": [],
      "linki": [],
      "zdjecia": [],
      "ikona": "dom",
      "dodatki": null
    },
    {
      "id": "scena-08",
      "dzien": "niedziela",
      "od": "13:35",
      "do": "13:50",
      "nurt": "scena",
      "tytul": "Konkurs pszczeli",
      "lokalizacja": "scena",
      "miejsce": "Scena główna — Agnieszka Dukowska",
      "opis": null,
      "kategoria": "scena",
      "tagi": [],
      "linki": [],
      "zdjecia": [],
      "ikona": "kostka",
      "dodatki": null
    },
    {
      "id": "scena-09",
      "dzien": "niedziela",
      "od": "13:50",
      "do": "14:00",
      "nurt": "scena",
      "tytul": "Blok muzyczny",
      "lokalizacja": "scena",
      "miejsce": "Scena główna — Samsolo",
      "opis": null,
      "kategoria": "scena",
      "tagi": [],
      "linki": [],
      "zdjecia": [],
      "ikona": "nuta",
      "dodatki": null
    },
    {
      "id": "scena-10",
      "dzien": "niedziela",
      "od": "14:00",
      "do": "14:15",
      "nurt": "scena",
      "tytul": "Konkurs sportowy",
      "lokalizacja": "scena",
      "miejsce": "Scena główna — Pomorzanin",
      "opis": null,
      "kategoria": "scena",
      "tagi": [],
      "linki": [],
      "zdjecia": [],
      "ikona": "kula",
      "dodatki": null
    },
    {
      "id": "scena-11",
      "dzien": "niedziela",
      "od": "14:15",
      "do": "14:25",
      "nurt": "scena",
      "tytul": "Chełmionkowe projekty: „Chełmionka – tu mieszkam, tu działam” oraz „Sąsiedzkie Spotkania Archiwalne”",
      "lokalizacja": "scena",
      "miejsce": "Scena główna — Justyna Kardasz",
      "opis": null,
      "kategoria": "scena",
      "tagi": [],
      "linki": [],
      "zdjecia": [],
      "ikona": "dom",
      "dodatki": null
    },
    {
      "id": "scena-12",
      "dzien": "niedziela",
      "od": "14:25",
      "do": "14:30",
      "nurt": "scena",
      "tytul": "LGD — projekty lokalne",
      "lokalizacja": "scena",
      "miejsce": "Scena główna — Monika Bartlińska",
      "opis": null,
      "kategoria": "scena",
      "tagi": [],
      "linki": [],
      "zdjecia": [],
      "ikona": "dom",
      "dodatki": null
    },
    {
      "id": "scena-13",
      "dzien": "niedziela",
      "od": "14:30",
      "do": "14:45",
      "nurt": "scena",
      "tytul": "Opowiadanie „Sprawa Żaby Żanety”",
      "lokalizacja": "scena",
      "miejsce": "Scena główna — czyta adw. Edyta Bocianiak",
      "opis": null,
      "kategoria": "scena",
      "tagi": [],
      "linki": [],
      "zdjecia": [],
      "ikona": "punkt",
      "dodatki": null
    },
    {
      "id": "scena-14",
      "dzien": "niedziela",
      "od": "14:45",
      "do": "15:00",
      "nurt": "scena",
      "tytul": "Blok muzyczny",
      "lokalizacja": "scena",
      "miejsce": "Scena główna — Samsolo",
      "opis": null,
      "kategoria": "scena",
      "tagi": [],
      "linki": [],
      "zdjecia": [],
      "ikona": "nuta",
      "dodatki": null
    },
    {
      "id": "scena-15",
      "dzien": "niedziela",
      "od": "15:00",
      "do": null,
      "nurt": "scena",
      "tytul": "Uroczyste zakończenie",
      "lokalizacja": "scena",
      "miejsce": "Scena główna",
      "opis": null,
      "kategoria": "scena",
      "tagi": [],
      "linki": [],
      "zdjecia": [],
      "ikona": "punkt",
      "dodatki": null
    }
  ],

  onas: {
    naglowek: 'Lucid Academy',
    logo: 'img/logo.jpg',
    logoMale: 'img/logo-mini.jpg',
    tresc: 'Lucid Academy — toruńska fundacja łącząca edukację AI z kulturą i lokalną wspólnotą. Uczymy rozumieć sztuczną inteligencję i zamieniamy te umiejętności w narzędzia i wydarzenia dla wspólnoty — ten plan terenu też zrobiliśmy my :)',
    kontakt: {
      wstep: 'Coś na planie nie zgadza się z tym, co widzisz na miejscu? Czegoś brakuje? Napisz — czytamy wszystko i poprawiamy tego samego dnia.',
      etykieta: 'Napisz do nas',
      email: 'piotr.jarczyk.ai@gmail.com',
      temat: 'Plan Święta Chełmińskiego Przedmieścia — uwagi'
    },
    formularz: null
  },

  /* Na Bydgoskim „przyjaciele" to były miejsca w dzielnicy z własnym adresem
     i pinem na mapie. Tutaj partnerzy święta stoją we własnych namiotach,
     więc są już na planie — zostaje sama lista podziękowań, bez pinów. */
  przyjaciele: {
    wstep: "Święto sfinansowane jest głównie przez Miasto Toruń, a także dzięki wsparciu finansowemu firm: Janasowie Nieruchomości, Admin Nieruchomości, Pres Developer. Organizatorami są Stowarzyszenie Chełmińskie Przedmieście Tu Mieszkam wraz z partnerami: Lokalną Grupą Działania dla Miasta Torunia prowadzącą Centrum Aktywności Lokalnej Willa z pasją, a także Radą Okręgu Chełmińskie. Jak co roku organizatorzy korzystają z gościnności i wsparcia Toruńskich Wodociągów.\n\nPodziękowania dla wszystkich partnerów: Miejskie Przedsiębiorstwo Oczyszczania w Toruniu, firma Samsolo, Pszczelarium Toruńskie, biblioteki lokalne Lelewela oraz Chełmionka, TKKF, Rada Seniorów, Kujawsko-Pomorskie Bractwo św. Jakuba Apostoła w Toruniu, Małe Muzeum Historii Edycji Pana Tadeusza, wolontariusze i ich opiekunowie ze Szkół Podstawowych numer 5 oraz numer 3, wolontariusze ze Szczepu 124 Toruńskich Drużyn Harcerskich i Gromad Zuchowych AQUA, ratownicy PCK, PharmaHelp, Arkadia, Klub Sportowy Pomorzanin Toruń, Sportowa Inicjatywa Rozwojowa 3-2-1 Gramy, Autodrom, Galeria Plaza, Szkoła Leśna na Barbarce i Stowarzyszenie Tilia, Dobra Fundacja, Fundacja Arkadia, Fundacja Neuca, Dmuchańce Gardino, Drzwi w Lesie, Powiatowy Urząd Pracy w Toruniu, Kujawsko-Pomorska Izba Adwokacka w Toruniu, Straż Miejska, Lenkiewicz, Bike Cafe, food trucki.",
    lista: []
  },

  /* PAMIĘĆ — dziewięć edycji święta. Zgoda na publikację: Piotr, 3 września 2026.
     Pliki źródłowe leżą w zrodla/chelminskie/magnesy/ i .../pocztowki/;
     do img/pamiec/ trafią po przepuszczeniu przez tools/zdjecia.js (etap 3).
     Tytuły pocztówek są pisane ołówkiem i częściowo nieczytelne — zgadywanie
     tytułu cudzej pracy byłoby gorszym błędem niż jego brak, więc `podpis: null`
     czeka na listę od organizatorów. */
  pamiec: {
    zgoda: 'Zgoda organizatorów na publikację magnesów i pocztówek — potwierdzona 3 września 2026.',
    wstep: 'To już dziewiąte Święto Chełmińskiego Przedmieścia. Po każdym zostaje magnes — inny budynek dzielnicy co roku.',
    magnesy: [
      { rok: 2018, edycja: 'I',    tytul: 'Dawny dworzec Toruń Północ',    plik: null, opis: null },
      { rok: 2019, edycja: 'II',   tytul: 'Czarny Kot',                    plik: null, opis: 'Ze zbiorów Muzeum Etnograficznego w Toruniu.' },
      { rok: null, edycja: 'III',  tytul: null,                            plik: null, opis: 'Kamienica rysowana węglem; rok nie jest podany ani na magnesie, ani w nazwie pliku.' },
      { rok: 2021, edycja: 'IV',   tytul: 'Anioł Chełmionki',              plik: null, opis: null },
      { rok: 2022, edycja: 'V',    tytul: null,                            plik: null, opis: null },
      { rok: 2024, edycja: 'VII',  tytul: null,                            plik: null, opis: 'Panorama dzielnicy z balonem.' },
      { rok: 2025, edycja: 'VIII', tytul: null,                            plik: null, opis: 'Grawerowany w drewnie: dom w kratę, dwoje dzieci i kot.' }
    ],
    pocztowki: [
      { tytul: null, autor: 'Małgorzata Iwanowska-Ludwińska', rok: 2013, plik: null, podpis: null },
      { tytul: null, autor: 'Małgorzata Iwanowska-Ludwińska', rok: 2013, plik: null, podpis: null },
      { tytul: null, autor: 'Małgorzata Iwanowska-Ludwińska', rok: 2013, plik: null, podpis: null },
      { tytul: null, autor: 'Małgorzata Iwanowska-Ludwińska', rok: 2013, plik: null, podpis: null },
      { tytul: null, autor: 'Małgorzata Iwanowska-Ludwińska', rok: 2013, plik: null, podpis: null },
      { tytul: null, autor: 'Małgorzata Iwanowska-Ludwińska', rok: 2013, plik: null, podpis: null }
    ]
  },

  /* LUKI — czego jeszcze nie wiemy. To funkcja, nie wstyd. */
  luki: [
    {
      id: 'bilety-na-wieze',
      tytul: 'Bilety na wieżę ciśnień wydawano przed świętem',
      tresc: 'Wejścia o 12:15, 13:15 i 14:15 są biletowane i limitowane, a bilety wydawano 7-9 września w CAL Willa z pasją przy ul. Grunwaldzkiej 38. Kto czyta to w dniu święta, biletu już nie dostanie. Piszemy o tym wprost, bo lepiej wiedzieć od razu niż stać w kolejce na próżno.'
    },
    {
      id: 'piny-5-i-25',
      tytul: 'Dwa piny są przybliżone',
      tresc: 'Pasieka Bzyk i stoisko Dobrej Fundacji miały w arkuszu organizatorów tę samą współrzędną. Organizatorzy potwierdzili, że stoiska stoją obok siebie i była to pomyłka przy klikaniu. Rozstawiliśmy je wzdłuż rzędu według odręcznego szkicu — kolejność jest pewna, dokładna pozycja co do metra nie.'
    },
    {
      id: 'scena-polozenie',
      tytul: 'Położenie sceny odczytane ze szkicu',
      tresc: 'Scena jest jedynym punktem, którego organizatorzy nie podali we współrzędnych. Postawiliśmy ją tam, gdzie rysuje ją odręczny szkic rozstawienia: przy południowej krawędzi terenu.'
    },
    {
      id: 'brak-opisu-27',
      tytul: 'Małe Muzeum Historii Edycji Pana Tadeusza nie ma jeszcze opisu',
      tresc: 'W arkuszu organizatorów kolumna z opisem tego stoiska jest pusta. Opis ma dojść — dopiszemy go, gdy tylko przyjdzie.'
    },
    {
      id: 'godziny-orientacyjne',
      tytul: 'Godziny na scenie są orientacyjne',
      tresc: 'Tak podali organizatorzy: „godziny orientacyjne — jak to na święcie, może nie być punktualnie jak w szwajcarskim zegarku". Zegar na tej stronie pokazuje rozpiskę, a nie stan faktyczny.'
    },
    {
      id: 'toalety-parkowanie',
      tytul: 'Nie wiemy, gdzie są toalety ani gdzie zaparkować',
      tresc: 'Program o tym nie mówi. Zapytaliśmy organizatorów i dopiszemy, gdy przyjdzie odpowiedź.'
    },
    {
      id: 'tytuly-pocztowek',
      tytul: 'Pocztówki czekają na tytuły',
      tresc: 'Podpisy pod pocztówkami Małgorzaty Iwanowskiej-Ludwińskiej są pisane ołówkiem i częściowo nieczytelne. Nie zgadujemy tytułów cudzych prac — czekamy na listę od organizatorów.'
    }
  ]
};
