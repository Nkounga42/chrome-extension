const links = [
  { name: "Le monde", url: "https://www.lemonde.fr" },
  { name: "Pinterest", url: "https://www.pinterest.com" },
  { name: "SoundCloud", url: "https://soundcloud.com" },
  {
    name: "OpenClassrooms",
    url: "https://openclassrooms.com/fr/dashboard/courses",
  },
  { name: "Duolingo", url: "https://www.duolingo.com" },
  { name: "GitHub", url: "https://www.github.com" },
  { name: "YouTube", url: "https://www.youtube.com" },
  { name: "Twitter", url: "https://www.twitter.com" },
  { name: "Instagram", url: "https://www.instagram.com" },
  { name: "Facebook", url: "https://www.facebook.com" },
  { name: "Stack Overflow", url: "https://stackoverflow.com" },
  { name: "Reddit", url: "https://www.reddit.com" },
  { name: "Wikipedia", url: "https://www.wikipedia.org" },
  { name: "Amazon", url: "https://www.amazon.com" },
  { name: "LinkedIn", url: "https://www.linkedin.com" },
  { name: "Netflix", url: "https://www.netflix.com" },
  { name: "Spotify", url: "https://www.spotify.com" },
  { name: "Google", url: "https://www.google.com" },
  { name: "Twitch", url: "https://www.twitch.tv" },
  { name: "YouTube Music", url: "https://music.youtube.com" },
  { name: "Vimeo", url: "https://www.vimeo.com" },
  { name: "Dropbox", url: "https://www.dropbox.com" },
  { name: "Trello", url: "https://www.trello.com" },
  { name: "Slack", url: "https://www.slack.com" },
  { name: "Quora", url: "https://www.quora.com" },
  { name: "Medium", url: "https://www.medium.com" },
  { name: "Wikipedia en français", url: "https://fr.wikipedia.org" },
  { name: "Etsy", url: "https://www.etsy.com" },
  { name: "Airbnb", url: "https://www.airbnb.com" },
  { name: "Coursera", url: "https://www.coursera.org" },
  { name: "Udemy", url: "https://www.udemy.com" },
  { name: "GitLab", url: "https://www.gitlab.com" },
  { name: "Bing", url: "https://www.bing.com" },
  { name: "IMDB", url: "https://www.imdb.com" },
  { name: "Flickr", url: "https://www.flickr.com" },
  { name: "Zoom", url: "https://www.zoom.us" },
];

const googleServicesContainer = document.getElementById(
  "google-services-container"
);
const validerModalBtn = document.getElementById("validerModal");
const annulerModalBtn = document.getElementById("annulerModal");
const ouvrirModalBtn = document.getElementById("ouvrirModal");
const parentElement = document.getElementById("tiles-container");
const toggleButton = document.getElementById("toggle-button");
const editableLink = document.getElementById("editableLink");
const searchButton = document.getElementById("search-button");
const clearButton = document.getElementById("clear-button");
const searchInput = document.getElementById("search-input");
const modal = document.getElementById("modal");
const confirmDeleteModal = document.getElementById("confirmDeleteModal");
const cancelDeleteBtn = document.getElementById("cancelDelete");
const confirmDeleteBtn = document.getElementById("confirmDelete");
let isActive = false;
let itemToDelete = null;
let selectedIndex = -1; // Aucune sélection au début
let currentMatches = []; // Stocker les suggestions actuelles

document.addEventListener("DOMContentLoaded", async function () {
  // Attendre un peu que l'extension soit complètement chargée
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Vérifier et effectuer la migration si nécessaire
  try {
    const migrationCompleted = await storageManager.isMigrationCompleted();
    if (!migrationCompleted) {
      await storageManager.migrateFromLocalStorage();
    }
  } catch (error) {
    console.error('❌ Erreur lors de la vérification de migration:', error);
  }

  // Charger les favoris sauvegardés au démarrage
  const savedFavorites = await storageManager.loadFavorites();

  // Si aucun favori sauvegardé, charger les favoris par défaut
  if (savedFavorites.length === 0) {
    links.forEach((link, index) => {
      if (index <= 5) {
        parentElement.appendChild(createItem(link.url));
      }
    });
    // Sauvegarder les favoris par défaut
    await saveFavoritesToStorage();
  } else {
    savedFavorites.forEach((url) => {
      parentElement.appendChild(createItem(url));
    });
  }

  // Charger le moteur de recherche sauvegardé
  await loadSearchEngineSettings();
  
  // Charger les paramètres IA sauvegardés
  await loadAiSettings();

  // Charger aussi les favoris par défaut si besoin
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.bookmarks.getTree(function (bookmarkTreeNodes) {
      processBookmarks(bookmarkTreeNodes, parentElement);
    });
  });

  chrome.history.search({ text: "" }, function (data) {
    data.forEach((page) => {
      links.push({ name: page.title, url: page.url });
    });
  });
});

