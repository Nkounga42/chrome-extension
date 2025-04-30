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

// Empêcher le comportement par défaut
["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
  dropArea.addEventListener(eventName, (e) => e.preventDefault());
});

// Mettre en surbrillance la zone de drop
["dragenter", "dragover"].forEach((eventName) => {
  dropArea.addEventListener(eventName, () => dropArea.classList.add("hover"));
});

["dragleave", "drop"].forEach((eventName) => {
  dropArea.addEventListener(eventName, () =>
    dropArea.classList.remove("hover")
  );
});

// Gestion du drop
dropArea.addEventListener("drop", (e) => {
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith("image/")) {
    const reader = new FileReader();
    reader.onload = () => {
      preview.src = reader.result;
      preview.style.display = "block";
    };
    reader.readAsDataURL(file);
  } else {
    alert("Veuillez déposer un fichier image.");
  }
});

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