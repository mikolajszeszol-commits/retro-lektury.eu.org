var book;
var rendition;

function zaladujKsiazke(nazwaPliku) {
    // Ukrywamy listę lektur, pokazujemy czytnik
    document.getElementById('library-home').style.display = 'none';
    document.getElementById('reader-view').style.display = 'block';
    document.getElementById('viewer').innerHTML = ''; // Czyścimy stare okno

    // Ładujemy plik (GitHub sam dopasuje ścieżkę do folderu docs)
    book = ePub(nazwaPliku);
    rendition = book.renderTo("viewer", {
        width: "100%",
        height: "100%",
        flow: "paginated"
    });

    rendition.display().catch(err => {
        console.error("Błąd:", err);
        alert("Nie można załadować pliku: " + nazwaPliku + ". Sprawdź czy nazwa pliku na GitHubie jest identyczna.");
    });
}

function zamknijCzytnik() {
    document.getElementById('library-home').style.display = 'block';
    document.getElementById('reader-view').style.display = 'none';
}

function poprzednia() { if (rendition) rendition.prev(); }
function nastepna() { if (rendition) rendition.next(); }
