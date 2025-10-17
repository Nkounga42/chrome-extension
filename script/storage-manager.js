/**
 * Gestionnaire de stockage persistant pour HomeSpace
 * Utilise chrome.storage.local au lieu de localStorage pour éviter la perte de données
 */

class StorageManager {
  constructor() {
    this.storageKeys = {
      FAVORITES: 'homeSpace_favorites',
      BACKGROUNDS: 'homeSpace_backgrounds',
      SETTINGS: 'homeSpace_settings',
      CURRENT_BACKGROUND: 'homeSpace_currentBackground'
    };
    
    // Vérifier le contexte d'exécution
    this.isExtensionContext = this.checkExtensionContext();
    console.log('🔍 Contexte d\'extension détecté:', this.isExtensionContext);
  }

  /**
   * Vérifier si nous sommes dans le contexte d'une extension Chrome
   * @returns {boolean}
   */
  checkExtensionContext() {
    try {
      // Vérifier plusieurs indicateurs d'extension
      return (
        typeof chrome !== 'undefined' &&
        (chrome.runtime && chrome.runtime.id) ||
        (window.location && window.location.protocol === 'chrome-extension:')
      );
    } catch (error) {
      console.warn('⚠️ Erreur lors de la vérification du contexte d\'extension:', error);
      return false;
    }
  }

  /**
   * Vérifier si l'API chrome.storage est disponible
   * @returns {boolean}
   */
  isStorageAvailable() {
    try {
      // D'abord vérifier si nous sommes dans le bon contexte
      if (!this.isExtensionContext) {
        return false;
      }

      return typeof chrome !== 'undefined' && 
             chrome !== null &&
             chrome.storage && 
             chrome.storage.local &&
             typeof chrome.storage.local.set === 'function';
    } catch (error) {
      console.warn('⚠️ Erreur lors de la vérification de chrome.storage:', error);
      return false;
    }
  }

  /**
   * Sauvegarde des données dans chrome.storage.local
   * @param {string} key - Clé de stockage
   * @param {any} data - Données à sauvegarder
   * @returns {Promise}
   */
  async save(key, data) {
    // FORCER l'utilisation de localStorage pour le moment
    console.log(`💾 Utilisation forcée de localStorage pour: ${key}`);
    try {
      localStorage.setItem(key, JSON.stringify({
        data: data,
        timestamp: Date.now(),
        version: '1.0.0'
      }));
      return true;
    } catch (error) {
      console.error(`❌ Erreur localStorage ${key}:`, error);
      return false;
    }

    /* Code chrome.storage désactivé temporairement
    try {
      // Vérifier si l'API est disponible
      if (!this.isStorageAvailable()) {
        console.warn('⚠️ chrome.storage non disponible, utilisation de localStorage comme fallback');
        localStorage.setItem(key, JSON.stringify({
          data: data,
          timestamp: Date.now(),
          version: '1.0.0'
        }));
        return true;
      }

      const storageData = {};
      storageData[key] = {
        data: data,
        timestamp: Date.now(),
        version: '1.0.0'
      };
      
      await chrome.storage.local.set(storageData);
      console.log(`✅ Données sauvegardées: ${key}`, data);
      return true;
    } catch (error) {
      console.error(`❌ Erreur sauvegarde ${key}:`, error);
      // Fallback vers localStorage en cas d'erreur
      try {
        localStorage.setItem(key, JSON.stringify({
          data: data,
          timestamp: Date.now(),
          version: '1.0.0'
        }));
        console.log(`💾 Fallback localStorage utilisé pour: ${key}`);
        return true;
      } catch (fallbackError) {
        console.error(`❌ Erreur fallback localStorage:`, fallbackError);
        return false;
      }
    }
    */
  }