function processBookmarks(bookmarkNodes, parentElement) {
  bookmarkNodes.forEach((node) => {
    if (node.url) {
      links.push({ name: node.title, url: node.url });
      //parentElement.appendChild(createItem(node.url));
    } else if (node.children) {
      // Si c'est un dossier, traiter ses enfants récursivement
      processBookmarks(node.children, parentElement);
    }
  });
}
// Chargement des favoris par défaut si aucun favori n'existe (géré dans DOMContentLoaded)
// Cette section sera exécutée après le chargement des favoris sauvegardés

// Fonction pour extraire le domaine d'une URL
function extractDomain(input) {
  try {
    let url = input;
    if (!input.startsWith("http://") && !input.startsWith("https://")) {
      url = "https://" + input;
    }
    const parsedUrl = new URL(url);
    let domain = parsedUrl.hostname;

    // Supprimer "www." s'il est présent
    if (domain.startsWith("www.")) {
      domain = domain.substring(4);
    }

    // Mettre la première lettre du domaine en majuscule
    domain = domain[0].toUpperCase() + domain.slice(1);
    return domain;
  } catch (error) {
    console.error(error);
  }
}

// Fonction pour récupérer l'URL du favicon
function getFaviconUrl(siteUrl) {
  try {
    if (!siteUrl.startsWith("http://") && !siteUrl.startsWith("https://")) {
      siteUrl = "https://" + siteUrl;
    }
    const urlObject = new URL(siteUrl);
    const domain = urlObject.origin;
    return `https://www.google.com/s2/favicons?domain=${domain}`;
  } catch (error) {
    console.error("Erreur lors de la récupération du favicon:", error);
    return "https://i.pinimg.com/1200x/2a/5f/98/2a5f984db51153de46dc3c92e0355f20.jpg"; // Favicon par défaut en cas d'erreur
  }
}

// Lorsque le DOM est prêt
document.addEventListener("DOMContentLoaded", function () {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.bookmarks.getTree(function (bookmarkTreeNodes) {
      const parentElement = document.getElementById("tiles-container");
      processBookmarks(bookmarkTreeNodes, parentElement);
    });
  });
});

const suggestionsContainer = document.createElement("div");
suggestionsContainer.className = "autocomplete-suggestions";

let autocompleteContainer = document.getElementById("autocomplete-container");

autocompleteContainer.appendChild(suggestionsContainer);

