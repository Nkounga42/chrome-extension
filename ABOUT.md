# À propos de HomeSpace

## 🏡 Qu'est-ce que HomeSpace ?

**HomeSpace** est une extension Chrome moderne et élégante qui transforme votre page d'accueil en un espace de travail personnalisé et fonctionnel. Conçue avec un design minimaliste et des performances optimales, HomeSpace offre une alternative rafraîchissante aux extensions traditionnelles.

## 🎯 Objectif du projet

L'objectif principal de HomeSpace est de créer une expérience utilisateur fluide et personnalisable pour la page d'accueil du navigateur, en mettant l'accent sur :

- **La simplicité** : Interface épurée et intuitive
- **La performance** : Code JavaScript pur, sans frameworks lourds
- **La personnalisation** : Adaptation complète aux préférences utilisateur
- **La confidentialité** : Aucune collecte de données, respect total de la vie privée

## 🚀 Fonctionnalités récentes

### 🖼️ Arrière-plans personnalisés
- Import d'images personnelles avec drag & drop
- Optimisation automatique des images (compression, redimensionnement)
- Support des formats JPG, PNG, GIF, WebP
- Persistance des arrière-plans avec localStorage
- Limite de taille intelligente (10MB max)

### ⚠️ Modal de confirmation
- Protection contre les suppressions accidentelles de liens épinglés
- Interface élégante avec overlay et effet de flou
- Boutons d'action clairement différenciés (Annuler/Supprimer)
- Fermeture par clic extérieur

### ⌨️ Raccourcis clavier
- Validation des formulaires avec la touche ENTER
- Navigation fluide dans l'interface
- Expérience utilisateur optimisée

### 🎨 Interface modernisée
- Zone de drop moderne pour les images
- Aperçu en temps réel des modifications
- Boutons d'action intuitifs (Appliquer/Supprimer/Annuler)
- Design cohérent avec le thème de l'extension

## 🛠️ Technologies utilisées

- **Frontend** : HTML5, CSS3, JavaScript ES6+
- **Stockage** : localStorage pour la persistance
- **APIs** : Chrome Extension APIs
- **Design** : CSS Grid, Flexbox, CSS Variables
- **Optimisation** : Canvas API pour le traitement d'images

## 📁 Structure du projet

```
chrome-extension/
├── assets/           # Ressources (icônes, images)
├── css/             # Feuilles de style
│   ├── style.css    # Styles principaux
│   ├── modal.css    # Styles des modals
│   └── theme.css    # Variables de thème
├── script/          # Scripts JavaScript
│   ├── popup.js     # Logique principale
│   ├── time-manager.js  # Gestion du temps et arrière-plans
│   └── draggable.js # Système de drag & drop
├── home.html        # Page principale
├── manifest.json    # Configuration de l'extension
└── README.md        # Documentation
```

## 🎨 Philosophie de design

HomeSpace suit une approche de design centrée sur l'utilisateur :

- **Minimalisme** : Chaque élément a sa raison d'être
- **Cohérence** : Design system unifié avec variables CSS
- **Accessibilité** : Contrastes appropriés et navigation au clavier
- **Responsivité** : Adaptation à différentes tailles d'écran
- **Performance** : Optimisation des animations et transitions

## 🔒 Respect de la vie privée

HomeSpace est conçu avec la confidentialité comme priorité :

- **Aucune collecte de données** personnelles
- **Stockage local uniquement** (localStorage)
- **Pas de tracking** ou d'analytics
- **Code open source** pour la transparence
- **Aucun service tiers** intrusif

## 🌟 Roadmap future

- Support de plus de formats d'images
- Système de thèmes avancé
- Widgets personnalisables
- Synchronisation cloud optionnelle
- Mode hors ligne complet

## 👨‍💻 Développeur

Développé avec passion par **Nkounga Exaucé**
- Email : nkoungagil@gmail.com
- GitHub : [@Nkounga42](https://github.com/Nkounga42)

## 📄 Licence

Ce projet est sous licence MIT - voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

*HomeSpace - Transformez votre page d'accueil en un espace qui vous ressemble* 🏡
