let use24HourFormat = true;
let showSeconds = false;
let showYear = true;
let useTextualDateFormat = true;

function updateClock() {
  const now = new Date();

  // Partie Heure
  let hours = now.getHours();
  let minutes = now.getMinutes();
  let seconds = now.getSeconds();
  let period = "";

  if (!use24HourFormat) {
    period = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
  }

  hours = String(hours).padStart(2, "0");
  minutes = String(minutes).padStart(2, "0");
  seconds = String(seconds).padStart(2, "0");

  let timeString = `${hours}:${minutes}`;
  if (showSeconds) {
    timeString += `:${seconds}`;
  }
  if (!use24HourFormat) {
    timeString += ` ${period}`;
  }
  document.getElementById("clock").textContent = timeString;

  // Partie Date
  let dateString = "";

  if (useTextualDateFormat) {
    // Format textuel : jour, 00 mois année
    const options = { weekday: "long", day: "2-digit", month: "long" };
    if (showYear) options.year = "numeric";

    dateString = now.toLocaleDateString("fr-FR", options);
  } else {
    // Format numérique : JJ/MM/AAAA
    let day = String(now.getDate()).padStart(2, "0");
    let month = String(now.getMonth() + 1).padStart(2, "0");
    let year = now.getFullYear();

    dateString = `${day}/${month}`;
    if (showYear) {
      dateString += `/${year}`;
    }
  }

  document.getElementById("date").textContent = dateString;
}

// Gestion des changements
function handleFormatChange() {
  use24HourFormat = !document.getElementById("format12h").checked;
  updateClock();
}

function handleSecondsChange() {
  showSeconds = document.getElementById("showSeconds").checked;
  updateClock();
}

function handleYearChange() {
  showYear = document.getElementById("showYear").checked;
  updateClock();
}

function handleDateFormatChange() {
  useTextualDateFormat = document.getElementById("dateFormatTextual").checked;
  updateClock();
}

const themeSelect = document.getElementById("theme-select");

function applyTheme(theme) {
  if (theme === "dark") {
    document.body.className = "dark";
  } else if (theme === "light") {
    document.body.className = "light";
  } else if (theme === "system") {
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    applyTheme(prefersDark ? "dark" : "light");
    return;
  }
}

function setInitialTheme() {
  const savedTheme = localStorage.getItem("theme") || "system";
  themeSelect.value = savedTheme;
  applyTheme(savedTheme);
}

themeSelect.addEventListener("change", () => {
  const selectedTheme = themeSelect.value;
  localStorage.setItem("theme", selectedTheme);
  applyTheme(selectedTheme);
});

// Re-appliquer le thème à l’ouverture
setInitialTheme();

// Re-appliquer le thème système automatiquement si l'utilisateur change son thème OS
window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", (e) => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "system") {
      applyTheme("system");
    }
  });

const dropArea = document.getElementById("drop-area");
const preview = document.getElementById("preview");
const bgControls = document.querySelector(".bg-controls");
const bgFileInput = document.getElementById("bg-file-input");
const browseLink = document.querySelector(".browse-link");
const applyBgBtn = document.getElementById("apply-bg");
const removeBgBtn = document.getElementById("remove-bg");
const cancelBgBtn = document.getElementById("cancel-bg");

let currentImageData = null;
const SUPPORTED_FORMATS = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

// Charger l'arrière-plan sauvegardé au démarrage
async function loadSavedBackground() {
  const savedBg = await storageManager.loadCurrentBackground();
  if (savedBg) {
    document.body.style.backgroundImage = `url(${savedBg})`;
  }
}

// Sauvegarder l'arrière-plan
async function saveBackground(imageData) {
  try {
    const success = await storageManager.saveCurrentBackground(imageData);
    if (!success) {
      alert('Erreur lors de la sauvegarde de l\'arrière-plan');
    }
  } catch (e) {
    console.error('Erreur lors de la sauvegarde:', e);
    alert('Image trop volumineuse pour être sauvegardée');
  }
}

// Optimiser l'image (réduire la taille si nécessaire)
function optimizeImage(file, maxWidth = 1920, quality = 0.8) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    
    img.src = URL.createObjectURL(file);
  });
}

// Traiter le fichier image
async function processImageFile(file) {
  if (!file || !SUPPORTED_FORMATS.includes(file.type)) {
    alert("Format non supporté. Utilisez JPG, PNG, GIF ou WebP.");
    return;
  }

  if (file.size > 10 * 1024 * 1024) { // 10MB max
    alert("Fichier trop volumineux. Taille maximum: 10MB");
    return;
  }

  try {
    // Optimiser l'image si elle est trop grande
    currentImageData = file.size > 2 * 1024 * 1024 ? 
      await optimizeImage(file) : 
      await new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });

    // Afficher l'aperçu
    preview.src = currentImageData;
    dropArea.style.display = "none";
    bgControls.style.display = "block";
  } catch (error) {
    console.error('Erreur lors du traitement:', error);
    alert('Erreur lors du traitement de l\'image');
  }
}

