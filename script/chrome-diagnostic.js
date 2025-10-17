/**
 * Script de diagnostic pour comprendre pourquoi chrome.storage n'est pas disponible
 */

console.log('🔍 === DIAGNOSTIC CHROME API ===');

// Vérifier l'objet chrome
console.log('typeof chrome:', typeof chrome);
console.log('chrome:', chrome);

if (typeof chrome !== 'undefined') {
  console.log('chrome.runtime:', chrome.runtime);
  console.log('chrome.runtime.id:', chrome.runtime?.id);
  console.log('chrome.storage:', chrome.storage);
  console.log('chrome.storage.local:', chrome.storage?.local);
}

// Vérifier le contexte
console.log('window.location:', window.location);
console.log('window.location.protocol:', window.location.protocol);
console.log('document.URL:', document.URL);

// Vérifier les permissions
if (typeof chrome !== 'undefined' && chrome.runtime) {
  try {
    chrome.runtime.getManifest && console.log('Manifest:', chrome.runtime.getManifest());
  } catch (e) {
    console.log('Erreur getManifest:', e);
  }
}

// Test localStorage
try {
  localStorage.setItem('test_diagnostic', 'ok');
  console.log('localStorage test:', localStorage.getItem('test_diagnostic'));
  localStorage.removeItem('test_diagnostic');
} catch (e) {
  console.error('localStorage error:', e);
}

console.log('🔍 === FIN DIAGNOSTIC ===');
