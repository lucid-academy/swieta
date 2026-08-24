Buduję interaktywną mapę-przewodnik po XVII Święcie Bydgoskiego
Przedmieścia w Toruniu (sobota-niedziela 29-30 sierpnia 2026).
Odbiorca: Toruńska Agenda Kulturalna. To oficjalny materiał dla
mieszkańców, nie demo — dokładność danych jest ważniejsza niż
liczba funkcji.

SPOSÓB PRACY
Pracujemy etapami. Po każdym etapie zatrzymujesz się i czekasz na
moją akceptację. Nie buduj na zapas i nie wybiegaj do przodu.
Na starcie przeczytaj zrodla/ i przedstaw plan, zanim napiszesz
pierwszą linijkę kodu.

STRUKTURA
- index.html — jeden plik, zero bibliotek, zero CDN-ów. Ma działać
  otwarty z dysku i na GitHub Pages.
- dane/bydgoskie.js — wszystkie treści jako window.DANE = {...}.
  Świadomie .js zamiast .json, żeby działało przez file://.
- img/ — grafika mapy i przetworzone zdjęcia.
- zrodla/ — materiały wejściowe, w .gitignore, nie ruszaj zawartości.
- tools/ — narzędzia pomocnicze.

ETAP 1 — DANE
Sparsuj zrodla/program/ do dane/bydgoskie.js. 27 wydarzeń, dwa dni.
Dla każdego: dzień, godzina od-do, tytuł, lokalizacja (nazwa +
adres), opis, linki zewnętrzne, nazwy zdjęć, współrzędne GPS.

Współrzędne wyciągnij rozwijając linki maps.app.goo.gl (przekierowanie
zawiera koordynaty). Gdzie pinezki nie ma — zgeokoduj z adresu.
NIGDY nie zgaduj współrzędnych ani niczego innego. Czego nie da się
ustalić, wpisz jako null i zgłoś mi listę na koniec etapu.
Nie wymyślaj treści, których nie ma w źródłach.

Uwagi do treści:
- Park Miejski to NIE jeden punkt. Amfiteatr (4 koncerty), fontanna
  (tango i milonga) i okolice Trafo Cafe (cyrk) to trzy osobne
  lokalizacje. Kilka wydarzeń w jednym miejscu = jeden pin, lista
  wydarzeń w panelu.
- Rozwiń wszystkie odwołania "jak wyżej" do pełnej lokalizacji.
- Usuń z opisów notatki robocze organizatorów (urlop osoby
  prowadzącej cyrk, uwaga o pożarach przy premierze WSTYD).
  Zgłoś mi wszystko, co uznasz za notatkę wewnętrzną, zanim usuniesz.
- Opisy są bardzo nierównej długości. Zostaw jak jest, panel ma to
  udźwignąć.

Zdjęcia w zrodla/zdjecia/ nazwane zgodnie z odwołaniami w programie
(biblio1-3, hub1-2, mariani1-3, pchli1-3, pies1-3, sztuki1-3,
obiad1-3, spacer1-3). Napisz tools/zdjecia.js — dłuższy bok 1200 px,
jakość ~80, miniatury 400 px, wynik do img/, nazwy bez polskich
znaków i spacji. Tym samym skryptem obrabiaj grafikę mapy.

Przypisz każdemu wydarzeniu jedną kategorię (muzyka, warsztaty, dzieci i rodziny, jedzenie, sztuka, sąsiedzkie) i dowolną liczbę tagów (pod dachem, z psem, dla dzieci, zapisy, przy jedzeniu, dla seniorów). Przypisania oprzyj na treści opisów, nie na domysłach — przy wątpliwych pokaż mi listę do zatwierdzenia. Kategoria steruje kolorem pinu, tagi filtrami. 

ETAP 2 — KALIBRACJA
Mapa to stylizowana grafika rastrowa (img/mapa-bydgoskie.jpg), nie
jest geograficznie dokładna. NIE przeliczaj GPS na piksele wzorem —
wyjdą przekłamania.

Napisz tools/kalibracja.html: wczytuje grafikę i listę lokalizacji
z danych, pokazuje którą lokalizację ustawiam, po kliknięciu na mapie
zapisuje pozycję jako procent szerokości i wysokości, pozwala poprawić
już ustawione, na końcu eksportuje JSON do wklejenia w dane.
Pozycje w procentach, nigdy w pikselach.

GPS zostaje w danych obok pozycji na mapie — potrzebny do nawigacji
i liczenia czasu przejścia.

ETAP 3 — INTERFEJS
1. Mapa: grafika + piny w HTML/CSS na wierzchu. Wszystkie etykiety
   HTML-em, na grafice nie ma i nie będzie żadnego tekstu. Piny
   klimatyczne, w stylu mapy, z numerem lub ikoną kategorii.
   Pole kliknięcia min. 44 px. Zoom i przesuwanie palcem.
2. Panel wydarzenia: tytuł, godziny, miejsce, opis, zdjęcia
   (miniatura → pełna po kliknięciu), linki zewnętrzne, przycisk
   "prowadź mnie" otwierający nawigację po GPS.
   Filmy tylko jako linki zewnętrzne, żadnego wideo w repo.
3. Planer: zaznaczasz wydarzenia, dostajesz plan ułożony po
   godzinach, zapis w localStorage. Licz czas przejścia między
   kolejnymi punktami: odległość po GPS w linii prostej × 1,3,
   podzielone przez 80 m/min. Ostrzegaj, gdy przejście nie mieści
   się między końcem jednego a początkiem drugiego wydarzenia.
4. Trasa na mapie: łagodny łuk linią kreskowaną, nie prosta.
   Kolejność chronologiczna, nie po odległości.
5. [PUNKT DOJDZIE PÓŹNIEJ — mechanika angażująca. Zostaw na to
   miejsce w strukturze danych i w interfejsie, nie projektuj
   pod komplet funkcji, którego nie znasz.]
6. Sekcja "czego jeszcze nie wiemy" — uczciwie wypisane luki
   w programie. To ma być widoczna funkcja, nie wstyd.

ZASADY
- Mobile first. Ludzie otwierają to jedną ręką, w tłumie, na słabym
  zasięgu, w sierpniowym słońcu. Waga strony i kontrast mają
  znaczenie. Zdjęcia ładowane leniwie.
- Silnik niezależny od święta. Drugie święto (Chełmińskie
  Przedmieście) to podmiana pliku z danymi, grafiki i kalibracji —
  nie nowy projekt. Nazwa, daty, kolory, kategorie i punkty
  siedzą w danych, nie w kodzie.
- Kierunek wizualny zaproponuj sam, pod sąsiedzkie święto dzielnicy
  i pod klimat mapy. Moja domyślna paleta z lab (ciemny cyberpunk,
  #7B2FFF / #22D3EE) tutaj nie pasuje. Fonty systemowe albo
  self-hosted w repo, żadnego Google Fonts.
- Wszystko po polsku, bez wersji językowych.
- Commituj po każdym zaakceptowanym etapie, opisowo.