// Empêcher le comportement par défaut
["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
  dropArea.addEventListener(eventName, (e) => e.preventDefault());
});

// Mettre en surbrillance la zone de drop
["dragenter", "dragover"].forEach((eventName) => {
  dropArea.addEventListener(eventName, () => dropArea.classList.add("hover"));
});

["dragleave", "drop"].forEach((eventName) => {
  dropArea.addEventListener(eventName, () => dropArea.classList.remove("hover"));
});

// Gestion du drop
dropArea.addEventListener("drop", (e) => {
  const file = e.dataTransfer.files[0];
  processImageFile(file);
});

// Gestion du clic pour parcourir
browseLink.addEventListener("click", () => {
  bgFileInput.click();
});

dropArea.addEventListener("click", () => {
  bgFileInput.click();
});

// Gestion de la sélection de fichier
bgFileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  processImageFile(file);
});

// Appliquer l'arrière-plan
applyBgBtn.addEventListener("click", () => {
  if (currentImageData) {
    document.body.style.backgroundImage = `url(${currentImageData})`;
    saveBackground(currentImageData);
    resetBgInterface();
  }
});

// Supprimer l'arrière-plan
removeBgBtn.addEventListener("click", async () => {
  document.body.style.backgroundImage = '';
  await storageManager.remove(storageManager.storageKeys.CURRENT_BACKGROUND);
  resetBgInterface();
});

// Annuler
cancelBgBtn.addEventListener("click", () => {
  resetBgInterface();
});

// Réinitialiser l'interface
function resetBgInterface() {
  dropArea.style.display = "flex";
  bgControls.style.display = "none";
  preview.src = "";
  currentImageData = null;
  bgFileInput.value = "";
}

// Charger l'arrière-plan au démarrage
loadSavedBackground();

// Événements
document
  .getElementById("format12h")
  .addEventListener("change", handleFormatChange);
document
  .getElementById("showSeconds")
  .addEventListener("change", handleSecondsChange);
document
  .getElementById("showYear")
  .addEventListener("change", handleYearChange);
document
  .getElementById("dateFormatTextual")
  .addEventListener("change", handleDateFormatChange);

document.getElementById("bgBlur").addEventListener("change", handleBlurChange);
document.getElementById("showWeathers").addEventListener("change", (e)=> {
   let element = document.querySelector('.weather-widget') 
   element.style.display = e.target.checked ? "flex" : "none";
});

function handleBlurChange() {
  const isChecked = document.getElementById("bgBlur").checked;
  const blurValue = isChecked ? "blur(10px)" : "blur(0px)";
  document.documentElement.style.setProperty("--bg-blur", blurValue);
}

// Mise à jour régulière (si updateClock existe)
setInterval(updateClock, 1000);
updateClock?.(); // Utilisation de l'opérateur optionnel pour éviter une erreur si updateClock n'est pas défini

// Récupération des éléments
const toggle = document.getElementById("toggle-radius");
const range = document.getElementById("radius-range");
const valueDisplay = document.getElementById("radius-value");

// Mettre à jour le rayon
function updateRadius(value) {
  const isChecked = toggle.checked;
  showControls(isChecked, range);

  const radiusValue = isChecked ? value : "0";
  valueDisplay.textContent = radiusValue;
  document.documentElement.style.setProperty(
    "--border-radius",
    `${radiusValue}px`
  );
  range.value = radiusValue;
 
  progress.style.width = value + "%"; 
}

// Afficher/masquer les contrôles
function showControls(checkValue, element) {
  element.style.display = checkValue ? "block" : "none";
}

// Événements 
toggle.addEventListener("change", () => {updateRadius(50)});
range.addEventListener("input", (e) => updateRadius(e.target.value )); // input pour mise à jour en temps réel



 

// Initialisation
updateRadius(50);

let showParam = document.getElementById("showParam");
let sideBar = document.getElementById("sideBar");
let sideBarisOpen = false;

showParam.addEventListener("click", showControls(true, range));
showParam.addEventListener("click", () => {
  sideBarisOpen = !sideBarisOpen;
  showControls(sideBarisOpen, sideBar);
});









document.addEventListener('DOMContentLoaded', () => {
  const selector = document.getElementById('fontSelector');
  const selected = document.getElementById('selectedFont');
  const options = document.getElementById('fontOptions');
  const timeViewer = document.getElementById('date-output');

  selected.addEventListener('click', () => {
    options.style.display = options.style.display === 'block' ? 'none' : 'block';
  });

  document.querySelectorAll('.option').forEach(option => {
    option.addEventListener('click', () => {
      const font = option.getAttribute('data-font');
      selected.textContent = option.textContent;
      selected.style.fontFamily = font;
      timeViewer.style.fontFamily = font; 
      options.style.display = 'none';
    });
  });

  document.addEventListener('click', (e) => {
    if (!selector.contains(e.target)) {
      options.style.display = 'none';
    }
  });

  timeViewer.style.fontFamily = 'Inter, sans-serif';  

});