// Autocomplétion
searchInput.addEventListener("input", function (e) {
  const input = e.target.value.trim().toLowerCase();
  suggestionsContainer.innerHTML = "";
  selectedIndex = -1; // Réinitialise la sélection
  if (input.length > 0) {
    clearButton.style.opacity = "1";
    currentMatches = links
      .filter(
        (item) =>
          item.name.toLowerCase().includes(input) ||
          item.url.toLowerCase().includes(input)
      )
      .slice(0, 5); // max 5 suggestions

    currentMatches.forEach((match, index) => {
      const suggestion = document.createElement("div");
      suggestion.className = "suggestion-item";
      suggestion.dataset.index = index; // important pour retrouver l'élément
      suggestion.title = match.url.replace(/^https?:\/\//, "");
      suggestion.innerHTML = `
        <img src="${getFaviconUrl(match.url)}" alt="${match.name}">
        <span>${match.name}</span> 
      `;

      suggestion.addEventListener("click", () => {
        searchInput.value = match.url;
        submitForm(match.url);
        suggestionsContainer.style.display = "none";
      });

      suggestionsContainer.appendChild(suggestion);
    });

    suggestionsContainer.style.opacity = 1;
    suggestionsContainer.style.display = currentMatches.length
      ? "block"
      : "none";
    parentElement.style.opacity = 0;
  } else {
    clearButton.style.opacity = 0;
    suggestionsContainer.style.opacity = 0;
    setTimeout(() => {
      suggestionsContainer.style.display = "none";
    }, 1000);
    parentElement.style.opacity = 1;
  }
});
searchInput.addEventListener("keydown", function (e) {
  if (e.key === "ArrowDown") {
    if (currentMatches.length > 0) {
      selectedIndex = (selectedIndex + 1) % currentMatches.length;
      updateSelection();
    }
    e.preventDefault();
  } else if (e.key === "ArrowUp") {
    if (currentMatches.length > 0) {
      selectedIndex =
        (selectedIndex - 1 + currentMatches.length) % currentMatches.length;
      updateSelection();
    }
    e.preventDefault();
  } else if (e.key === "Enter") {
    if (selectedIndex >= 0 && currentMatches[selectedIndex]) {
      const selected = currentMatches[selectedIndex];
      suggestionsContainer.style.display = "none";
      window.open(selected.url);
      searchInput.value = extractDomain(selected.url);
    } else {
      let target = e.target.value.trim().toLowerCase();
      submitForm(target);
    }
  }
});

// Quand on clique sur le bouton, on vide l'input
clearButton.addEventListener("click", () => {
  searchInput.value = "";
  clearButton.style.opacity = 0;
  searchInput.focus();
});

function updateSelection() {
  const items = suggestionsContainer.querySelectorAll(".suggestion-item");
  items.forEach((item, index) => {
    if (index === selectedIndex) {
      item.classList.add("selected");
    } else {
      item.classList.remove("selected");
    }
  });
}

// Cache les suggestions quand on clique ailleurs

searchButton.addEventListener("click", function () {
  let target = searchInput.value.trim().toLowerCase();
  submitForm(target);
});

// Configuration des moteurs de recherche
const searchEngines = {
  google: "https://www.google.com/search?q=",
  bing: "https://www.bing.com/search?q=",
  duckduckgo: "https://duckduckgo.com/?q=",
  yahoo: "https://search.yahoo.com/search?p=",
  ecosia: "https://www.ecosia.org/search?q=",
  startpage: "https://www.startpage.com/sp/search?query=",
  qwant: "https://www.qwant.com/?q="
};

// Configuration des assistants IA
const aiEngines = {
  chatgpt: "https://chat.openai.com/?q=",
  claude: "https://claude.ai/chat?q=",
  gemini: "https://gemini.google.com/app?q=",
  copilot: "https://copilot.microsoft.com/?q=",
  perplexity: "https://www.perplexity.ai/search?q=",
  you: "https://you.com/search?q=",
  phind: "https://www.phind.com/search?q="
};

function submitForm(target) {
  if (target.startsWith("http://") || target.startsWith("https://")) {
    window.open(target, "_blank"); // Ouvre les URLs complètes dans un nouvel onglet
  } else if (target.startsWith("www.")) {
    window.open("https://" + target, "_blank"); // Ouvre les www. dans un nouvel onglet
  } else if (target.length > 0) {
    // Vérifier si le mode IA est activé
    const isAiModeEnabled = getAiModeStatus();
    
    if (isAiModeEnabled) {
      // Utiliser l'assistant IA sélectionné
      const selectedAi = getSelectedAiEngine();
      const aiUrl = getAiUrl(selectedAi, target);
      window.open(aiUrl, "_blank"); // Ouvrir l'IA dans un nouvel onglet
    } else {
      // Utiliser le moteur de recherche sélectionné
      const selectedEngine = getSelectedSearchEngine();
      const searchUrl = searchEngines[selectedEngine] + encodeURIComponent(target);
      window.location.href = searchUrl;
    }
  }
}

// Fonction pour récupérer le moteur de recherche sélectionné
function getSelectedSearchEngine() {
  const searchEngineSelect = document.getElementById("search-engine-select");
  return searchEngineSelect ? searchEngineSelect.value : "google";
}

// Fonction pour récupérer l'assistant IA sélectionné
function getSelectedAiEngine() {
  const aiEngineSelect = document.getElementById("ai-engine-select");
  return aiEngineSelect ? aiEngineSelect.value : "chatgpt";
}

// Fonction pour vérifier si le mode IA est activé
function getAiModeStatus() {
  const aiModeToggle = document.getElementById("ai-mode-toggle");
  return aiModeToggle ? aiModeToggle.checked : false;
}

// Fonction pour générer l'URL de l'assistant IA
function getAiUrl(aiEngine, query) {
  const baseUrls = {
    chatgpt: "https://chat.openai.com/",
    claude: "https://claude.ai/",
    gemini: "https://gemini.google.com/app",
    copilot: "https://copilot.microsoft.com/",
    perplexity: "https://www.perplexity.ai/search?q=" + encodeURIComponent(query),
    you: "https://you.com/search?q=" + encodeURIComponent(query),
    phind: "https://www.phind.com/search?q=" + encodeURIComponent(query)
  };
  
  // Pour certains assistants, on ne peut pas passer directement la query dans l'URL
  // donc on ouvre juste la page principale
  if (["chatgpt", "claude", "gemini", "copilot"].includes(aiEngine)) {
    return baseUrls[aiEngine];
  }
  
  return baseUrls[aiEngine] || baseUrls.chatgpt;
}

// Fonction pour sauvegarder le moteur de recherche sélectionné
async function saveSearchEngineSettings() {
  const selectedEngine = getSelectedSearchEngine();
  const settings = await storageManager.loadSettings();
  settings.searchEngine = selectedEngine;
  await storageManager.saveSettings(settings);
  console.log('💾 Moteur de recherche sauvegardé:', selectedEngine);
}

// Fonction pour charger les paramètres du moteur de recherche
async function loadSearchEngineSettings() {
  try {
    const settings = await storageManager.loadSettings();
    const savedEngine = settings.searchEngine || 'google';
    
    const searchEngineSelect = document.getElementById("search-engine-select");
    if (searchEngineSelect) {
      searchEngineSelect.value = savedEngine;
      
      // Ajouter l'événement de changement
      searchEngineSelect.addEventListener('change', saveSearchEngineSettings);
      
      console.log('✅ Moteur de recherche chargé:', savedEngine);
    }
  } catch (error) {
    console.error('❌ Erreur chargement moteur de recherche:', error);
  }
}

// Fonction pour sauvegarder les paramètres IA
async function saveAiSettings() {
  const selectedAi = getSelectedAiEngine();
  const aiModeEnabled = getAiModeStatus();
  const settings = await storageManager.loadSettings();
  
  settings.aiEngine = selectedAi;
  settings.aiModeEnabled = aiModeEnabled;
  
  await storageManager.saveSettings(settings);
  
  // Mettre à jour l'indicateur IA et le placeholder
  updateAiIndicator();
  updateSearchPlaceholder();
  
  console.log('🤖 Paramètres IA sauvegardés:', { engine: selectedAi, enabled: aiModeEnabled });
}

// Fonction pour charger les paramètres IA
async function loadAiSettings() {
  try {
    const settings = await storageManager.loadSettings();
    const savedAi = settings.aiEngine || 'chatgpt';
    const aiModeEnabled = settings.aiModeEnabled || false;
    
    const aiEngineSelect = document.getElementById("ai-engine-select");
    const aiModeToggle = document.getElementById("ai-mode-toggle");
    
    if (aiEngineSelect) {
      aiEngineSelect.value = savedAi;
      aiEngineSelect.addEventListener('change', saveAiSettings);
    }
    
    if (aiModeToggle) {
      aiModeToggle.checked = aiModeEnabled;
      aiModeToggle.addEventListener('change', saveAiSettings);
    }
    
    // Mettre à jour l'interface après le chargement
    updateAiIndicator();
    updateSearchPlaceholder();
    
    console.log('✅ Paramètres IA chargés:', { engine: savedAi, enabled: aiModeEnabled });
  } catch (error) {
    console.error('❌ Erreur chargement paramètres IA:', error);
  }
}

// Fonction pour mettre à jour l'indicateur IA
function updateAiIndicator() {
  const aiIndicator = document.getElementById("ai-indicator");
  const isAiModeEnabled = getAiModeStatus();
  const selectedAi = getSelectedAiEngine();
  
  if (aiIndicator) {
    const aiIcons = {
      chatgpt: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bot"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>',
      claude: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-brain"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/><path d="M17.599 6.5a3 3 0 0 0 .399-1.375"/><path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"/><path d="M3.477 10.896a4 4 0 0 1 .585-.396"/><path d="M19.938 10.5a4 4 0 0 1 .585.396"/><path d="M6 18a4 4 0 0 1-1.967-.516"/><path d="M19.967 17.484A4 4 0 0 1 18 18"/></svg>',
      gemini: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sparkles"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/></svg>',
      copilot: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plane"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>',
      perplexity: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>',
      you: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-globe"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>',
      phind: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-book-open"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>'
    };
    
    // Toujours afficher l'indicateur, mais changer son apparence selon l'état
    aiIndicator.innerHTML = aiIcons[selectedAi] || aiIcons.chatgpt;
    aiIndicator.style.display = "flex";
    
    // Changer l'apparence selon l'état du mode IA
    if (isAiModeEnabled) {
      aiIndicator.classList.add('active');
      aiIndicator.classList.remove('inactive');
    } else {
      aiIndicator.classList.add('inactive');
      aiIndicator.classList.remove('active');
    }
  }
}

// Fonction pour mettre à jour le placeholder de recherche
function updateSearchPlaceholder() {
  const searchInput = document.getElementById("search-input");
  const isAiModeEnabled = getAiModeStatus();
  const selectedAi = getSelectedAiEngine();
  const selectedEngine = getSelectedSearchEngine();
  
  if (searchInput) {
    if (isAiModeEnabled) {
      const aiNames = {
        chatgpt: "ChatGPT",
        claude: "Claude",
        gemini: "Gemini",
        copilot: "Copilot",
        perplexity: "Perplexity",
        you: "You.com",
        phind: "Phind"
      };
      searchInput.placeholder = `Posez votre question à ${aiNames[selectedAi] || "l'IA"}`;
    } else {
      const engineNames = {
        google: "Google",
        bing: "Bing",
        duckduckgo: "DuckDuckGo",
        yahoo: "Yahoo",
        ecosia: "Ecosia",
        startpage: "Startpage",
        qwant: "Qwant"
      };
      searchInput.placeholder = `Effectuez une recherche sur ${engineNames[selectedEngine] || "Google"} ou saisissez une URL`;
    }
  }
}
// Déclaration des éléments une seule fois pour de meilleures performances

// Fonction toggle améliorée
function toggleContainer() {
  isActive = !isActive;
  googleServicesContainer.style.display = isActive ? "flex" : "none";
}

// Gestionnaire de clic pour le bouton
toggleButton.addEventListener("click", (e) => {
  e.stopPropagation(); // Empêche la propagation vers le document
  toggleContainer();
});

// Gestionnaire de clic global
document.addEventListener("click", (e) => {
  // Masquer les suggestions si on clique ailleurs que sur l'input
  if (
    e.target !== searchInput &&
    suggestionsContainer.contains(e.target) === false
  ) {
    suggestionsContainer.style.display = "none";
    parentElement.style.opacity = 1;
  }

  // Fermer le container si on clique à l'extérieur
  if (isActive && !googleServicesContainer.contains(e.target)) {
    toggleContainer();
  }
});

// Empêcher la fermeture quand on clique dans le container
googleServicesContainer.addEventListener("click", (e) => {
  e.stopPropagation();
});

// Afficher le modal de confirmation avant suppression
function showDeleteConfirmation(key) {
  itemToDelete = key;
  confirmDeleteModal.style.display = "flex";
}

// Récupérer l'élément à supprimer par son ID
function deleteItem(key) {
  const elem = document.getElementById(key);

  if (elem) {
    elem.remove();
    saveFavoritesToStorage();
  }
}
async function saveFavoritesToStorage() {
  const items = Array.from(parentElement.querySelectorAll(".fav-link a"));
  const urls = items.map((item) => item.href);
  
  // Sauvegarder avec le nouveau système
  await storageManager.saveFavorites(urls);
  
  // Feedback visuel optionnel
  console.log('💾 Favoris sauvegardés:', urls.length, 'éléments');
}

function createItem(url) {
  const faviconUrl = getFaviconUrl(url);
  const domain = extractDomain(url);
  const key = `item-${Math.random().toString(36).substr(2, 9)}`;

  const div = document.createElement("div");
  div.className = "grid-item fav-link";
  div.draggable = true;
  div.id = key;

  const link = document.createElement("a");
  link.href = url;
  link.target = "_blank";
  link.title = domain;
  link.innerHTML = `
    <img src="assets/icons/icon128.png""${faviconUrl}" alt="Favicon de ${domain}">
    ${domain}
  `;

  const button = document.createElement("button");
  button.className = "delete-button";
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x-icon lucide-x">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  `;
  button.innerHTML = svg;

  // Gestionnaire de clic pour afficher le modal de confirmation
  button.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    showDeleteConfirmation(key);
  });

  div.appendChild(link);
  div.appendChild(button);

  return div;
}

