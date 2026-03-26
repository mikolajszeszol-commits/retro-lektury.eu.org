/**
 * 1. LISTA KSIĄŻEK (Tylko domena publiczna)
 */
const myBooks = [
    { title: "Lalka", author: "Bolesław Prus", filename: "lalka.epub" },
    { title: "Wesele", author: "Stanisław Wyspiański", filename: "wesele.epub" },
    { title: "Quo Vadis", author: "Henryk Sienkiewicz", filename: "quo-vadis.epub" },
    { title: "Zemsta", author: "Aleksander Fredro", filename: "zemsta.epub" },
    { title: "Katarynka", author: "Bolesław Prus", filename: "katarynka.epub" },
    { title: "Przedwiośnie", author: "Stefan Żeromski", filename: "przedwiosnie.epub" },
    { title: "Brzydkie Kaczątko", author: "Hans Christian Andersen", filename: "brzydkie-kaczatko.epub" },
    { title: "Mały Książę", author: "Antoine de Saint-Exupéry", filename: "maly-ksiaze.epub" },
    { title: "Calineczka", author: "Hans Christian Andersen", filename: "calineczka.epub" },
    { title: "Dziewczynka z Zapałkami", author: "Hans Christian Andersen", filename: "dziewczynka-z-zapalkami.epub" },
    { title: "Opowieść Wigilijna", author: "Charles Dickens", filename: "opowiesc-wigilijna.epub" },
    { title: "Fraszki", author: "Ignacy Krasicki", filename: "fraszki.epub" },
    { title: "Doktor Dolittle i Jego Zwierzęta", author: "Hugh Lofting", filename: "doktor-dolittle-i-jego-zwierzeta.epub" },
    { title: "Księga Dżungli", author: "Rudyard Kipling", filename: "ksiega-dzungli.epub" },
    { title: "Szatan z Siódmej Klasy", author: "Kornel Makuszyński", filename: "szatan-z-siodmej-klasy.epub" },
    { title: "Tajemniczy Ogród", author: "Frances Hodgson Burnett", filename: "tajemniczy-ogrod.epub" }
];

const bookList = document.getElementById('book-list');
const libraryHome = document.getElementById('library-home');
const readerView = document.getElementById('reader-view');
const outputContent = document.getElementById('output-content');
const epubViewer = document.getElementById('epub-viewer');
const readerNav = document.getElementById('reader-nav');
const currentReadingTitle = document.getElementById('current-reading-title');
const pageCounter = document.getElementById('page-counter');
const themeToggle = document.getElementById('theme-toggle');

let currentRendition = null;
let currentBook = null;

/**
 * 2. INICJALIZACJA BIBLIOTEKI
 */
function initLibrary() {
    bookList.innerHTML = "";
    myBooks.forEach((book, index) => {
        const card = document.createElement('div');
        card.className = 'book-card';
        card.innerHTML = `
            <div>
                <h3>${book.title}</h3>
                <p class="author-label">${book.author}</p>
            </div>
            <span class="read-badge">Czytaj 📖</span>
        `;
        card.onclick = () => openBook(index);
        bookList.appendChild(card);
    });
}

async function openBook(index) {
    const book = myBooks[index];
    libraryHome.classList.add('hidden');
    readerView.classList.remove('hidden');
    currentReadingTitle.innerText = book.title;
    
    // Reset widoku
    outputContent.innerText = "Przygotowywanie tekstu...";
    outputContent.classList.remove('hidden');
    epubViewer.classList.add('hidden');
    readerNav.classList.add('hidden');
    pageCounter.innerText = "Wczytywanie...";
    epubViewer.innerHTML = "";

    const ext = book.filename.split('.').pop().toLowerCase();

    try {
        if (ext === 'epub') {
            loadEPUB(book.filename);
        } else {
            const res = await fetch(book.filename);
            if(!res.ok) throw new Error();
            outputContent.innerText = await res.text();
            window.scrollTo(0,0);
        }
    } catch (err) {
        outputContent.innerText = "Błąd: Brak pliku " + book.filename + " w folderze.";
    }
}

/**
 * 3. OBSŁUGA EPUB
 */
function loadEPUB(url) {
    outputContent.classList.add('hidden');
    epubViewer.classList.remove('hidden');
    readerNav.classList.remove('hidden');
    
    currentBook = ePub(url);
    currentRendition = currentBook.renderTo("epub-viewer", {
        width: "100%",
        height: "100%",
        flow: "paginated",
        manager: "default"
    });

    currentRendition.display().then(() => {
        applyEpubTheme();
        updatePageCounter();
    });

    currentRendition.on("relocated", () => {
        updatePageCounter();
    });
}

function updatePageCounter() {
    if (currentRendition && currentRendition.location) {
        const loc = currentRendition.location.start;
        // Prosty licznik bazujący na indeksie rozdziału
        pageCounter.innerText = `Postęp: sekcja ${loc.index + 1}`;
    }
}

function applyEpubTheme() {
    if (!currentRendition) return;
    const isDark = document.body.classList.contains('dark-theme');
    const bgColor = isDark ? "#1c1c1e" : "#ffffff";
    const textColor = isDark ? "#f2f2f7" : "#1c1c1e";

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
document.getElementById('next-page').addEventListener('click', () => {
    if (currentRendition) currentRendition.next();
});

document.getElementById('prev-page').addEventListener('click', () => {
    if (currentRendition) currentRendition.prev();
});

function closeReader() {
    libraryHome.classList.remove('hidden');
    readerView.classList.add('hidden');
    if(currentBook) {
        currentBook.destroy();
        currentRendition = null;
    }
}

themeToggle.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark-theme');
    document.body.classList.toggle('light-theme');
    themeToggle.innerText = isDark ? "☀️ Tryb Jasny" : "🌙 Tryb Nocny";
    applyEpubTheme();
});

initLibrary();