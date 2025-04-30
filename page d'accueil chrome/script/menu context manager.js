// function createContextMenu() {
//   try {
//     chrome.contextMenus.create({
//       id: "mon-bouton",
//       title: "Action de mon extension",
//       contexts: ["all"]
//     }, () => {
//       if (chrome.runtime.lastError) {
//         console.log("Le menu existait déjà:", chrome.runtime.lastError);
//       }
//     });
//   } catch (e) {
//     console.error("Erreur création menu:", e);
//   }
// }

// // Au chargement
// chrome.runtime.onInstalled.addListener(createContextMenu);

// // Gestionnaire pour le clic sur l'élément
// chrome.contextMenus.onClicked.addListener(function(info, tab) {
//   if (info.menuItemId === "mon-bouton") {
//     console.log("Bouton cliqué !", info, tab);
//   }
// });