function createFavoriteLink() {
  let link = searchInput.value.trim().toLowerCase();
  const newItem = createItem(link);
  parentElement.appendChild(newItem);
  saveFavoritesToStorage();
}

// Ouvrir la modale
ouvrirModalBtn.addEventListener("click", function () {
  modal.style.display = "flex";
  editableLink.focus();
});

// Fermer la modale
function fermerModal() {
  modal.style.display = "none";
  editableLink.value = "";
}

// Annuler
annulerModalBtn.addEventListener("click", fermerModal);

// Valider et créer l'élément
function createItem(url) {
  const faviconUrl = getFaviconUrl(url);
  const domain = extractDomain(url);
  const key = `item-${Math.random().toString(36).substr(2, 9)}`;

  const div = document.createElement("div");
  div.className = "grid-item fav-link";
  div.id = key;

  const link = document.createElement("a");
  link.href = url;
  link.title = domain;
  link.innerHTML = `
    <img src="${faviconUrl}" alt="Favicon de ${domain}">
    ${domain}
  `;

  const button = document.createElement("button");
  button.className = "delete-button";
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x-icon lucide-x">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  `;
  button.innerHTML = svg;

  button.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    showDeleteConfirmation(key);
  });

  div.appendChild(link);
  div.appendChild(button);

  return div;
}

