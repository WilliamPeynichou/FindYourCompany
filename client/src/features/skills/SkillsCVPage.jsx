import React, { useMemo, useState } from 'react';
import { Clipboard, Check, Sparkles, ShieldAlert, Code2, BrainCircuit } from 'lucide-react';

// ─── Contract types ────────────────────────────────────────────────────────────
const CONTRACT_TYPES = [
  {
    id: 'ALTERNANCE',
    label: 'Alternance',
    emoji: '🎓',
    color: 'bg-purple-600',
    colorLight: 'bg-purple-50 border-purple-200 text-purple-900',
    desc: 'Contrat d'apprentissage ou de professionnalisation',
  },
  {
    id: 'CDI',
    label: 'CDI',
    emoji: '📄',
    color: 'bg-green-600',
    colorLight: 'bg-green-50 border-green-200 text-green-900',
    desc: 'Contrat à durée indéterminée',
  },
  {
    id: 'CDD',
    label: 'CDD',
    emoji: '📋',
    color: 'bg-blue-600',
    colorLight: 'bg-blue-50 border-blue-200 text-blue-900',
    desc: 'Contrat à durée déterminée',
  },
  {
    id: 'INTERIM',
    label: 'Intérim',
    emoji: '⚡',
    color: 'bg-orange-500',
    colorLight: 'bg-orange-50 border-orange-200 text-orange-900',
    desc: 'Mission d'intérim / travail temporaire',
  },
];

