/**
 * 1. LISTA KSIĄŻEK
 * To jest zwykła tablica obiektów. Każdy obiekt {} to jedna książka.
 */
const myBooks = [
    { title: "Brzydkie Kaczątko", author: "Hans Christian Andersen", filename: "brzydkie-kaczatko.epub" },
    { title: "Calineczka", author: "Hans Christian Andersen", filename: "calineczka.epub" },
    { title: "Doktor Dolittle i Jego Zwierzęta", author: "Hugh Lofting", filename: "doktor-dolittle-i-jego-zwierzeta.epub" },
    { title: "Dziewczynka z Zapałkami", author: "Hans Christian Andersen", filename: "dziewczynka-z-zapalkami.epub" },
    { title: "Fraszki", author: "Ignacy Krasicki", filename: "fraszki.epub" },
    { title: "Katarynka", author: "Bolesław Prus", filename: "katarynka.epub" },
    { title: "Księga Dżungli", author: "Rudyard Kipling", filename: "ksiega-dzungli.epub" },
    { title: "Lalka", author: "Bolesław Prus", filename: "lalka.epub" },
    { title: "Mały Książę", author: "Antoine de Saint-Exupéry", filename: "maly-ksiaze.epub" },
    { title: "Opowieść Wigilijna", author: "Charles Dickens", filename: "opowiesc-wigilijna.epub" },
    { title: "Przedwiośnie", author: "Stefan Żeromski", filename: "przedwiosnie.epub" },
    { title: "Quo Vadis", author: "Henryk Sienkiewicz", filename: "quo-vadis.epub" },
    { title: "Szatan z Siódmej Klasy", author: "Kornel Makuszyński", filename: "szatan-z-siodmej-klasy.epub" },
    { title: "Tajemniczy Ogród", author: "Frances Hodgson Burnett", filename: "tajemniczy-ogrod.epub" },
    { title: "Wesele", author: "Stanisław Wyspiański", filename: "wesele.epub" },
    { title: "Zemsta", author: "Aleksander Fredro", filename: "zemsta.epub" }
];

/**
 * POBIERANIE ELEMENTÓW Z HTML
 * Tutaj tworzymy "uchwyty" do elementów na stronie, żeby móc nimi sterować.
 */
const bookList = document.getElementById('book-list');
const libraryHome = document.getElementById('library-home');
const readerView = document.getElementById('reader-view');
const outputContent = document.getElementById('output-content');
const epubViewer = document.getElementById('epub-viewer');
const readerNav = document.getElementById('reader-nav');
const currentReadingTitle = document.getElementById('current-reading-title');
const pageCounter = document.getElementById('page-counter');
const themeToggle = document.getElementById('theme-toggle');
const searchInput = document.getElementById('search-input');

// Zmienne pomocnicze do przechowywania aktualnie otwartej książki
let currentRendition = null;
let currentBook = null;

/**
 * 2. INICJALIZACJA BIBLIOTEKI
 */

// Funkcja, która tworzy "kartki" z książkami na ekranie
function displayBooks(booksToDisplay) {
    // Jeśli nie podano konkretnej listy, używamy domyślnej listy wszystkich książek
    if (booksToDisplay === undefined) {
        booksToDisplay = myBooks;
    }

    // Czyścimy listę przed ponownym rysowaniem
    bookList.innerHTML = "";

    // Pętla, która przechodzi przez każdą książkę po kolei
    for (let i = 0; i < booksToDisplay.length; i++) {
        const book = booksToDisplay[i];
        
        // Tworzymy nowy element DIV dla każdej książki
        const card = document.createElement('div');
        card.className = 'book-card';
        
        // Budujemy zawartość karty (tytuł i autor)
        card.innerHTML = '<div>' +
                            '<h3>' + book.title + '</h3>' +
                            '<p class="author-label">' + book.author + '</p>' +
                         '</div>' +
                         '<span class="read-badge">Czytaj 📖</span>';
        
        // Co się stanie po kliknięciu w książkę?
        card.onclick = function() {
            // Szukamy numeru (indeksu) tej konkretnej książki w głównej liście
            const realIndex = myBooks.indexOf(book);
            openBook(realIndex);
        };
        
        // Dodajemy gotową kartę do listy na stronie
        bookList.appendChild(card);
    }
}

// Funkcja wyszukiwarki
function searchBooks() {
    // Pobieramy to, co użytkownik wpisał w pole wyszukiwania
    const query = searchInput.value.toLowerCase().trim();
    
    if (query === "") {
        // Jeśli pole jest puste, pokazujemy wszystko
        displayBooks(myBooks);
    } else {
        // Jeśli coś wpisano, filtrujemy listę
        const filtered = [];
        for (let i = 0; i < myBooks.length; i++) {
            const book = myBooks[i];
            const titleMatch = book.title.toLowerCase().indexOf(query) !== -1;
            const authorMatch = book.author.toLowerCase().indexOf(query) !== -1;
            
            if (titleMatch || authorMatch) {
                filtered.push(book);
            }
        }
        displayBooks(filtered);
    }
}