validerModalBtn.addEventListener("click", validerEtCreer);

// Valider avec Entrée
function validerEtCreer() {
  let text = editableLink.value.trim();

  if (
    text &&
    (text.startsWith("http://") ||
      text.startsWith("https://") ||
      text.startsWith("www.")) &&
    countChildren("tiles-container") < 10
  ) {
    const newItem = createItem(text);
    parentElement.appendChild(newItem);
    saveFavoritesToStorage();
    fermerModal();
  }
  ouvrirModalBtn.style.display =
    countChildren("tiles-container") <= 8 ? "block" : "none";
}

editableLink.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    e.preventDefault();
    validerEtCreer();
  }
});

// Fermer la modale si on clique en dehors
modal.addEventListener("click", function (e) {
  if (e.target === modal) {
    fermerModal();
  }
});

function countChildren(divId) {
  const div = document.getElementById(divId);
  if (!div) {
    console.error(`Aucun div avec l'id '${divId}' trouvé.`);
    return;
  }

  // Filtrer seulement les enfants avec un id qui commence par "item-"
  const gridItems = Array.from(div.children).filter((child) =>
    child.className.startsWith("grid-item")
  );

  return gridItems.length - 1;
}

const locationEl = document.getElementById("location");
const tempEl = document.getElementById("temp");
const iconEl = document.getElementById("icon");
const descEl = document.getElementById("desc");
const inputEl = document.getElementById("cityInput");
const toggleEl = document.getElementById("unitToggle");