  /**
   * Chargement des données depuis chrome.storage.local
   * @param {string} key - Clé de stockage
   * @returns {Promise<any>} - Données chargées ou null
   */
  async load(key) {
    // FORCER l'utilisation de localStorage pour le moment
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log(`💾 Données chargées depuis localStorage: ${key}`);
        return parsed.data || parsed; // Support ancien format
      }
      return null;
    } catch (error) {
      console.error(`❌ Erreur localStorage chargement ${key}:`, error);
      return null;
    }

    /* Code chrome.storage désactivé temporairement
    try {
      // Vérifier si l'API est disponible
      if (!this.isStorageAvailable()) {
        console.warn('⚠️ chrome.storage non disponible, utilisation de localStorage comme fallback');
        const stored = localStorage.getItem(key);
        if (stored) {
          const parsed = JSON.parse(stored);
          return parsed.data || parsed; // Support ancien format
        }
        return null;
      }

      const result = await chrome.storage.local.get([key]);
      if (result[key]) {
        console.log(`✅ Données chargées: ${key}`, result[key].data);
        return result[key].data;
      }
      return null;
    } catch (error) {
      console.error(`❌ Erreur chargement ${key}:`, error);
      // Fallback vers localStorage
      try {
        const stored = localStorage.getItem(key);
        if (stored) {
          const parsed = JSON.parse(stored);
          console.log(`💾 Fallback localStorage utilisé pour chargement: ${key}`);
          return parsed.data || parsed;
        }
        return null;
      } catch (fallbackError) {
        console.error(`❌ Erreur fallback localStorage:`, fallbackError);
        return null;
      }
    }
    */
  }

  /**
   * Suppression d'une clé de stockage
   * @param {string} key - Clé à supprimer
   * @returns {Promise<boolean>}
   */
  async remove(key) {
    // FORCER l'utilisation de localStorage pour le moment
    try {
      localStorage.removeItem(key);
      console.log(`💾 Données supprimées de localStorage: ${key}`);
      return true;
    } catch (error) {
      console.error(`❌ Erreur localStorage suppression ${key}:`, error);
      return false;
    }
  }

  /**
   * Sauvegarde des favoris
   * @param {Array} favorites - Liste des URLs favorites
   */
  async saveFavorites(favorites) {
    return await this.save(this.storageKeys.FAVORITES, favorites);
  }

  /**
   * Chargement des favoris
   * @returns {Promise<Array>} - Liste des favoris ou tableau vide
   */
  async loadFavorites() {
    const favorites = await this.load(this.storageKeys.FAVORITES);
    return favorites || [];
  }

  /**
   * Sauvegarde de l'arrière-plan actuel
   * @param {string} backgroundData - Données de l'arrière-plan (base64)
   */
  async saveCurrentBackground(backgroundData) {
    return await this.save(this.storageKeys.CURRENT_BACKGROUND, backgroundData);
  }

  /**
   * Chargement de l'arrière-plan actuel
   * @returns {Promise<string|null>} - Données de l'arrière-plan ou null
   */
  async loadCurrentBackground() {
    return await this.load(this.storageKeys.CURRENT_BACKGROUND);
  }

  /**
   * Sauvegarde des paramètres utilisateur
   * @param {Object} settings - Paramètres de l'utilisateur
   */
  async saveSettings(settings) {
    return await this.save(this.storageKeys.SETTINGS, settings);
  }

  /**
   * Chargement des paramètres utilisateur
   * @returns {Promise<Object>} - Paramètres ou objet vide
   */
  async loadSettings() {
    const settings = await this.load(this.storageKeys.SETTINGS);
    return settings || {};
  }

  /**
   * Migration depuis localStorage vers chrome.storage
   * À exécuter au premier chargement pour migrer les anciennes données
   */
  async migrateFromLocalStorage() {
    console.log('🔄 Migration localStorage (mode compatibilité)...');
    
    try {
      // En mode localStorage uniquement, pas de migration nécessaire
      // Juste marquer comme terminé pour éviter les boucles
      await this.save('migration_completed', true);
      console.log('✅ Migration marquée comme terminée (mode localStorage)');
    } catch (error) {
      console.error('❌ Erreur lors de la migration:', error);
    }
  }

  /**
   * Vérifier si la migration a déjà été effectuée
   * @returns {Promise<boolean>}
   */
  async isMigrationCompleted() {
    const completed = await this.load('migration_completed');
    return completed === true;
  }

  /**
   * Obtenir des informations sur l'utilisation du stockage
   * @returns {Promise<Object>}
   */
  async getStorageInfo() {
    try {
      if (!this.isStorageAvailable()) {
        console.warn('⚠️ chrome.storage non disponible, informations de stockage indisponibles');
        return {
          used: 0,
          quota: 5242880, // 5MB par défaut
          available: 5242880,
          usagePercent: 0,
          fallback: true
        };
      }

      const usage = await chrome.storage.local.getBytesInUse();
      const quota = chrome.storage.local.QUOTA_BYTES;
      
      return {
        used: usage,
        quota: quota,
        available: quota - usage,
        usagePercent: Math.round((usage / quota) * 100),
        fallback: false
      };
    } catch (error) {
      console.error('❌ Erreur info stockage:', error);
      return {
        used: 0,
        quota: 5242880,
        available: 5242880,
        usagePercent: 0,
        fallback: true,
        error: true
      };
    }
  }

  /**
   * Nettoyer les anciennes données (si nécessaire)
   */
  async cleanup() {
    try {
      // Supprimer les données de migration une fois terminée
      const migrationCompleted = await this.isMigrationCompleted();
      if (migrationCompleted) {
        // Garder seulement les données essentielles
        console.log('🧹 Nettoyage des données temporaires...');
      }
    } catch (error) {
      console.error('❌ Erreur nettoyage:', error);
    }
  }
}

/**
 * Attendre que l'API Chrome soit prête
 * @returns {Promise}
 */
async function waitForChromeAPI() {
  return new Promise((resolve) => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      resolve();
      return;
    }
    
    // Attendre jusqu'à 2 secondes pour que l'API soit disponible
    let attempts = 0;
    const maxAttempts = 20;
    
    const checkAPI = () => {
      attempts++;
      if (typeof chrome !== 'undefined' && chrome.storage) {
        resolve();
      } else if (attempts < maxAttempts) {
        setTimeout(checkAPI, 100);
      } else {
        console.warn('⚠️ Timeout: API Chrome non disponible après 2 secondes');
        resolve(); // Continuer avec localStorage
      }
    };
    
    setTimeout(checkAPI, 100);
  });
}

// Instance globale du gestionnaire de stockage
const storageManager = new StorageManager();

// Initialisation avec attente de l'API Chrome
waitForChromeAPI().then(() => {
  console.log('✅ StorageManager initialisé');
});

// Export pour utilisation dans d'autres scripts
window.storageManager = storageManager;