// Funkcja startowa, która uruchamia bibliotekę
function initLibrary() {
    displayBooks(myBooks);
    // Nasłuchujemy, czy użytkownik coś wpisuje w wyszukiwarkę
    searchInput.addEventListener('input', searchBooks);
}

// Funkcja otwierająca czytnik po kliknięciu w książkę
function openBook(index) {
    const book = myBooks[index];
    
    // Przełączamy widoki (ukrywamy bibliotekę, pokazujemy czytnik)
    libraryHome.classList.add('hidden');
    readerView.classList.remove('hidden');
    currentReadingTitle.innerText = book.title;
    
    // Przygotowanie miejsca na tekst
    outputContent.innerText = "Przygotowywanie tekstu...";
    outputContent.classList.remove('hidden');
    epubViewer.classList.add('hidden');
    readerNav.classList.add('hidden');
    pageCounter.innerText = "Wczytywanie...";
    epubViewer.innerHTML = "";

    // Sprawdzamy, czy plik to .epub (wyciągamy rozszerzenie z nazwy pliku)
    const fileNameParts = book.filename.split('.');
    const ext = fileNameParts[fileNameParts.length - 1].toLowerCase();

    if (ext === 'epub') {
        loadEPUB(book.filename);
    } else {
        // Jeśli to nie EPUB, próbujemy wczytać to jako zwykły tekst
        fetch(book.filename)
            .then(function(res) {
                if (!res.ok) {
                    throw new Error("Błąd sieci");
                }
                return res.text();
            })
            .then(function(text) {
                outputContent.innerText = text;
                window.scrollTo(0,0);
            })
            .catch(function(err) {
                outputContent.innerText = "Błąd: Brak pliku " + book.filename + " w folderze.";
            });
    }
}

/**
 * 3. OBSŁUGA EPUB (przy pomocy biblioteki epub.js)
 */
function loadEPUB(url) {
    // Ukrywamy kontener na zwykły tekst, pokazujemy czytnik EPUB i nawigację
    outputContent.classList.add('hidden');
    epubViewer.classList.remove('hidden');
    readerNav.classList.remove('hidden');
    
    // Tworzymy nową instancję książki
    currentBook = ePub(url);
    
    // Przygotowujemy "renderowanie" (wyświetlanie) w divie o id "epub-viewer"
    currentRendition = currentBook.renderTo("epub-viewer", {
        width: "100%",
        height: "100%",
        flow: "paginated", // Strony obok siebie, a nie jedna długa lista
        manager: "default"
    });

    // Wyświetlamy książkę
    currentRendition.display().then(function() {
        applyEpubTheme(); // Dopasowujemy kolory (jasny/ciemny)
        updatePageCounter(); // Aktualizujemy informację o stronie
    });

    // Za każdym razem, gdy użytkownik zmieni stronę, aktualizujemy licznik
    currentRendition.on("relocated", function() {
        updatePageCounter();
    });
}

// Prosta funkcja aktualizująca informację o tym, gdzie jesteśmy w książce
function updatePageCounter() {
    if (currentRendition && currentRendition.location) {
        const loc = currentRendition.location.start;
        // loc.index to numer rozdziału/sekcji
        pageCounter.innerText = "Postęp: sekcja " + (loc.index + 1);
    }
}

// Funkcja dbająca o to, by książka miała kolory takie same jak reszta strony
function applyEpubTheme() {
    if (currentRendition === null) {
        return;
    }

    const isDark = document.body.classList.contains('dark-theme');
    let bgColor = "#ffffff";
    let textColor = "#1c1c1e";

    if (isDark === true) {
        bgColor = "#1c1c1e";
        textColor = "#f2f2f7";
    }

    // "Wstrzykujemy" style CSS bezpośrednio do środka książki
    currentRendition.themes.register("custom", {
        body: { 
            "background": bgColor + " !important", 
            "color": textColor + " !important",
            "font-size": "18px !important"
        }
    });
    currentRendition.themes.select("custom");
}

/**
 * 4. STEROWANIE I MOTYW
 */

// Przyciski następna/poprzednia strona
document.getElementById('next-page').onclick = function() {
    if (currentRendition) {
        currentRendition.next();
    }
};

document.getElementById('prev-page').onclick = function() {
    if (currentRendition) {
        currentRendition.prev();
    }
};

// Powrót z czytnika do listy książek
function closeReader() {
    libraryHome.classList.remove('hidden');
    readerView.classList.add('hidden');
    if (currentBook) {
        currentBook.destroy(); // Zwalniamy pamięć
        currentBook = null;
        currentRendition = null;
    }
}

// Przełącznik trybu nocnego
themeToggle.onclick = function() {
    // Przełączamy klasy na elemencie body
    const isNowDark = document.body.classList.toggle('dark-theme');
    document.body.classList.toggle('light-theme');
    
    // Zmieniamy napis na przycisku
    if (isNowDark === true) {
        themeToggle.innerText = "☀️ Tryb Dzienny";
    } else {
        themeToggle.innerText = "🌙 Tryb Nocny";
    }
    
    // Aktualizujemy też kolory wewnątrz otwartej książki
    applyEpubTheme();
};

// Na samym końcu uruchamiamy naszą bibliotekę
initLibrary();