let currentTempC = null;

// inputEl.addEventListener("keypress", (e) => {
//   if (e.key === "Enter") {
//     fetchWeather(inputEl.value.trim());
//     inputEl.value = "";
//   }
// });

toggleEl.addEventListener("change", () => {
  if (currentTempC !== null) updateTempDisplay();
});

const getWeatherIcon = (code) => {
  if (code === 0) return "day_forecast_sun_sunny_weather_icon.png";
  if (code <= 3) return "cloud_cloudy_day_forecast_sun_icon.svg";
  if (code <= 48) return "cloud_clouds_cloudy_forecast_weather_icon.svg";
  if (code <= 65) return "cloud_cloudy_forecast_rain_sun_icon.svg";
  if (code <= 77) return "cloud_cloudy_hail_hail stones_snow_icon.svg";
  if (code <= 86) return "cloud_cloudy_forecast_precipitation_snow_icon.svg";
  if (code <= 99) return "cloud_light bolt_lightning_rain_storm_icon.svg";
  return "❓";
};

const getDescription = (code) => {
  const map = {
    0: "Ensoleillé",
    1: "Peu nuageux",
    2: "Partiellement nuageux",
    3: "Nuageux",
    45: "Brouillard",
    48: "Brouillard givrant",
    51: "Bruine",
    61: "Pluie",
    71: "Neige",
    80: "Averses",
    95: "Orage",
  };
  return map[code] || "Inconnu";
};