// ─── Skill domains ─────────────────────────────────────────────────────────────
const skillDomains = [
  {
    id: 'dev',
    label: 'Développement web / logiciel',
    family: 'it',
    technical: [
      'HTML', 'CSS', 'JavaScript', 'TypeScript', 'React', 'Next.js', 'Vue.js', 'Nuxt', 'Angular', 'Svelte',
      'Node.js', 'Express', 'NestJS', 'PHP', 'Symfony', 'Laravel', 'Python', 'Django', 'FastAPI',
      'Java', 'Spring Boot', 'C#', '.NET', 'Go', 'Rust', 'API REST', 'GraphQL', 'WebSocket',
      'SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Prisma', 'Sequelize', 'Docker', 'CI/CD',
      'Tests unitaires', 'Tests E2E', 'Clean code', 'Responsive design', 'Accessibilité', 'SEO technique',
    ],
    tools: [
      'VS Code', 'Git', 'GitHub', 'GitLab', 'Docker Desktop', 'Postman', 'Insomnia', 'Figma', 'Vercel',
      'Netlify', 'Railway', 'Render', 'AWS', 'Firebase', 'Supabase', 'Linux', 'Nginx', 'Jira', 'Notion',
    ],
    soft: ['Logique', 'Autonomie', 'Curiosité technique', 'Débogage', 'Rigueur', 'Esprit produit'],
    missions: ['Créer des interfaces', 'Développer des APIs', 'Corriger des bugs', 'Intégrer des maquettes', 'Écrire des tests', 'Déployer une application', 'Documenter le code'],
    cvFocus: ['Architecture front/back', 'qualité du code', 'projets GitHub', 'capacité à apprendre vite', 'livraison concrète'],
    // Skills mise en avant par contrat
    contractEmphasis: {
      CDI: ['TypeScript', 'Tests unitaires', 'Tests E2E', 'CI/CD', 'Clean code', 'Docker', 'Git'],
      CDD: ['React', 'API REST', 'Docker', 'Git', 'Responsive design'],
      INTERIM: ['React', 'JavaScript', 'HTML', 'CSS', 'API REST', 'Git'],
      ALTERNANCE: ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'Git'],
    },
  },
  {
    id: 'data-analysis',
    label: 'Data analyse',
    family: 'it',
    technical: ['SQL', 'Python', 'Pandas', 'NumPy', 'Excel avancé', 'Power Query', 'Data cleaning', 'Data visualisation', 'Statistiques descriptives', 'KPI', 'A/B testing', 'ETL', 'Modélisation de données', 'Reporting automatisé'],
    tools: ['Power BI', 'Tableau', 'Looker Studio', 'Metabase', 'Jupyter Notebook', 'Google Sheets', 'BigQuery', 'PostgreSQL', 'MySQL', 'Snowflake', 'dbt', 'Git', 'Notion'],
    soft: ['Analyse', 'Rigueur', 'Synthèse', 'Pédagogie', 'Esprit business'],
    missions: ['Créer des tableaux de bord', 'Nettoyer des données', 'Suivre des indicateurs', 'Automatiser des rapports', 'Présenter des insights', 'Fiabiliser une source de données'],
    cvFocus: ['SQL', 'visualisation', 'insights métier', 'qualité des données', 'automatisation'],
    contractEmphasis: {
      CDI: ['SQL', 'Power BI', 'Python', 'dbt', 'Modélisation de données'],
      CDD: ['SQL', 'Tableau', 'Reporting automatisé', 'Power Query'],
      INTERIM: ['Excel avancé', 'SQL', 'Power BI', 'Data cleaning'],
      ALTERNANCE: ['SQL', 'Python', 'Excel avancé', 'Power BI'],
    },
  },
  {
    id: 'data-science',
    label: 'Data science / IA',
    family: 'it',
    technical: ['Python', 'Pandas', 'NumPy', 'Scikit-learn', 'Machine learning', 'Deep learning', 'Feature engineering', 'NLP', 'Computer vision', 'Time series', 'Évaluation de modèles', 'MLOps', 'Prompt engineering', 'RAG', 'Vector database', 'Fine-tuning', 'LLM'],
    tools: ['Jupyter', 'Google Colab', 'PyTorch', 'TensorFlow', 'Keras', 'Hugging Face', 'LangChain', 'LlamaIndex', 'OpenAI API', 'Claude API', 'Ollama', 'ChromaDB', 'Pinecone', 'MLflow', 'Weights & Biases', 'Docker', 'Git'],
    soft: ['Esprit scientifique', 'Curiosité IA', 'Rigueur expérimentale', 'Esprit critique', 'Communication des résultats'],
    missions: ['Préparer un dataset', 'Créer un modèle prédictif', 'Évaluer un modèle', 'Créer un prototype IA', 'Mettre en place un RAG', 'Documenter des expérimentations'],
    cvFocus: ['projets IA', 'datasets', 'métriques', 'expérimentation', 'déploiement de prototypes'],
    contractEmphasis: {
      CDI: ['MLOps', 'Machine learning', 'Python', 'Docker', 'MLflow', 'RAG'],
      CDD: ['Python', 'Scikit-learn', 'NLP', 'LLM', 'RAG'],
      INTERIM: ['Python', 'Pandas', 'Machine learning', 'Prompt engineering'],
      ALTERNANCE: ['Python', 'Scikit-learn', 'Machine learning', 'Jupyter'],
    },
  },
  { id: 'cyber', label: 'Cybersécurité', family: 'it', technical: ['Linux', 'Réseaux', 'OWASP', 'Analyse de logs', 'Pentest bases', 'Sécurité web', 'IAM', 'Durcissement', 'Sensibilisation'], tools: ['Wireshark', 'Burp Suite', 'Nmap', 'SIEM', 'Kali Linux', 'Git', 'Docker'], soft: ['Rigueur', 'Patience', 'Esprit critique'], missions: ['Surveiller des alertes', 'Documenter des risques', 'Aider aux audits', 'Écrire des procédures'], cvFocus: ['sécurité web', 'méthodologie', 'outillage', 'documentation'], contractEmphasis: { CDI: ['Linux', 'SIEM', 'IAM', 'Durcissement', 'OWASP'], CDD: ['Analyse de logs', 'Sécurité web', 'OWASP'], INTERIM: ['Linux', 'Réseaux', 'Analyse de logs'], ALTERNANCE: ['Linux', 'Réseaux', 'OWASP', 'Sécurité web'] } },
  { id: 'marketing', label: 'Marketing digital', technical: ['SEO', 'Réseaux sociaux', 'Emailing', 'Content marketing', 'Analyse de trafic'], tools: ['Google Analytics', 'Canva', 'Meta Business Suite', 'Brevo'], soft: ['Créativité', 'Rigueur', 'Esprit d'analyse'], missions: ['Créer des contenus', 'Suivre les campagnes', 'Optimiser le référencement', 'Analyser les performances'], contractEmphasis: { CDI: ['SEO', 'Analyse de trafic', 'Content marketing'], CDD: ['Réseaux sociaux', 'Emailing', 'Content marketing'], INTERIM: ['Réseaux sociaux', 'Canva', 'Emailing'], ALTERNANCE: ['SEO', 'Réseaux sociaux', 'Content marketing'] } },
  { id: 'commerce', label: 'Commerce / vente', technical: ['Prospection', 'Négociation', 'CRM', 'Relation client', 'Argumentaire'], tools: ['HubSpot', 'Salesforce', 'Excel', 'LinkedIn'], soft: ['Écoute', 'Persévérance', 'Aisance orale'], missions: ['Qualifier des prospects', 'Relancer des clients', 'Préparer des rendez-vous', 'Suivre un portefeuille'], contractEmphasis: { CDI: ['Négociation', 'CRM', 'Relation client'], CDD: ['Prospection', 'Relation client', 'CRM'], INTERIM: ['Prospection', 'Relation client', 'Argumentaire'], ALTERNANCE: ['CRM', 'Prospection', 'Relation client'] } },
  { id: 'communication', label: 'Communication', technical: ['Stratégie éditoriale', 'Community management', 'Rédaction web', 'Brand content'], tools: ['Canva', 'Notion', 'Suite Adobe', 'CapCut'], soft: ['Expression écrite', 'Créativité', 'Organisation'], missions: ['Planifier des publications', 'Rédiger des supports', 'Créer des visuels', 'Suivre l'image de marque'], contractEmphasis: { CDI: ['Stratégie éditoriale', 'Brand content', 'Community management'], CDD: ['Community management', 'Rédaction web', 'Canva'], INTERIM: ['Rédaction web', 'Canva', 'Community management'], ALTERNANCE: ['Community management', 'Rédaction web', 'Canva'] } },
  { id: 'design', label: 'Design', technical: ['UI design', 'UX research', 'Prototypage', 'Design system'], tools: ['Figma', 'Illustrator', 'Photoshop', 'Canva'], soft: ['Sens du détail', 'Empathie utilisateur', 'Créativité'], missions: ['Créer des maquettes', 'Améliorer un parcours', 'Décliner une charte', 'Tester des prototypes'], contractEmphasis: { CDI: ['Design system', 'UX research', 'Prototypage'], CDD: ['UI design', 'Prototypage', 'Figma'], INTERIM: ['UI design', 'Canva', 'Figma'], ALTERNANCE: ['UI design', 'UX research', 'Figma'] } },
  { id: 'accounting', label: 'Comptabilité', technical: ['Saisie comptable', 'Rapprochement bancaire', 'Facturation', 'Déclarations'], tools: ['Excel', 'Sage', 'Pennylane', 'Cegid'], soft: ['Rigueur', 'Discrétion', 'Fiabilité'], missions: ['Classer des pièces', 'Suivre les factures', 'Préparer des tableaux', 'Aider aux clôtures'], contractEmphasis: { CDI: ['Rapprochement bancaire', 'Déclarations', 'Sage'], CDD: ['Saisie comptable', 'Facturation', 'Excel'], INTERIM: ['Saisie comptable', 'Excel', 'Facturation'], ALTERNANCE: ['Saisie comptable', 'Facturation', 'Excel'] } },
  { id: 'hr', label: 'Ressources humaines', technical: ['Recrutement', 'Onboarding', 'Administration du personnel', 'Marque employeur'], tools: ['Excel', 'LinkedIn', 'ATS', 'Notion'], soft: ['Écoute', 'Confidentialité', 'Organisation'], missions: ['Trier des candidatures', 'Planifier des entretiens', 'Préparer l'accueil', 'Mettre à jour des dossiers'], contractEmphasis: { CDI: ['Recrutement', 'Marque employeur', 'Administration du personnel'], CDD: ['Recrutement', 'Onboarding', 'LinkedIn'], INTERIM: ['Administration du personnel', 'Excel', 'LinkedIn'], ALTERNANCE: ['Recrutement', 'Onboarding', 'LinkedIn'] } },
  { id: 'project', label: 'Gestion de projet', technical: ['Planification', 'Suivi KPI', 'Coordination', 'Compte rendu'], tools: ['Trello', 'Notion', 'Jira', 'Excel'], soft: ['Organisation', 'Communication', 'Esprit d'équipe'], missions: ['Suivre un planning', 'Animer des points', 'Documenter un projet', 'Coordonner des actions'], contractEmphasis: { CDI: ['Planification', 'Suivi KPI', 'Coordination'], CDD: ['Planification', 'Jira', 'Compte rendu'], INTERIM: ['Coordination', 'Trello', 'Compte rendu'], ALTERNANCE: ['Planification', 'Trello', 'Coordination'] } },
  { id: 'realestate', label: 'Immobilier', technical: ['Prospection', 'Estimation', 'Visites', 'Relation propriétaire'], tools: ['CRM immobilier', 'Excel', 'Portails annonces'], soft: ['Sens commercial', 'Présentation', 'Réactivité'], missions: ['Préparer des annonces', 'Qualifier des contacts', 'Organiser des visites', 'Mettre à jour le CRM'], contractEmphasis: { CDI: ['Estimation', 'Prospection', 'Relation propriétaire'], CDD: ['Prospection', 'Visites', 'CRM immobilier'], INTERIM: ['Visites', 'Relation propriétaire', 'Excel'], ALTERNANCE: ['Prospection', 'Visites', 'CRM immobilier'] } },
  { id: 'hotel', label: 'Restauration / hôtellerie', technical: ['Accueil client', 'Service', 'Réservation', 'Hygiène HACCP'], tools: ['Logiciel de caisse', 'Planning', 'Plateformes réservation'], soft: ['Dynamisme', 'Gestion du stress', 'Sens du service'], missions: ['Accueillir les clients', 'Préparer le service', 'Gérer les réservations', 'Participer à la satisfaction client'], contractEmphasis: { CDI: ['Service', 'Hygiène HACCP', 'Accueil client'], CDD: ['Service', 'Accueil client', 'Réservation'], INTERIM: ['Service', 'Accueil client', 'Logiciel de caisse'], ALTERNANCE: ['Accueil client', 'Service', 'Hygiène HACCP'] } },
  { id: 'btp', label: 'BTP', technical: ['Lecture de plans', 'Suivi chantier', 'Sécurité', 'Métrés'], tools: ['AutoCAD', 'Excel', 'Planning chantier'], soft: ['Précision', 'Esprit terrain', 'Respect des règles'], missions: ['Aider au suivi chantier', 'Préparer des documents', 'Contrôler des métrés', 'Suivre la sécurité'], contractEmphasis: { CDI: ['Suivi chantier', 'Métrés', 'AutoCAD'], CDD: ['Lecture de plans', 'Suivi chantier', 'Excel'], INTERIM: ['Sécurité', 'Suivi chantier', 'Excel'], ALTERNANCE: ['Lecture de plans', 'Métrés', 'Suivi chantier'] } },
  { id: 'social', label: 'Santé / social', technical: ['Accueil usager', 'Accompagnement', 'Dossier patient', 'Prévention'], tools: ['Logiciels métier', 'Pack Office', 'Planning'], soft: ['Empathie', 'Patience', 'Confidentialité'], missions: ['Aider à l'accueil', 'Mettre à jour des dossiers', 'Participer à des actions', 'Orienter les usagers'], contractEmphasis: { CDI: ['Accompagnement', 'Dossier patient', 'Prévention'], CDD: ['Accueil usager', 'Accompagnement', 'Pack Office'], INTERIM: ['Accueil usager', 'Pack Office', 'Dossier patient'], ALTERNANCE: ['Accueil usager', 'Accompagnement', 'Prévention'] } },
];

// ─── Prompt templates par contrat ──────────────────────────────────────────────
const getPromptTemplates = (contractType) => {
  const label = CONTRACT_TYPES.find(c => c.id === contractType)?.label || contractType;
  return [
    contractType === 'ALTERNANCE'
      ? ['CV-IT dynamique prioritaire', 'À partir du profil ci-dessous, applique strictement le skill CV-IT.md : crée le contenu d'un CV informatique ATS-friendly sur exactement 1 page A4. Respecte l'ordre fixe Header, Profil, Compétences Techniques, Expérience Professionnelle, Projets, Formation, Certifications, Informations Complémentaires. Adapte le titre "Alternance", l'ordre des compétences, les mots-clés et l'angle des projets au poste visé. Donne un contenu prêt à intégrer dans un template docx-js.']
      : ['CV-IT prioritaire — ' + label, `À partir du profil ci-dessous, applique le skill CV-IT.md : crée un CV ${label} ATS-friendly sur exactement 1 page A4. Adapte le titre, les compétences et les projets à un profil ${label}. Mets en avant autonomie, expérience opérationnelle et livrables concrets.`],
    contractType === 'ALTERNANCE'
      ? ['Améliore mon CV pour une alternance', 'À partir de mon profil ci-dessous, aide-moi à améliorer mon CV pour une recherche d'alternance. Propose un titre, une accroche courte, les compétences à mettre en avant et reformule mes expériences de façon professionnelle.']
      : contractType === 'CDI'
      ? ['Améliore mon CV pour un CDI', 'À partir de mon profil ci-dessous, aide-moi à améliorer mon CV pour un CDI. Mets en avant ma stabilité, ma progression, mon autonomie et mes livrables à fort impact.']
      : contractType === 'CDD'
      ? ['Améliore mon CV pour un CDD', 'À partir de mon profil ci-dessous, optimise mon CV pour un CDD. Insiste sur la rapidité de prise en main, l'adaptabilité, les missions réalisées et les résultats concrets.']
      : ['Améliore mon CV pour une mission intérim', 'À partir de mon profil ci-dessous, optimise mon CV pour une mission d'intérim. Mets en avant la réactivité, la polyvalence, la capacité à s'intégrer rapidement et les compétences opérationnelles immédiates.'],
    contractType === 'ALTERNANCE'
      ? ['Rédige un email de candidature spontanée', 'À partir de mon profil ci-dessous, rédige un email court et professionnel pour une candidature spontanée en alternance. Le ton doit être naturel, motivé et facile à personnaliser.']
      : ['Rédige un email de candidature spontanée', `Rédige un email de candidature spontanée pour un ${label} à partir de mon profil ci-dessous. Ton professionnel, concis, orienté valeur ajoutée immédiate.`],
    contractType === 'ALTERNANCE'
      ? ['Rédige une lettre de motivation courte', 'À partir de mon profil ci-dessous, rédige une lettre de motivation courte pour une alternance. Elle doit tenir sur une page, être concrète et adaptée à un profil junior.']
      : ['Rédige une lettre de motivation courte', `Rédige une lettre de motivation courte pour un ${label} à partir de mon profil. Une page, tone direct, preuves concrètes, valeur opérationnelle.`],
    ['Adapte mon profil à cette entreprise', 'À partir de mon profil ci-dessous et des informations de l'entreprise que je vais ajouter, explique quels arguments je dois mettre en avant pour maximiser mes chances.'],
    ['Trouve les compétences à mettre en avant', `Analyse mon profil ci-dessous et liste les compétences les plus pertinentes pour mon CV, mon email et un entretien pour un ${label}.`],
    ['Corrige et rends mon message plus professionnel', `Corrige le message que je vais écrire ensuite. Rends-le plus professionnel, clair et adapté à une candidature ${label}, sans le rendre trop long.`],
  ];
};

// ─── Profile fields par contrat ────────────────────────────────────────────────
const getProfileFields = (contractType) => {
  const common = [
    ['targetJob', 'Métier / poste visé'],
    ['formation', 'Formation / diplôme'],
    ['level', 'Niveau d'étude'],
    ['mobility', 'Localisation / mobilité'],
    ['companyType', 'Type d'entreprise souhaité'],
  ];
  if (contractType === 'ALTERNANCE') {
    return [
      ...common,
      ['rhythm', 'Rythme d'alternance (ex : 3j/2j)'],
      ['startDate', 'Date de début souhaitée'],
      ['duration', 'Durée recherchée (1 an, 2 ans…)'],
    ];
  }
  if (contractType === 'CDI') {
    return [
      ...common,
      ['experience', 'Années d'expérience'],
      ['availability', 'Disponibilité (immédiate, préavis…)'],
      ['salaryExpectations', 'Prétentions salariales'],
    ];
  }
  if (contractType === 'CDD') {
    return [
      ...common,
      ['experience', 'Années d'expérience'],
      ['availability', 'Disponibilité'],
      ['duration', 'Durée souhaitée du CDD'],
    ];
  }
  if (contractType === 'INTERIM') {
    return [
      ...common,
      ['experience', 'Années d'expérience'],
      ['availability', 'Disponibilité immédiate ?'],
      ['flexibility', 'Zones géographiques / flexibilité horaire'],
      ['duration', 'Durée mission souhaitée'],
    ];
  }
  return common;
};

// ─── Empty profile ─────────────────────────────────────────────────────────────
const emptyProfile = {
  firstName: '', lastName: '', phone: '', email: '', city: '', languages: '', drivingLicense: '', certifications: '', interests: '', targetJob: '', formation: '', level: '', rhythm: '', startDate: '', duration: '', mobility: '', companyType: '', experience: '', availability: '', salaryExpectations: '', flexibility: '', projects: '', experiences: '', goals: '', extraSkills: '', freeStacks: '', github: '', portfolio: '', projectLinks: '', jobOfferKeywords: '',
};

// ─── Helpers ───────────────────────────────────────────────────────────────────
const CopyButton = ({ text, children }) => {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };
  return (
    <button onClick={copy} className="inline-flex items-center gap-2 text-xs bg-zinc-900 text-white px-3 py-2 rounded-lg hover:bg-zinc-700">
      {copied ? <Check className="w-3 h-3" /> : <Clipboard className="w-3 h-3" />}
      {copied ? 'Copié' : children}
    </button>
  );
};

const splitFreeList = (value) => value.split(/[,\n]/).map(item => item.trim()).filter(Boolean);

const getCvItSkillLines = (domain, selectedStack, profile) => {
  const stack = selectedStack.join(', ') || 'À compléter';
  const keywords = profile.jobOfferKeywords || 'À compléter avec les mots-clés de l'offre';
  if (domain.id === 'data-analysis') {
    return [
      ['Data & SQL', stack],
      ['Visualisation', 'Power BI, Tableau, Looker Studio, dashboards, KPI'],
      ['Traitement', 'nettoyage de données, ETL, reporting automatisé, qualité des données'],
      ['Bases de données', 'PostgreSQL, MySQL, BigQuery, modélisation de données'],
      ['Outils', 'Jupyter, Excel avancé, Git, dbt, Notion'],
      ['Mots-clés offre', keywords],
    ];
  }
  if (domain.id === 'data-science') {
    return [
      ['Data & ML', stack],
      ['IA & LLM', 'RAG, prompt engineering, vector database, Hugging Face, OpenAI API, Claude API'],
      ['Modélisation', 'feature engineering, évaluation de modèles, NLP, computer vision'],
      ['MLOps & outils', 'MLflow, Docker, Git, Jupyter, expérimentation'],
      ['Bases de données', 'SQL, datasets, pipelines, qualité des données'],
      ['Mots-clés offre', keywords],
    ];
  }
  if (domain.id === 'cyber') {
    return [
      ['Sécurité web', stack],
      ['Réseaux & systèmes', 'Linux, durcissement, analyse de logs, supervision'],
      ['Méthodologie', 'OWASP, documentation des risques, procédures, sensibilisation'],
      ['Outils', 'Wireshark, Burp Suite, Nmap, SIEM, Git'],
      ['Soft skills tech', 'rigueur, esprit critique, confidentialité, communication'],
      ['Mots-clés offre', keywords],
    ];
  }
  return [
    ['Frontend', stack],
    ['Backend & API', 'Node.js, Express/NestJS, API REST, GraphQL, authentification, intégrations'],
    ['Bases de données', 'PostgreSQL, MySQL, MongoDB, Redis, ORM, modélisation'],
    ['DevOps & qualité', 'Git, Docker, CI/CD, tests unitaires/E2E, déploiement'],
    ['Outils', 'VS Code, GitHub/GitLab, Postman, Figma, Linux, cloud'],
    ['Mots-clés offre', keywords],
  ];
};

const buildCvItOutput = ({ profile, domain, selectedStack, projectLinks, contractType }) => {
  const fullName = `${profile.firstName || 'PRÉNOM'} ${profile.lastName || 'NOM'}`.trim();
  const contractLabel = CONTRACT_TYPES.find(c => c.id === contractType)?.label || contractType;
  const contractSuffix = contractType === 'ALTERNANCE'
    ? ' | Alternance'
    : contractType === 'INTERIM'
    ? ' | Intérim'
    : ` | ${contractLabel}`;
  const title = `${profile.targetJob || domain.label}${contractSuffix}`;
  const contactLine1 = `${profile.phone || '06 XX XX XX XX'} | ${profile.email || 'email@domain.com'} | ${profile.city || profile.mobility || 'Ville'}`;
  const contactLine2 = `${profile.portfolio || 'portfolio/site'} | ${profile.github || 'github.com/handle'} | ${profile.drivingLicense || 'Permis à compléter'} | ${profile.languages || 'Langues à compléter'}`;
  const skillLines = getCvItSkillLines(domain, selectedStack, profile);
  const projectLines = [profile.github, profile.portfolio, ...projectLinks].filter(Boolean);

  // Contexte spécifique au type de contrat
  let contractContext = '';
  if (contractType === 'ALTERNANCE') {
    contractContext = `Rythme : ${profile.rhythm || 'À compléter'} | Début : ${profile.startDate || 'À compléter'} | Durée : ${profile.duration || 'À compléter'}`;
  } else if (contractType === 'CDI') {
    contractContext = `Expérience : ${profile.experience || 'À compléter'} | Disponibilité : ${profile.availability || 'À compléter'} | Prétentions : ${profile.salaryExpectations || 'À compléter'}`;
  } else if (contractType === 'CDD') {
    contractContext = `Expérience : ${profile.experience || 'À compléter'} | Disponibilité : ${profile.availability || 'À compléter'} | Durée CDD : ${profile.duration || 'À compléter'}`;
  } else if (contractType === 'INTERIM') {
    contractContext = `Expérience : ${profile.experience || 'À compléter'} | Disponibilité : ${profile.availability || 'immédiate'} | Flexibilité : ${profile.flexibility || 'À compléter'}`;
  }

  return `CV-IT.md — CONTENU ATS-FRIENDLY 1 PAGE A4 [${contractLabel.toUpperCase()}]

Règles à respecter :
- CV informatique uniquement, ATS d'abord, design ensuite.
- Une seule page A4 exactement, texte parsable, Arial, sections claires.
- Structure fixe : Header, Profil, Compétences Techniques, Expérience Professionnelle, Projets, Formation, Certifications, Informations Complémentaires.
- Adapter le titre, l'ordre des compétences et l'angle des projets au poste visé (${contractLabel}).
- Utiliser les mots-clés exacts de l'offre quand ils sont fournis.

1. HEADER
Nom : ${fullName}
Titre : ${title}
Contacts ligne 1 : ${contactLine1}
Contacts ligne 2 : ${contactLine2}
Contrat recherché : ${contractLabel}
${contractContext}

2. PROFIL — 4 à 6 lignes justifiées
${contractType === 'ALTERNANCE'
  ? `Profil junior orienté ${domain.label}, en recherche d'alternance${profile.startDate ? ` à partir de ${profile.startDate}` : ''}${profile.rhythm ? ` avec un rythme ${profile.rhythm}` : ''}. Mettre en avant la stack ${selectedStack.slice(0, 8).join(', ') || 'à compléter'}, les projets personnels, la capacité d'apprentissage et les preuves concrètes.`
  : contractType === 'CDI'
  ? `Profil ${domain.label} avec ${profile.experience || 'X ans'} d'expérience, à la recherche d'un CDI. Mettre en avant l'autonomie, la qualité de code, les livrables à fort impact et la capacité à s'inscrire dans la durée.`
  : contractType === 'CDD'
  ? `Profil ${domain.label} disponible pour un CDD de ${profile.duration || 'durée à préciser'}. Mettre en avant la rapidité de prise en main, les missions menées à terme et les résultats concrets.`
  : `Profil ${domain.label} disponible immédiatement pour des missions d'intérim. Polyvalent, opérationnel rapidement, habitué à s'intégrer dans des équipes nouvelles.`}
Reformuler selon le poste visé : ${profile.targetJob || domain.label}
Objectif : ${profile.goals || 'À compléter'}

3. COMPÉTENCES TECHNIQUES — 6 à 7 lignes label : valeurs
${skillLines.map(([label, value]) => `${label} : ${value}`).join('\n')}

4. EXPÉRIENCE PROFESSIONNELLE — 2 à 3 postes si possible
${profile.experiences || 'À compléter : intitulé — entreprise | dates, lieu + 3 à 6 bullets concis commençant par un verbe d'action ou un substantif technique.'}

5. PROJETS — 3 à 5 projets orientés poste
Liens publics à analyser/valoriser :
${projectLines.map(link => `- ${link}`).join('\n') || '- À compléter avec GitHub, portfolio, démos ou repos publics'}

Descriptions projets fournies :
${profile.projects || 'À compléter : pour chaque projet, indiquer nom, objectif, URL, stack, résultat, métrique ou apprentissage.'}

6. FORMATION
${profile.formation || 'Formation à compléter'}${profile.level ? ` — ${profile.level}` : ''}

7. CERTIFICATIONS
${profile.certifications || 'À compléter si pertinent, sinon section optionnelle.'}

8. INFORMATIONS COMPLÉMENTAIRES
Langues : ${profile.languages || 'À compléter'} | Permis : ${profile.drivingLicense || 'À compléter'} | Centres d'intérêt : ${profile.interests || 'À compléter'}

MOTS-CLÉS D'OFFRE À RETROUVER EXPLICITEMENT
${profile.jobOfferKeywords || 'À compléter : colle ici les mots techniques et soft skills de l'annonce.'}

CONSIGNE POUR L'IA
Génère le contenu final du CV selon CV-IT.md pour un ${contractLabel}. Priorise la pertinence ATS, compresse pour 1 page A4, hiérarchise les compétences, reformule les projets selon le poste et propose si besoin quelles informations manquent pour produire un DOCX/PDF final.`;
};

// ─── Main component ────────────────────────────────────────────────────────────
export const SkillsCVPage = () => {
  const [contractType, setContractType] = useState('ALTERNANCE');
  const [selectedDomain, setSelectedDomain] = useState(skillDomains[0].id);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [profile, setProfile] = useState(emptyProfile);

  const domain = skillDomains.find(item => item.id === selectedDomain) || skillDomains[0];
  const isItProfile = domain.family === 'it';
  const activeContract = CONTRACT_TYPES.find(c => c.id === contractType);

  // Skills mis en avant pour ce contrat
  const emphasizedSkills = domain.contractEmphasis?.[contractType] || [];

  const toggleSkill = (skill) => setSelectedSkills(prev =>
    prev.includes(skill) ? prev.filter(item => item !== skill) : [...prev, skill],
  );
  const update = (key, value) => setProfile(prev => ({ ...prev, [key]: value }));

  const freeStacks = splitFreeList(profile.freeStacks);
  const projectLinks = splitFreeList(profile.projectLinks);
  const selectedStack = [...selectedSkills, ...freeStacks, profile.extraSkills].filter(Boolean);

  const cvItOutput = useMemo(() => {
    if (!isItProfile) return '';
    return buildCvItOutput({ profile, domain, selectedStack, projectLinks, contractType });
  }, [isItProfile, profile, domain, selectedStack, projectLinks, contractType]);

  const contractLabel = activeContract?.label || contractType;

  const generatedProfile = useMemo(() => {
    const contractSection = contractType === 'ALTERNANCE'
      ? `Rythme d'alternance : ${profile.rhythm || 'À compléter'}\nDate de début : ${profile.startDate || 'À compléter'}\nDurée recherchée : ${profile.duration || 'À compléter'}`
      : contractType === 'CDI'
      ? `Expérience : ${profile.experience || 'À compléter'}\nDisponibilité : ${profile.availability || 'À compléter'}\nPrétentions salariales : ${profile.salaryExpectations || 'À compléter'}`
      : contractType === 'CDD'
      ? `Expérience : ${profile.experience || 'À compléter'}\nDisponibilité : ${profile.availability || 'À compléter'}\nDurée CDD : ${profile.duration || 'À compléter'}`
      : `Expérience : ${profile.experience || 'À compléter'}\nDisponibilité : ${profile.availability || 'immédiate'}\nFlexibilité : ${profile.flexibility || 'À compléter'}\nDurée mission : ${profile.duration || 'À compléter'}`;

    return `${isItProfile ? `${cvItOutput}\n\n---\n\n` : ''}PROFIL POUR CANDIDATURE — ${contractLabel.toUpperCase()}

Métier ou domaine visé : ${profile.targetJob || domain.label}
Formation actuelle : ${profile.formation || 'À compléter'}
Niveau d'étude : ${profile.level || 'À compléter'}
${contractSection}
Localisation / mobilité : ${profile.mobility || 'À compléter'}
Type d'entreprise souhaité : ${profile.companyType || 'À compléter'}

Compétences techniques, outils et stacks :
${selectedStack.map(item => `- ${item}`).join('\n') || '- À compléter'}

Qualités utiles :
${domain.soft.map(item => `- ${item}`).join('\n')}

Exemples de missions possibles :
${domain.missions.map(item => `- ${item}`).join('\n')}

Projets réalisés :
${profile.projects || 'À compléter'}

Liens projets / GitHub / portfolio :
${profile.github ? `- GitHub : ${profile.github}\n` : ''}${profile.portfolio ? `- Portfolio : ${profile.portfolio}\n` : ''}${projectLinks.map(link => `- ${link}`).join('\n') || '- À compléter'}

Expériences :
${profile.experiences || 'À compléter'}

Objectif professionnel :
${profile.goals || 'À compléter'}

Consigne : aide-moi à transformer ces informations en CV, email de candidature ou lettre de motivation pour un ${contractLabel}.${isItProfile ? ' Pour ce profil informatique/data, priorise la sortie CV-IT, la stack, les projets et les liens GitHub.' : ''}`;
  }, [profile, selectedStack, domain, isItProfile, cvItOutput, projectLinks, contractType, contractLabel]);

  const promptTemplates = useMemo(() => getPromptTemplates(contractType), [contractType]);
  const profileFields = useMemo(() => getProfileFields(contractType), [contractType]);

  return (
    <section className="space-y-8">
      {/* Hero */}
      <div className="bg-zinc-950 text-white rounded-3xl p-8 md:p-10 relative overflow-hidden">
        <Sparkles className="absolute right-6 top-6 w-24 h-24 text-red-600 opacity-20" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex bg-red-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-5">Skills & CV</div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4">Prépare ton CV avec tes stacks, projets et skills.</h1>
          <p className="text-zinc-300">Choisis ton type de contrat — le contenu, les champs et les prompts s'adaptent automatiquement.</p>
        </div>
      </div>

      {/* ── Sélecteur de contrat ── */}
      <div className="bg-white border border-zinc-200 rounded-3xl p-6">
        <h2 className="text-xl font-bold mb-4">Tu cherches un…</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {CONTRACT_TYPES.map(c => (
            <button
              key={c.id}
              onClick={() => setContractType(c.id)}
              className={`flex flex-col items-center gap-2 py-4 px-3 rounded-2xl border-2 transition-all font-semibold text-sm
                ${contractType === c.id
                  ? `${c.color} text-white border-transparent shadow-lg scale-105`
                  : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:border-zinc-400 hover:bg-zinc-100'}`}
            >
              <span className="text-2xl">{c.emoji}</span>
              <span>{c.label}</span>
              {contractType === c.id && <span className="text-[10px] font-normal opacity-80">{c.desc}</span>}
            </button>
          ))}
        </div>

        {/* Badge contextuel */}
        <div className={`mt-4 rounded-2xl px-4 py-3 border text-sm font-medium flex items-center gap-2 ${activeContract?.colorLight}`}>
          <span>{activeContract?.emoji}</span>
          <span>
            {contractType === 'ALTERNANCE' && 'Les compétences junior et le rythme école/entreprise sont mis en avant.'}
            {contractType === 'CDI' && 'Les compétences avancées, l'autonomie et les livrables durables sont prioritaires.'}
            {contractType === 'CDD' && 'La rapidité de prise en main, l'adaptabilité et les missions concrètes sont valorisées.'}
            {contractType === 'INTERIM' && 'La disponibilité immédiate, la polyvalence et la réactivité sont les atouts clés.'}
          </span>
        </div>
      </div>

      {/* Alerte sécurité */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 text-sm text-amber-900">
        <ShieldAlert className="w-5 h-5 flex-shrink-0" />
        <p>Ne partage pas d'informations sensibles avec un outil externe. Pour GitHub/projets, donne seulement des liens publics que tu veux valoriser.</p>
      </div>

      <div className="grid lg:grid-cols-[1fr_1fr] gap-8">
        {/* ── Colonne gauche : formulaire ── */}
        <div className="space-y-6">
          {/* Domaine */}
          <div className="bg-white border border-zinc-200 rounded-3xl p-6">
            <h2 className="text-xl font-bold mb-4">1. Choisis ton domaine</h2>
            <div className="grid sm:grid-cols-2 gap-2">
              {skillDomains.map(item => (
                <button
                  key={item.id}
                  onClick={() => { setSelectedDomain(item.id); setSelectedSkills([]); }}
                  className={selectedDomain === item.id
                    ? 'text-left text-sm bg-red-600 text-white px-3 py-2 rounded-xl'
                    : 'text-left text-sm bg-zinc-50 border border-zinc-200 px-3 py-2 rounded-xl hover:border-zinc-400'}
                >
                  {item.family === 'it' ? '💻 ' : ''}{item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Mode CV-IT */}
          {isItProfile && (
            <div className="bg-blue-50 border border-blue-100 rounded-3xl p-6">
              <div className="flex items-center gap-2 mb-2 text-blue-900 font-bold">
                <BrainCircuit className="w-5 h-5" /> Mode CV-IT prioritaire activé
              </div>
              <p className="text-sm text-blue-800">La sortie suit CV-IT.md : Header, Profil, Compétences Techniques, Expérience, Projets, Formation, Certifications — avec tailoring {contractLabel} et ATS.</p>
            </div>
          )}

          {/* Skills */}
          <div className="bg-white border border-zinc-200 rounded-3xl p-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 className="text-xl font-bold">2. Sélectionne tes compétences</h2>
              {emphasizedSkills.length > 0 && (
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${activeContract?.color} text-white uppercase tracking-wider`}>
                  {contractLabel}
                </span>
              )}
            </div>

            {/* Shortcut : compétences recommandées pour ce contrat */}
            {emphasizedSkills.length > 0 && (
              <div className={`mb-4 rounded-2xl p-3 border ${activeContract?.colorLight}`}>
                <p className="text-xs font-semibold mb-2">⭐ Recommandées pour un {contractLabel}</p>
                <div className="flex flex-wrap gap-2">
                  {emphasizedSkills.map(skill => (
                    <button
                      key={skill}
                      onClick={() => toggleSkill(skill)}
                      className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-all
                        ${selectedSkills.includes(skill)
                          ? `${activeContract?.color} text-white border-transparent`
                          : 'bg-white border-current hover:opacity-80'}`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4">
              {[['Compétences / stacks', domain.technical], ['Outils', domain.tools], ['Qualités', domain.soft]].map(([title, list]) => (
                <div key={title}>
                  <h3 className="text-sm font-semibold text-zinc-700 mb-2">{title}</h3>
                  <div className="flex flex-wrap gap-2">
                    {list.map(skill => (
                      <button
                        key={skill}
                        onClick={() => toggleSkill(skill)}
                        className={selectedSkills.includes(skill)
                          ? 'text-xs bg-zinc-900 text-white px-3 py-1.5 rounded-full'
                          : 'text-xs bg-zinc-100 text-zinc-700 px-3 py-1.5 rounded-full hover:bg-zinc-200'}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <textarea
              value={profile.freeStacks}
              onChange={e => update('freeStacks', e.target.value)}
              placeholder="Ajoute tes stacks libres : Tailwind, Zustand, Astro, Kubernetes, Airflow, Streamlit, etc. Sépare par virgule ou ligne."
              className="mt-4 w-full border border-zinc-200 rounded-xl px-3 py-2 text-sm min-h-20 focus:outline-none focus:ring-2 focus:ring-red-100"
            />
          </div>

          {/* Identité */}
          <div className="bg-white border border-zinc-200 rounded-3xl p-6">
            <h2 className="text-xl font-bold mb-4">3. Identité et contact</h2>
            <div className="grid sm:grid-cols-2 gap-3 mb-3">
              {[['firstName', 'Prénom'], ['lastName', 'Nom'], ['phone', 'Téléphone'], ['email', 'Email'], ['city', 'Ville'], ['languages', 'Langues'], ['drivingLicense', 'Permis'], ['interests', 'Centres d'intérêt']].map(([key, label]) => (
                <input key={key} value={profile[key]} onChange={e => update(key, e.target.value)} placeholder={label} className="border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-100" />
              ))}
            </div>

            {/* Profil — champs adaptés au contrat */}
            <h2 className="text-xl font-bold mb-4 mt-2">
              4. Ton profil <span className={`text-sm font-semibold ml-1 px-2 py-0.5 rounded-full ${activeContract?.color} text-white`}>{contractLabel}</span>
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {profileFields.map(([key, label]) => (
                <input key={key} value={profile[key]} onChange={e => update(key, e.target.value)} placeholder={label} className="border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-100" />
              ))}
            </div>

            <div className="grid gap-3 mt-3">
              <input value={profile.github} onChange={e => update('github', e.target.value)} placeholder="Lien GitHub public" className="border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-100" />
              <input value={profile.portfolio} onChange={e => update('portfolio', e.target.value)} placeholder="Portfolio / site perso / démo" className="border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-100" />
              <textarea value={profile.projectLinks} onChange={e => update('projectLinks', e.target.value)} placeholder="Liens projets perso ou repos GitHub, un par ligne ou séparés par virgule." className="border border-zinc-200 rounded-xl px-3 py-2 text-sm min-h-20 focus:outline-none focus:ring-2 focus:ring-red-100" />
              <textarea value={profile.jobOfferKeywords} onChange={e => update('jobOfferKeywords', e.target.value)} placeholder="Mots-clés exacts de l'offre à retrouver dans le CV : React, API REST, autonomie, code review, Power BI…" className="border border-zinc-200 rounded-xl px-3 py-2 text-sm min-h-20 focus:outline-none focus:ring-2 focus:ring-red-100" />
              <textarea value={profile.projects} onChange={e => update('projects', e.target.value)} placeholder="Décris tes projets : nom, objectif, URL, stack, fonctionnalités, résultat, métriques ou apprentissages" className="border border-zinc-200 rounded-xl px-3 py-2 text-sm min-h-20 focus:outline-none focus:ring-2 focus:ring-red-100" />
              <textarea value={profile.experiences} onChange={e => update('experiences', e.target.value)} placeholder="Expériences : intitulé — entreprise | dates, lieu + bullets orientés action/résultat" className="border border-zinc-200 rounded-xl px-3 py-2 text-sm min-h-20 focus:outline-none focus:ring-2 focus:ring-red-100" />
              <textarea value={profile.certifications} onChange={e => update('certifications', e.target.value)} placeholder="Certifications : nom — émetteur | année" className="border border-zinc-200 rounded-xl px-3 py-2 text-sm min-h-20 focus:outline-none focus:ring-2 focus:ring-red-100" />
              <textarea value={profile.goals} onChange={e => update('goals', e.target.value)} placeholder="Objectif professionnel" className="border border-zinc-200 rounded-xl px-3 py-2 text-sm min-h-20 focus:outline-none focus:ring-2 focus:ring-red-100" />
              <input value={profile.extraSkills} onChange={e => update('extraSkills', e.target.value)} placeholder="Autres compétences à ajouter" className="border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-100" />
            </div>
          </div>
        </div>

        {/* ── Colonne droite : sorties ── */}
        <div className="space-y-6 lg:sticky lg:top-6 self-start">
          {isItProfile && (
            <div className="bg-zinc-950 text-white border border-zinc-800 rounded-3xl p-6">
              <div className="flex items-center justify-between gap-3 mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Code2 className="w-5 h-5" /> CV-IT.md — {contractLabel}
                </h2>
                <CopyButton text={cvItOutput}>Copier CV-IT</CopyButton>
              </div>
              <pre className="whitespace-pre-wrap text-xs bg-black/30 border border-white/10 rounded-2xl p-4 max-h-[360px] overflow-auto text-zinc-200">{cvItOutput}</pre>
            </div>
          )}

          <div className="bg-white border border-zinc-200 rounded-3xl p-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 className="text-xl font-bold">Base complète à copier</h2>
              <CopyButton text={generatedProfile}>Copier</CopyButton>
            </div>
            <pre className="whitespace-pre-wrap text-xs bg-zinc-50 border border-zinc-100 rounded-2xl p-4 max-h-[520px] overflow-auto text-zinc-700">{generatedProfile}</pre>
          </div>

          <div className="bg-white border border-zinc-200 rounded-3xl p-6">
            <h2 className="text-xl font-bold mb-1">Prompts prêts pour ChatGPT ou Claude</h2>
            <p className="text-xs text-zinc-500 mb-4">Adaptés au {contractLabel}</p>
            <div className="space-y-3">
              {promptTemplates.map(([title, prompt]) => {
                const fullPrompt = `${prompt}\n\n${generatedProfile}`;
                return (
                  <div key={title} className="border border-zinc-200 rounded-2xl p-4">
                    <p className="font-semibold text-sm mb-2">{title}</p>
                    <p className="text-xs text-zinc-500 mb-3">{prompt}</p>
                    <CopyButton text={fullPrompt}>Copier le prompt</CopyButton>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
