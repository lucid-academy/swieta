# PROMPT — mapa Święta Chełmińskiego Przedmieścia

## Zanim zaczniesz: to nie jest nowy projekt

Silnik powstał przy Bydgoskim Przedmieściu i jest świadomie niezależny
od święta. Sprawdzone: w `index.html` nie ma nazwy żadnego święta poza
komentarzami i dwiema ścieżkami do plików z danymi. Nie buduj niczego
od nowa. Druga mapa to **podmiana danych, geometrii i materiałów**.

Jeśli w trakcie okaże się, że coś trzeba dopisać w silniku — dopisuj tak,
żeby działało dla obu świąt, nie tylko dla tego. Wszystko, co dotyczy
konkretnego święta, ma siedzieć w danych.

---

## Co już działa (nie budować od nowa)

- **Mapa SVG z prawdziwej geometrii OpenStreetMap** — pobieranie, filtry,
  upraszczanie, rzutowanie, obrót, zoom, nazwy ulic, róża wiatrów, skala.
- **Piny** liczone wprost z GPS, z rozpychaniem nakładających się,
  ikoną kategorii i licznikiem wydarzeń.
- **Panel wydarzenia**, program, filtry, planer z czasem przejścia,
  trasa na mapie, przyjaciele święta, „o nas", intro, kod QR.
- **Narzędzia**: `mapa.js`, `zdjecia.js`, `tresci.js`, `sprawdz.js`,
  `qr.js`, `publikuj.js`. Wszystkie poza `publikuj.js` przyjmują
  `--swieto <nazwa>`.

## Co jest zależne od święta (to się podmienia)

| co | gdzie |
|---|---|
| treść, program, lokalizacje | `dane/chelminskie.js` |
| geometria dzielnicy | `dane/mapa-chelminskie.js` (z `tools/mapa.js`) |
| zdjęcia, intro, logo | `img/` |
| dwie ścieżki `<script src>` | `index.html`, dwie linijki |

**Znane braki do załatania przy okazji:** `publikuj.js` ma zaszyte
`swietoBP` i nie przyjmuje `--swieto`. `index.html` ma zaszyte ścieżki
do danych. Jedno i drugie do sparametryzowania, gdy będą dwa święta naraz.

---

## Sposób pracy

Etapami, z zatrzymaniem po każdym. To się sprawdziło i zostaje.

Na starcie **przeczytaj `zrodla/` i przedstaw plan**, zanim napiszesz
pierwszą linijkę kodu.

**Nie zaczynaj, dopóki nie masz kompletu wsadu.** Przy Bydgoskim katalogi
`zrodla/program/` i `zrodla/mapa/` były puste, przez co cały pierwszy etap
stanął. Sprawdź to jako pierwszą czynność i powiedz wprost, czego brakuje.

---

## ETAP 1 — DANE

Sparsuj `zrodla/program/` do `dane/chelminskie.js`. Dla każdego wydarzenia:
dzień, godzina od–do, tytuł, lokalizacja, opis, linki, nazwy zdjęć, GPS.

**Model danych, który się sprawdził:** lokalizacje osobno od wydarzeń.
Jeden punkt na mapie = jeden pin; nazwę konkretnego miejsca niesie pole
`miejsce` przy wydarzeniu. Dzięki temu sześć wydarzeń pod jednym adresem
nie robi sześciu pinów.

### Współrzędne — tu było najwięcej pułapek

- **Linki `maps.app.goo.gl` rozwijaj i bierz parę `!3d!4d`, nie `@lat,lng`.**
  To drugie jest środkiem kadru i przy Bydgoskim było przesunięte o stałe
  0,0026° długości, czyli **170 metrów**. Cała mapa byłaby krzywa.
- **Każdą współrzędną sprawdź reverse geocodingiem** i zapisz wynik w polu
  `zrodloGps`. Przy Bydgoskim to wyłapało pinezkę wskazującą inną ulicę
  i fontannę oddaloną o 125 m od punktu podanego przez organizatorów.
