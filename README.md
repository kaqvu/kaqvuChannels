\# 📺 kaqvuChannels



> \*\*Autor:\*\* kaqvu



Repozytorium zawierające stronę internetową z dostępem do kanałów sportowych.



\## 🚀 Uruchomienie projektu



\### Wymagania

\- Node.js (zalecana wersja LTS)

\- npm (Node Package Manager)



\### Instalacja i uruchomienie



1\. \*\*Otwórz terminal\*\*

&nbsp;  ```bash

&nbsp;  # W systemie Windows użyj PowerShell lub CMD

&nbsp;  # W systemie Linux/Mac użyj domyślnego terminala

&nbsp;  ```



2\. \*\*Zainstaluj zależności\*\*

&nbsp;  ```bash

&nbsp;  npm install

&nbsp;  ```



3\. \*\*Uruchom serwer\*\*

&nbsp;  ```bash

&nbsp;  npm start

&nbsp;  ```



4\. \*\*Otwórz przeglądarkę\*\*

&nbsp;  

&nbsp;  Aplikacja będzie dostępna pod adresem: `http://localhost:3000` (lub innym portem wskazanym w terminalu)



\## 📁 Struktura projektu



```

kaqvuChannels/

│

├── public/                  # Pliki publiczne strony głównej

│   ├── directblock.css      # Style dla blokady bezpośredniego dostępu

│   ├── directblock.html     # Strona blokady bezpośredniego dostępu

│   ├── favicon.ico          # Ikona strony

│   ├── firebase-configure.js # Konfiguracja Firebase

│   ├── index.html           # Główna strona aplikacji

│   ├── script.js            # Główny skrypt JavaScript

│   └── styles.css           # Główne style CSS

│

├── channels/                # Sekcja kanałów sportowych

│   ├── index.html           # Strona z listą kanałów

│   └── script.js            # Skrypt obsługi kanałów

│

├── package.json             # Konfiguracja projektu i zależności

├── server.js                # Serwer Node.js

└── vercel.json              # Konfiguracja deploymentu na Vercel

```



\## 🔧 Technologie



\- \*\*Frontend\*\*: HTML, CSS, JavaScript

\- \*\*Backend\*\*: Node.js

\- \*\*Database/Auth\*\*: Firebase

\- \*\*Hosting\*\*: Vercel (opcjonalnie)



\## 📝 Dodatkowe informacje



Projekt wykorzystuje Firebase do konfiguracji i może być hostowany na platformie Vercel. Zawiera mechanizm blokady bezpośredniego dostępu do niektórych zasobów.



---



© 2025 kaqvuChannels. All rights reserved.

