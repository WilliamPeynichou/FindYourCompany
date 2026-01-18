# 💰 Configuration Google AdSense - Guide Rapide

## Étapes pour activer les pubs (5 minutes)

### 1. Créer un compte AdSense

1. Allez sur **[https://adsense.google.com](https://adsense.google.com)**
2. Connectez-vous avec votre compte Google
3. Ajoutez votre site web : `votre-domaine.com`
4. Attendez la validation (24h à 2 semaines)

### 2. Récupérer votre ID Éditeur

Une fois approuvé, vous recevrez un ID de la forme :
```
ca-pub-1234567890123456
```

### 3. Configurer dans le code

Remplacez `ca-pub-XXXXXXXXXXXXXXXX` par votre ID dans 2 fichiers :

**Fichier 1 : `client/index.html`**
```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-VOTRE_ID"
 crossorigin="anonymous"></script>
```

**Fichier 2 : `client/src/components/AdSense.jsx`**
```jsx
data-ad-client="ca-pub-VOTRE_ID"
```

### 4. Activer les annonces automatiques (recommandé)

Dans AdSense :
1. Allez dans **Annonces** > **Par site**
2. Cliquez sur **Modifier** à côté de votre site
3. Activez **Annonces automatiques** ✅
4. Google placera automatiquement les pubs aux meilleurs endroits

### 5. Bloquer les pubs pour adultes (-18)

Dans AdSense :
1. Allez dans **Contrôles de blocage** > **Tous les sites**
2. Cliquez sur **Gérer les catégories générales**
3. **Désactivez** ces catégories :
   - ❌ Contenu sexuellement suggestif
   - ❌ Rencontres
   - ❌ Références aux armes à feu
   - ❌ Jeux d'argent
   - ❌ Politique
   - ❌ Religion
   - ❌ Alcool
   - ❌ Tabac

---

## Emplacements publicitaires actuels

| Emplacement | Quand visible |
|-------------|---------------|
| Avant les résultats | Après une recherche |
| Après les résultats | Si plus de 5 résultats |

Les annonces automatiques peuvent ajouter d'autres emplacements si activées.

---

## En développement

En mode développement (`npm run dev`), les pubs affichent un **placeholder gris** au lieu des vraies annonces. C'est normal !

---

## Revenus estimés

| Trafic mensuel | Revenus estimés |
|----------------|-----------------|
| 1 000 visiteurs | 5€ - 20€ |
| 10 000 visiteurs | 50€ - 200€ |
| 100 000 visiteurs | 500€ - 2000€ |

*Les revenus dépendent du pays des visiteurs et du taux de clic.*

---

## Support

- [Centre d'aide AdSense](https://support.google.com/adsense)
- [Règlement AdSense](https://support.google.com/adsense/answer/48182)