- **Nigdy nie zgaduj.** Czego nie da się ustalić — `null`, flaga
  `przyblizone: true` i zgłoszenie na liście. Pin przybliżony musi to
  mówić w panelu wydarzenia, nie tylko w danych.

### Źródło bywa błędne — to nie to samo co wierność źródłu

Przy Bydgoskim wszystkie 27 wydarzeń wiernie odwzorowywały dokument,
a mimo to jedna godzina była zła, bo **pomylili się organizatorzy**.
Wierność źródłu nie wystarcza.

Poproś organizatorów o przejrzenie godzin **zanim** zbudujesz planer.
Gdy dane rozjadą się ze źródłem świadomie — zapisz powód w komentarzu
obok, żeby nikt tego później nie „naprawił" z powrotem.

### Kategorie i tagi

Kategoria steruje kolorem pinu, tagi filtrami.

- **Nie przyjmuj listy tagów z góry.** Przy Bydgoskim narzucona lista
  miała sześć pozycji, z czego „zapisy" nie pasowało do niczego,
  a „z psem" do jednego wydarzenia. Wyprowadź tagi z treści opisów
  i pokaż do zatwierdzenia.
- **Brak tagu znaczy „nie wiemy", nie „nie dotyczy".** Zapisz to
  w komentarzu przy danych.
- **Kategoria bywa za pojemna.** „Warsztaty" objęły ziny, cyrk, plastykę,
  tango i planszówki — wszystkie z tą samą ikoną nożyczek. Silnik pozwala
  nadpisać ikonę na poziomie wydarzenia (`ikona: 'kula'`). Korzystaj.
- **Sprawdź kontrast kolorów pinów** wobec papieru mapy. Zmierz, nie
  oceniaj okiem: ochra miała 2,33 przy wymaganych 3,5 i ginęła.

### Zdjęcia

`tools/zdjecia.js` — dłuższy bok 1200 px, miniatury 400 px, jakość 80.
Nazwy bez polskich znaków. Tym samym skryptem ozdobna grafika i logo.

---

## ETAP 2 — MAPA Z DANYCH RZECZYWISTYCH

Mapa NIE jest generowaną grafiką ani rastrem. SVG z geometrii OSM,
pobranej raz przez `tools/mapa.js` do repozytorium — strona ma działać
bez internetu.

**Co odsiać** (przy Bydgoskim z 10 301 elementów zostało 1 129):
`landuse=grass` — każdy trawnik między kamienicami, chodniki mapowane
osobno od jezdni, budynki bez nazwy i bez funkcji publicznej. To jest
80% wagi i 100% szumu.

**Ciągi piesze tylko wtedy, gdy większość punktów leży w parku** —
inaczej ścieżka muskająca park wchodzi na mapę całą kilometrową długością.

**Próg upraszczania dobierz patrząc, nie licząc.** Wyrenderuj kilka
wariantów tego samego kwartału i porównaj. Przy Bydgoskim 1,5 m było
nieodróżnialne od oryginału, a 6 m zamieniało kamienice w skośne
czworokąty. Wierność jest ważniejsza niż waga pliku — przy sporze pokaż
warianty i zapytaj.

**Rzutowanie równoprostokątne z korektą `cos(lat0)`.** Bez niej dzielnica
wychodzi rozciągnięta o 40%.

**Obrót wliczaj w rzutowanie, nie w transformację SVG** — dzięki temu
podpisy ulic są poziome bez kontrobrotu każdego napisu.

---

## ETAP 3 — DOPASOWANIE

Interfejs jest gotowy. Do przemyślenia zostaje to, co zależy od dzielnicy:

- **Orientacja.** Silnik sam wybiera tę, przy której mapa wychodzi większa,
  i daje przycisk do nadpisania. Sprawdź, czy dla nowego wycinka wybór
  jest sensowny.
- **Paleta.** Barwy Bydgoskiego wyciągnąłem ze zdjęć dzielnicy — cała
  ich siódemka mieściła się w jednej rodzinie sepii. Zrób to samo dla
  Chełmińskiego: zdjęcia mogą dać inną rodzinę.
