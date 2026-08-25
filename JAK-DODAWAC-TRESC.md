# Jak dopisywać treść

Krótko: **wrzucasz pliki do `zrodla/nowe/<identyfikator-wydarzenia>/`
i mówisz mi, że coś doszło.** Reszta to szczegóły.

## Zasada: jeden folder na wydarzenie

```
zrodla/nowe/
  mariani-band/
    opis.txt          <- wklejony opis, zwykły tekst
    IMG_4471.jpg      <- zdjęcia, nazwy bez znaczenia
    IMG_4488.jpg
  ale-cyrk/
    opis.txt
```

Nazwa folderu musi być identyfikatorem z tabeli niżej — po niej wiem,
do czego to podpiąć. Nazwy samych zdjęć nie mają znaczenia, przepuszczę
je przez `tools/zdjecia.js`, który zrobi wersję 1200 px i miniaturę,
i nada nazwy bez polskich znaków.

`zrodla/` jest w `.gitignore`, więc oryginały nie trafiają do repozytorium
— do niego idzie dopiero przetworzony wynik.

## Czego NIE robić

**Nie edytuj `dane/bydgoskie.js` ręcznie**, chyba że jesteś pewny.
To plik JavaScriptu: apostrof w środku polskiego tekstu („Domkultury'")
albo zgubiony przecinek gasi całą stronę — bez komunikatu, po prostu
biała plansza.

Jeśli już coś tam poprawisz, uruchom przed publikacją:

```
node tools/sprawdz.js
```

Sprawdza składnię, brakujące zdjęcia, literówki w kategoriach i tagach,
godziny, adresy linków i to, czy piny mieszczą się w wycinku mapy.
Kod wyjścia 1, gdy coś jest nie tak.

## Uwaga o opisach

Wklejaj tekst taki, jaki przyszedł od organizatorów. Nie poprawiam
za nich treści — poprawiam tylko literówki, i za każdym razem mówię
które. Jeśli czegoś nie wiadomo, zostaje pusto i trafia do sekcji
„czego jeszcze nie wiemy", zamiast być zmyślone.

### Sobota 29.08.2026

| identyfikator | wydarzenie | czego brakuje |
|---|---|---|
| `butik-sobota` | XVII Święto Bydgoskiego Przedmieścia z „Naszym But… | zdjęć |
| `gramy-i-odkrywamy` | GraMY i OdkrywaMy (planszówki, strefa Uniwersytetu… | zdjęć |
| `biblioteka-dzien-otwarty` | Dzień otwarty w Bibliotece | opisu |
| `kofeina-sobota` | Kofeina dla starszaków z Trafo Cafe | opisu, zdjęć |
| `fantastyczny-hub` | Fantastyczny Hub (w programie: gry, warsztaty, kon… | opisu |
| `biblioteka-rewolucyjna-dzien-otwarty` | Dzień Otwarty — Biblioteka Rewolucyjna | opisu, zdjęć |
| `warsztaty-ziny` | Warsztaty z robienia zinów | opisu, zdjęć, godziny końca |
| `mariani-band` | Mariani Band — koncert | opisu |
| `dotkniete-sloncem` | DOTKNIĘTE SŁOŃCEM / Piotr Frąckiewicz / cyjanotypi… | zdjęć |
| `recital-kinga-michalak` | Recital Kingi Michalak — Piosenki, które łączą pok… | zdjęć, godziny końca |
| `ribaldi-music` | Ribaldi Music — koncert | opisu, zdjęć, godziny końca |
| `pani-jeziora` | Pani Jeziora feat. Albert Piotrowski-Pawlikowski —… | zdjęć, godziny końca |
| `wstyd-koncert` | WSTYD feat. Wanda Waiss — koncert | zdjęć, godziny końca |

### Niedziela 30.08.2026

| identyfikator | wydarzenie | czego brakuje |
|---|---|---|
| `kawka-za-kantem` | cafe za KANTem — kawka dla mieszkańców na podwórku | opisu, zdjęć |
| `butik-niedziela` | XVII Święto Bydgoskiego Przedmieścia z „Naszym But… | zdjęć |
| `pchli-targ` | Pchli Targ na Bydgoskim | — |
| `kofeina-niedziela` | Kofeina dla starszaków z Trafo Cafe | opisu, zdjęć |
| `wyprowadz-psa` | Bydgoskie Świętuje — Akcja Wyprowadź psa | opisu |
| `festyn-garazowka` | Festyn Rodzinny — Garażówka z Hubem | opisu, zdjęć |
| `moja-okolica-w-sztuce` | Moja okolica w sztuce — warsztaty w ramach projekt… | — |
| `ale-cyrk` | Ale cyrk! — warsztaty cyrkowe | opisu, zdjęć |
| `gastrorakieta` | Gastrorakieta, czyli UCZTA na Bydgoskim! | godziny końca |
| `lekcja-tanga` | Otwarta lekcja tanga argentyńskiego | zdjęć, godziny końca |
| `spacer-modernistyczny` | Nie wszystko złoto, co ma gzyms — modernistyczny s… | godziny końca |
| `milonga` | Milonga Mercurio Aires — tańczymy tango | zdjęć, godziny końca |
| `connected-by-midi` | CONNECTED by MIDI — showcase toruńskiej muzyki ele… | zdjęć |
| `premiera-teledysku-wstyd` | Premiera teledysku zespołu WSTYD + koncert — Muzyk… | opisu, zdjęć, godziny końca |


---

Tabela wyżej jest generowana z danych — po każdej większej zmianie
poproś, żebym ją odświeżył.
