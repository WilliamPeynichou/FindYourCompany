---
name: cv-it
description: Crée des CV ATS-friendly d'une page A4 pour des postes en informatique (full stack, frontend, backend, data, IA, DevOps, ops tech…). Génère un DOCX à partir d'un template docx-js (Node.js) avec photo ronde en en-tête, palette personnalisable, sections modulaires (profil, compétences, expérience, projets, formation, certifications, divers) et un système d'espacements calibré pour remplir exactement une page selon la densité du contenu. Adapte le titre, le profil, l'ordre des compétences et l'angle des projets au poste visé. Convertit en PDF, valide la pagination et prévisualise.
---

# CV IT / Tech — 1 page A4

## Quand utiliser ce skill

À déclencher dès qu'une demande tourne autour de :

- Rédiger un CV pour un poste en informatique (frontend, backend, full stack, data, IA, ML, DevOps, SRE, mobile, chargé d'opérations tech, etc.)
- Adapter un CV existant à une nouvelle offre (réordonner compétences, retitrer, reformuler le profil)
- Décliner un même profil en plusieurs versions selon l'angle (ex : un CV frontend + un CV data pour la même personne)
- Produire un CV ATS-compatible (texte parsable, sections claires, mots-clés explicites)

À **ne pas** utiliser pour des CV non-tech (commerce, RH, métiers manuels…) — la palette, les sections et les mots-clés sont calibrés tech.

## Livrable

- Un fichier `.docx` rendu sur **exactement 1 page A4** (210 × 297 mm).
- Un fichier `.pdf` converti depuis le docx.
- Les deux placés dans `/mnt/user-data/outputs/`.

Toujours valider et prévisualiser **avant** de présenter le résultat à l'utilisateur. Voir la section *Pipeline de build* en bas.

## Principes directeurs

1. **ATS d'abord, design ensuite.** Pas de typographie image-based, pas de colonnes complexes, pas de texte dans des SVG. Le texte doit être parsable ligne par ligne.
2. **Tout doit servir le poste visé.** Le titre, l'ordre des compétences, le choix des projets mis en avant et leur description changent selon l'offre. Le même candidat peut avoir 3 CV très différents pour 3 postes.
3. **Une seule page, bien remplie.** Pas de page à moitié vide (signal d'amateur), pas de débordement sur 2 pages. Si le contenu est court : on étire les espacements ; s'il est dense : on les serre.
4. **Le contenu prime sur les superlatifs.** Préférer "1 000 utilisateurs/mois" à "très grande communauté". Préférer "API REST sur Node.js/Express" à "expertise back-end avancée".
5. **Mots-clés explicites de l'offre.** Si l'annonce dit "Cursor", écrire "Cursor". Si elle dit "modélisation prédictive", utiliser ces mots. Les ATS matchent littéralement.

## Identité visuelle

### Palette par défaut (ajustable)

| Rôle | Hex | Usage |
|---|---|---|
| Accent principal | `#250286` (violet profond) | Nom, titres de section, labels de compétences |
| Accent secondaire | `#03C95A` (vert) | Sous-titre du header, ligne de séparation sous les titres |
| Texte principal | `#1A1A1A` | Corps des bullets, paragraphe de profil |
| Texte secondaire | `#444444` | Valeurs des compétences |
| Texte tertiaire | `#666666` | Dates, lieux, URLs sous les titres de poste |

La palette peut être remplacée par celle du candidat si demandée. Garder le principe : un accent fort (titres + labels), un accent secondaire (séparateurs + sous-titre header), trois niveaux de gris pour le texte.

### Typographie

- Font unique : **Arial** partout (sécurité maximale pour ATS + rendu identique sur tous les OS).
- Taille du nom : 32–36 (selon densité du reste).
- Sous-titre header (intitulé du poste visé) : 19–22.
- Contacts header : 16–17.
- Titres de section : 20–22, **bold**, UPPERCASE, accent principal.
- Sous-titres (postes, projets, diplômes) : 17–18, bold.
- Métadonnées des sous-titres (dates, URLs) : 16–17, gris.
- Bullets : 16–18.
- Labels de compétences : 16–18 bold accent principal.
- Valeurs de compétences : 16–18 gris.

### Caractères et accents

Utiliser les **accents français corrects** : `é`, `è`, `à`, `ç`, `ï`, `ô`, etc. docx-js gère l'UTF-8 nativement, pas besoin de les enlever. Pas d'em dashes (`—` est OK pour séparer un poste de son employeur), pas d'emojis, pas de puces décoratives autres que `•`.

## Structure (ordre fixe)

```
1. Header (table 2 colonnes : photo | nom + titre + contacts)
2. Profil (paragraphe justifié, 4–6 lignes)
3. Compétences Techniques (6–7 lignes "label : valeurs")
4. Expérience Professionnelle (2–3 postes, bullets concis)
5. Projets [Personnels / IA & Data / Frontend / …] (3–5 projets, URL sous le titre, 1–2 bullets)
6. Formation (3 lignes, du plus récent au plus ancien, sans bullets si serré)
7. Certifications (si pertinent)
8. Informations Complémentaires (langues, permis, intérêts, en lignes inline)
```

### Détail par section

**Header.** Table sans bordures, deux cellules. Photo circulaire à gauche (95–110 px), à droite : nom (très grand, accent principal), sous-titre = intitulé du poste visé (accent secondaire), puis deux lignes de contacts en gris clair (téléphone + email + ville | URLs + permis + langues).

**Profil.** Paragraphe **justifié** de 4 à 6 lignes. Structure type : "métier + années d'expérience + entreprise" → "spécialité ou double compétence" → "stack maîtrisée" → "preuves concrètes (projets, métriques)" → "recherche actuelle / formation visée". Le profil est la zone la plus reformulée selon le poste — c'est le sas d'attention pour le recruteur.

**Compétences.** 6 à 7 lignes au format `Label : valeur1, valeur2, valeur3…`. Les labels et leur ordre **s'adaptent au poste** (voir matrice ci-dessous). Mettre en première position la catégorie la plus pertinente pour l'offre.

**Expérience.** Pour chaque poste : sous-titre `Intitulé — Entreprise | dates, lieu` puis 3–6 bullets. Les bullets commencent par un verbe d'action ou un substantif technique, pas par "J'ai…". Quantifier dès que possible.

**Projets.** Le plus différenciant pour un profil junior/intermédiaire dans la tech. Pour chacun : sous-titre `Nom — Description courte | URL` puis 1–2 bullets décrivant la stack et le résultat. **Le même projet peut être décrit sous des angles différents** selon le CV (cf. ClaakeCode décrit comme "harnais d'agents IA" sur un CV IA et comme "outil d'orchestration de workflows" sur un CV ops). Adapter la description à la lecture qu'aura le recruteur.

**Formation.** Du plus récent au plus ancien. Pour une formation à venir : `année – année (à venir)`. Pour une formation continue en cours : `En cours — formation continue`.

**Certifications.** Une ligne par certif, format `Nom — Émetteur | année`.

**Informations Complémentaires.** Lignes inline avec labels en accent : `Langues : … | Permis : … | Centres d'intérêt : …`. Centres d'intérêt à humaniser : mix de tech (IA, data science) et de hors-tech (sport, photo, lecture). Évite "le voyage et la cuisine" — trop générique.

## Tailoring par type de poste

Le titre du CV, l'ordre des compétences et l'angle des projets changent selon l'offre. Matrice synthétique :

| Poste | Titre type | Compétences en tête | Projets prioritaires |
|---|---|---|---|
| Frontend React | Développeur Frontend React | Frontend, Écosystème React, UI & Datavisualisation | Projets avec interfaces complexes, dataviz, animations |
| Backend / API | Développeur Backend (Node/Python/…) | Backend & API, Bases de données, DevOps | Projets avec API REST, micro-services, gestion de données |
| Full stack | Développeur Full Stack | Langages, Frameworks, BDD, API | Projets end-to-end (frontend + backend + déploiement) |
| Data / IA | Développeur IA & Data / Ingénieur IA | Data & ML, IA & LLM, Automatisation | Projets avec RAG, agents IA, modélisation, datasets |
| DevOps / Ops tech | Chargé d'Opérations Tech / DevOps | Automatisation & API, CI/CD, Cloud, Outillage | Projets d'automatisation, interconnexion d'outils, pipelines |
| Mobile | Développeur Mobile (RN / Flutter) | Mobile, Frameworks, Backend léger | Apps mobiles, intégrations natives |

**Règle d'or :** lire l'offre en surlignant les mots techniques + les soft skills, et **les retrouver explicitement** dans le CV. Si l'offre mentionne "Cursor, Claude Code, agents de coding" → ces trois termes doivent apparaître. Si elle dit "code reviews exigeantes, autonomie technique" → la lettre de motivation reprend ces mots.

## Espacements : remplir exactement 1 page

C'est **le point le plus délicat**. Le contenu varie (4 expériences vs 1, 3 projets vs 6…). Pour rester sur 1 page exactement bien remplie, on ajuste les espacements après un premier rendu.

### Plages d'espacement (unités docx = twips / 20 ≈ pixels)

| Élément | Plage `before` | Plage `after` | Quand utiliser le haut / bas de plage |
|---|---|---|---|
| Section heading | 150–330 | 50–115 | Contenu dense → bas ; contenu léger → haut |
| Bullet item | 14–46 | 14–46 | Idem |
| Sub-line (poste / projet) | 72–168 | 7–24 | Idem |
| Skill line | 17–50 | 17–50 | Idem |
| Profil paragraph | 30–55 (before), 50–85 (after) | — | Idem |
| Marges de page | top 420–500, bottom 340–400, left/right 650–700 | — | Idem |

### Procédure d'ajustement

1. Premier build avec les valeurs **médianes** de chaque plage.
2. Convertir en PDF, vérifier le nombre de pages.
3. **Si 2 pages** → réduire les espacements progressivement (commencer par bullets et sub-lines), puis si nécessaire descendre la taille des bullets de 0.5–1 point.
4. **Si 1 page mais espace blanc en bas significatif** → augmenter les espacements (commencer par heading et sub-lines pour mieux aérer la structure visuelle).
5. Prévisualiser le PDF en image (`pdftoppm -jpeg -r 150`) et vérifier visuellement. Itérer.

### Astuces de compaction (si débordement)

- Réduire un bullet en fusionnant deux idées avec une virgule.
- Passer la formation en 3 lignes simples sans bullets (le titre suffit).
- Retirer une certification peu pertinente pour le poste.
- Réduire la taille de la photo de 110 à 95 px.

### Astuces d'expansion (si trop de blanc)

- Augmenter `before` des headings et `before` des sub-lines.
- Ajouter un bullet pertinent à l'expérience principale.
- Étoffer le profil d'une phrase sur les soft skills ou la motivation.

## Préparation de la photo

```python
from PIL import Image, ImageDraw
img = Image.open('photo.jpg').convert('RGBA')
w, h = img.size
s = min(w, h)
img = img.crop(((w-s)//2, (h-s)//2, (w-s)//2+s, (h-s)//2+s)).resize((300, 300), Image.LANCZOS)
mask = Image.new('L', (300, 300), 0)
ImageDraw.Draw(mask).ellipse((0, 0, 299, 299), fill=255)
out = Image.new('RGBA', (300, 300), (0, 0, 0, 0))
out.paste(img, (0, 0), mask)
out.save('photo_circle.png', 'PNG')
```

Rendu final dans le docx : 95–110 px de large. Plus grand = écrase le titre ; plus petit = perd en présence.

## Template docx-js (Node.js)

```javascript
const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, LevelFormat, ImageRun, VerticalAlign
} = require("docx");

const NONE = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: NONE, bottom: NONE, left: NONE, right: NONE };

// Palette
const ACCENT = "250286";        // violet
const SECOND = "03C95A";        // vert
const DARK = "1A1A1A";
const GRAY = "444444";
const LIGHT_GRAY = "666666";

const thinBorder = { style: BorderStyle.SINGLE, size: 4, color: SECOND };
const photoBuffer = fs.readFileSync("photo_circle.png");

function heading(text, before = 250, after = 90) {
  return new Paragraph({
    spacing: { before, after },
    border: { bottom: thinBorder },
    children: [new TextRun({ text: text.toUpperCase(), bold: true, size: 21, font: "Arial", color: ACCENT })],
  });
}

function bulletItem(text, spacing = 33) {
  return new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    spacing: { before: spacing, after: spacing },
    children: [new TextRun({ text, size: 17, font: "Arial", color: DARK })],
  });
}

function subLine(title, right, before = 125) {
  return new Paragraph({
    spacing: { before, after: 16 },
    children: [
      new TextRun({ text: title, bold: true, size: 17.5, font: "Arial", color: DARK }),
      new TextRun({ text: "  |  " + right, size: 16.5, font: "Arial", color: LIGHT_GRAY }),
    ],
  });
}

function skillLine(label, items, spacing = 36) {
  return new Paragraph({
    spacing: { before: spacing, after: spacing },
    children: [
      new TextRun({ text: label + " : ", bold: true, size: 17, font: "Arial", color: ACCENT }),
      new TextRun({ text: items, size: 17, font: "Arial", color: GRAY }),
    ],
  });
}

const headerTable = new Table({
  width: { size: 10546, type: WidthType.DXA },
  columnWidths: [2300, 8246],
  rows: [new TableRow({
    children: [
      new TableCell({
        borders: noBorders, width: { size: 2300, type: WidthType.DXA },
        verticalAlign: VerticalAlign.CENTER,
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new ImageRun({
            data: photoBuffer,
            transformation: { width: 105, height: 105 },
            type: "png",
          })],
        })],
      }),
      new TableCell({
        borders: noBorders, width: { size: 8246, type: WidthType.DXA },
        verticalAlign: VerticalAlign.CENTER,
        children: [
          new Paragraph({ spacing: { after: 25 }, children: [new TextRun({ text: "PRÉNOM NOM", bold: true, size: 34, font: "Arial", color: ACCENT })] }),
          new Paragraph({ spacing: { after: 25 }, children: [new TextRun({ text: "Intitulé du poste visé", size: 21, font: "Arial", color: SECOND })] }),
          new Paragraph({ spacing: { after: 11 }, children: [new TextRun({ text: "06 XX XX XX XX | email@domain.com | Ville", size: 17, font: "Arial", color: LIGHT_GRAY })] }),
          new Paragraph({ children: [new TextRun({ text: "site.fr | github.com/handle | Permis B | Bilingue anglais", size: 17, font: "Arial", color: LIGHT_GRAY })] }),
        ],
      }),
    ],
  })],
});

const doc = new Document({
  numbering: {
    config: [{
      reference: "bullets",
      levels: [{
        level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 360, hanging: 220 } } }
      }]
    }]
  },
  styles: { default: { document: { run: { font: "Arial", size: 17 } } } },
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 },           // A4 en twips
        margin: { top: 480, right: 700, bottom: 400, left: 700 }
      }
    },
    children: [
      headerTable,

      heading("Profil"),
      new Paragraph({
        spacing: { before: 45, after: 70 },
        alignment: AlignmentType.JUSTIFIED,
        children: [new TextRun({ text: "Paragraphe de profil…", size: 17, font: "Arial", color: DARK })],
      }),

      heading("Compétences Techniques"),
      skillLine("Catégorie 1", "valeur, valeur, valeur"),
      // …

      heading("Expérience Professionnelle"),
      subLine("Intitulé — Entreprise", "dates, lieu"),
      bulletItem("…"),
      // …

      heading("Projets"),
      subLine("Nom du projet — résumé", "url"),
      bulletItem("Description avec stack et résultat"),
      // …

      heading("Formation"),
      subLine("Diplôme — École", "années, lieu"),
      // …

      heading("Certifications"),
      subLine("Nom — Émetteur", "année"),

      heading("Informations Complémentaires"),
      new Paragraph({
        spacing: { before: 30, after: 20 },
        children: [
          new TextRun({ text: "Langues : ", bold: true, size: 17, font: "Arial", color: ACCENT }),
          new TextRun({ text: "Français (natif), Anglais (bilingue)  |  ", size: 17, font: "Arial", color: GRAY }),
          new TextRun({ text: "Centres d'intérêt : ", bold: true, size: 17, font: "Arial", color: ACCENT }),
          new TextRun({ text: "…", size: 17, font: "Arial", color: GRAY }),
        ],
      }),
    ],
  }],
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("CV.docx", buffer);
});
```

## Pipeline de build (obligatoire avant livraison)

```bash
# 1. Générer le docx
node create_cv.js

# 2. Valider la structure
python /mnt/skills/public/docx/scripts/office/validate.py CV.docx

# 3. Convertir en PDF
python /mnt/skills/public/docx/scripts/office/soffice.py --headless --convert-to pdf CV.docx

# 4. Vérifier le nombre de pages — DOIT être 1
pdfinfo CV.pdf | grep Pages

# 5. Prévisualiser visuellement
pdftoppm -jpeg -r 150 CV.pdf preview
# puis view preview-1.jpg
```

Si **Pages > 1** : compacter et regénérer. Si **espace blanc significatif en bas** : étirer et regénérer. Itérer jusqu'à un rendu propre.

## Erreurs fréquentes à éviter

- **Photo carrée avec coins durs** dans un en-tête professionnel : préférer le rond.
- **Bullets trop longs** (> 2 lignes) : couper en deux ou réécrire plus concis.
- **Liste de compétences exhaustive** non hiérarchisée : 6–7 catégories max, les plus pertinentes en tête.
- **Date au format inhabituel** (`23 mars 2026`) dans les sous-titres : préférer `Sept. 2024 – aujourd'hui` ou `2023 – 2024`.
- **Mélanger les pronoms** : profil à la 3e personne neutre (sans pronom du tout), bullets à l'infinitif ou en substantifs.
- **Surcharger d'icônes ou de barres de progression** : casse l'ATS et le sérieux.
- **Présenter un projet identique sur tous les CV** avec la même description : adapter l'angle au poste.
- **Mention "Recherche alternance"** sur un CV pour un CDI (et inversement) : vérifier le contrat avant publication.
- **Oublier les accents** : utiliser un français correct, docx-js gère l'UTF-8.

## Variantes maîtrisées

- **CV "junior tech"** (1–2 ans d'XP) : projets personnels en avant, expérience courte, formation détaillée.
- **CV "transition de carrière"** (reconvertis) : profil qui assume la double compétence (ex : marketing + dev), bullets qui transfèrent les soft skills, projets persos en preuves.
- **CV "alternance"** : titre mentionnant explicitement `| Alternance N ans`, formation à venir, profil orienté apprentissage et montée en compétences.
- **CV "CDI senior tech"** : 4–6 expériences, projets moins centraux, certifications en valeur, soft skills techniques (lead, mentoring, archi).

Pour chaque variante, le squelette reste identique — c'est le contenu et la pondération qui changent.