- **Woda zostaje błękitna.** Przy stylizacji zamieniłem ją na sepię
  i zniknęła Wisła — a rzeka jest głównym punktem orientacyjnym.
  Tożsamość warstw nieś teksturą (stippling koron, kreskowanie wody),
  nie nasyceniem. Tekstura jest czytelniejsza w słońcu.
- **Intro jest opcjonalne** — usunięcie pola `intro` z danych wyłącza je
  w całości.

---

## ZASADY

- **Mobile first.** Ludzie otwierają to jedną ręką, w tłumie, na słabym
  zasięgu, w sierpniowym słońcu. Górne i dolne paski zjadały 32% ekranu —
  pilnuj tego, mapa ma zostać największym elementem.
- **Zero bibliotek w `index.html`, zero CDN-ów.** Jedyny dopuszczony
  wyjątek to licznik odsłon, bez którego strona działa tak samo.
  Ma działać otwarta z dysku i pod adresem w podkatalogu.
- **Nagrania z wydarzeń tylko jako linki zewnętrzne.** Nie dotyczy intra.
- **Wszystko po polsku, bez wersji językowych.**
- **Commituj po każdym zaakceptowanym etapie, opisowo.**
- **Nie wymyślaj treści, których nie ma w źródłach.** Dotyczy opisów,
  współrzędnych, godzin, adresów i tekstów o organizacjach.

---

## Czego nie powtarzać — błędy z pierwszej mapy

1. **Nie planuj mapy rastrowej.** Pierwotny etap 2 zakładał stylizowaną
   grafikę i ręczną kalibrację pinów. Cały ten plan poszedł do kosza na
   rzecz geometrii z OSM. Idź od razu do OSM.
2. **Nie zaczynaj przy pustych `zrodla/`.**
3. **Nie zbieraj treści przez Facebooka.** Blokuje pobieranie (400).
   Linki do wydarzeń są w porządku, ale program musi przyjść plikiem.
4. **Nie edytuj pliku danych ręcznie bez `sprawdz.js`.** To JavaScript;
   apostrof w polskim tekście gasi całą stronę, bez komunikatu.
   Uruchamiaj `node tools/sprawdz.js` przed każdą publikacją.
5. **Nie ufaj samemu `git push`.** Przy Bydgoskim GitHub Actions miał
   awarię i strona stała trzy commity w tyle, mimo że push przechodził.
   Sprawdzaj treść na żywym adresie, nie status wypchnięcia.
6. **Nie mierz „na oko".** Kontrast pinów, próg upraszczania, kadr intra
   i kolizje pinów rozstrzygnęły się liczbami, nie wrażeniem.

## Pułapki techniczne

- **Windows blokuje foldery** — `EBUSY` przy przenoszeniu. `tresci.js`
  ma już plan B ze znacznikiem, ale pamiętaj o tym w nowych narzędziach.
- **Escapowanie w shellu** rozwala polskie znaki i apostrofy. Dłuższe
  podmiany pisz do pliku `.mjs` i uruchamiaj, zamiast wciskać w `node -e`.
- **Netlify zamienia adresy na małe litery** — kanoniczny adres do
  materiałów drukowanych bierz taki, jaki wychodzi po przekierowaniu.
- **Pamiętaj o `-L` w curl** przy sprawdzaniu — bez tego widać
  przekierowanie zamiast treści i łatwo ogłosić fałszywy alarm.

---

## Czego potrzebuję na starcie

1. **Program** — plik w dowolnym formacie, z datami, godzinami i miejscami.
2. **Potwierdzone godziny** — najlepiej po przejrzeniu przez organizatorów.
3. **Zdjęcia** w `zrodla/nowe/<identyfikator-wydarzenia>/`.
4. **Materiały intra**, jeśli mają być — albo informacja, że nie.
5. **Lista przyjaciół święta** z adresami i jednym zdaniem, jak pomogli.
6. **Decyzja o liczniku odsłon** — GoatCounter czy bez.

Czego brakuje, powiem na starcie zamiast budować wokół dziur.
