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
let isActive = false;
let selectedIndex = -1; // Aucune sélection au début
let currentMatches = []; // Stocker les suggestions actuelles

document.addEventListener("DOMContentLoaded", function () {
  // Charger les favoris sauvegardés au démarrage
  const savedFavorites = JSON.parse(localStorage.getItem("favorites")) || [];

  savedFavorites.forEach((url) => {
    parentElement.appendChild(createItem(url));
  });

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
if (JSON.parse(localStorage.getItem("favorites")).length == 0) {
  links.forEach((link, index) => {
    if (index <= 5) {
      parentElement.appendChild(createItem(link.url));
    }
  });
}

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

function submitForm(target) {
  if (target.startsWith("http://") || target.startsWith("https://")) {
    window.open(target, "_blank"); // Ouvre les URLs complètes dans un nouvel onglet
  } else if (target.startsWith("www.")) {
    window.open("https://" + target, "_blank"); // Ouvre les www. dans un nouvel onglet
  } else if (target.length > 0) {
    // Redirection dans le même onglet pour les recherches Google
    window.location.href =
      "https://www.google.com/search?q=" + encodeURIComponent(target);
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

// Récupérer l'élément à supprimer par son ID
function deleteItem(key) {
  const elem = document.getElementById(key);

  if (elem) {
    elem.remove();
    saveFavoritesToLocalStorage();
  }
}
function saveFavoritesToLocalStorage() {
  const items = Array.from(parentElement.querySelectorAll(".fav-link a"));
  const urls = items.map((item) => item.href);
  localStorage.setItem("favorites", JSON.stringify(urls));
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
  button.innerHTML = '<div class="follower" id="mouseFollower"></div>';
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x-icon lucide-x">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  `;
  button.innerHTML = svg;

  // ression
  button.addEventListener("click", () => deleteItem(key));

  div.appendChild(link);
  div.appendChild(button);

  return div;
}

function createFavoriteLink() {
  let link = searchInput.value.trim().toLowerCase();
  const newItem = createItem(link);
  parentElement.appendChild(newItem);
  saveFavoritesToLocalStorage();
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

  button.addEventListener("click", () => deleteItem(key));

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
    saveFavoritesToLocalStorage();
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