function updateTempDisplay() {
  const isF = toggleEl.checked;
  const temp = isF ? (currentTempC * 9) / 5 + 32 : currentTempC;
  tempEl.textContent = `${temp.toFixed(1)}°${isF ? "F" : "C"}`;
}

async function fetchWeather(city) {
  try {
    const geoRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        city
      )}&count=1&language=fr`
    );
    const geo = await geoRes.json();
    if (!geo.results) throw new Error("Ville introuvable");

    const { latitude, longitude, name } = geo.results[0];

    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,weathercode&timezone=auto`
    );
    const weather = await weatherRes.json();

    const now = new Date();
    const hour = now.getHours();
    const index = weather.hourly.time.findIndex(
      (t) => new Date(t).getHours() === hour
    );

    currentTempC = weather.hourly.temperature_2m[index];
    const code = weather.hourly.weathercode[index];

    locationEl.textContent = name;
    iconEl.innerHTML =
      '<img src="assets/weather icons/lite/' +
      getWeatherIcon(code) +
      '" alt="Weather icon"> ';
    descEl.textContent = getDescription(code);
    updateTempDisplay();
    console.log(iconEl.innerHTML);
  } catch (err) {
    document.querySelector('.weather-widget').style.display =  "none"; 
  }
}




function getCityFromCoordinates(latitude, longitude) {
  fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`)
    .then(response => response.json())
    .then(data => {
      const city = data.address.city || data.address.town || data.address.village || data.address.hamlet;
      if (city) {
         fetchWeather(city);
      } else {
        alert("Ville non trouvée")
      }
    })
    .catch(err => {
      console.error('Erreur lors du reverse geocoding', err);
      // document.getElementById('city').innerHTML = '<span class="error">Erreur lors de la détection de la ville.</span>';
    });
}

function success(position) {
  const latitude = position.coords.latitude;
  const longitude = position.coords.longitude;
  console.log(`Latitude : ${latitude}, Longitude : ${longitude}`);
  getCityFromCoordinates(latitude, longitude) 
}

function error(err) {
  console.error(`Erreur de géolocalisation : ${err.message}`);
  // document.getElementById('city').innerHTML = '<span class="error">Impossible d\'accéder à votre position.</span>';
}

if ('geolocation' in navigator) {
  navigator.geolocation.getCurrentPosition(success, error);
} else {
  // document.getElementById('city').innerHTML = '<span class="error">La géolocalisation n\'est pas supportée par votre navigateur.</span>';
}

// Gestionnaires d'événements pour le modal de confirmation de suppression
cancelDeleteBtn.addEventListener("click", function() {
  confirmDeleteModal.style.display = "none";
  itemToDelete = null;
});

confirmDeleteBtn.addEventListener("click", function() {
  if (itemToDelete) {
    deleteItem(itemToDelete);
    confirmDeleteModal.style.display = "none";
    itemToDelete = null;
  }
});

// Fermer le modal de confirmation si on clique en dehors
confirmDeleteModal.addEventListener("click", function(e) {
  if (e.target === confirmDeleteModal) {
    confirmDeleteModal.style.display = "none";
    itemToDelete = null;
  }
});

// Gestion du clic sur l'indicateur IA pour basculer le mode IA
document.addEventListener('DOMContentLoaded', () => {
  const aiIndicator = document.getElementById('ai-indicator');
  
  if (aiIndicator) {
    aiIndicator.addEventListener('click', () => {
      const currentStatus = getAiModeStatus();
      const newStatus = !currentStatus;
      
      // Sauvegarder le nouveau statut
      if (typeof saveAiModeStatus === 'function') {
        saveAiModeStatus(newStatus);
      }
      
      // Mettre à jour le toggle dans les paramètres
      const aiModeToggle = document.getElementById('ai-mode-toggle');
      if (aiModeToggle) {
        aiModeToggle.checked = newStatus;
      }
      
      // Mettre à jour l'affichage
      updateAiIndicator();
      updateSearchPlaceholder();
      
      console.log('🔄 Mode IA basculé:', newStatus ? 'Activé' : 'Désactivé');
    });
    
    // Ajouter un style de curseur pointer pour indiquer que c'est cliquable
    aiIndicator.style.cursor = 'pointer';
  }
});
