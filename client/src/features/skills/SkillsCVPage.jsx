import React, { useMemo, useState } from 'react';
import { Clipboard, Check, Sparkles, ShieldAlert, Code2, BrainCircuit } from 'lucide-react';

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
      'Tests unitaires', 'Tests E2E', 'Clean code', 'Responsive design', 'Accessibilité', 'SEO technique'
    ],
    tools: [
      'VS Code', 'Git', 'GitHub', 'GitLab', 'Docker Desktop', 'Postman', 'Insomnia', 'Figma', 'Vercel',
      'Netlify', 'Railway', 'Render', 'AWS', 'Firebase', 'Supabase', 'Linux', 'Nginx', 'Jira', 'Notion'
    ],
    soft: ['Logique', 'Autonomie', 'Curiosité technique', 'Débogage', 'Rigueur', 'Esprit produit'],
    missions: ['Créer des interfaces', 'Développer des APIs', 'Corriger des bugs', 'Intégrer des maquettes', 'Écrire des tests', 'Déployer une application', 'Documenter le code'],
    cvFocus: ['Architecture front/back', 'qualité du code', 'projets GitHub', 'capacité à apprendre vite', 'livraison concrète']
  },
  {
    id: 'data-analysis',
    label: 'Data analyse',
    family: 'it',
    technical: ['SQL', 'Python', 'Pandas', 'NumPy', 'Excel avancé', 'Power Query', 'Data cleaning', 'Data visualisation', 'Statistiques descriptives', 'KPI', 'A/B testing', 'ETL', 'Modélisation de données', 'Reporting automatisé'],
    tools: ['Power BI', 'Tableau', 'Looker Studio', 'Metabase', 'Jupyter Notebook', 'Google Sheets', 'BigQuery', 'PostgreSQL', 'MySQL', 'Snowflake', 'dbt', 'Git', 'Notion'],
    soft: ['Analyse', 'Rigueur', 'Synthèse', 'Pédagogie', 'Esprit business'],
    missions: ['Créer des tableaux de bord', 'Nettoyer des données', 'Suivre des indicateurs', 'Automatiser des rapports', 'Présenter des insights', 'Fiabiliser une source de données'],
    cvFocus: ['SQL', 'visualisation', 'insights métier', 'qualité des données', 'automatisation']
  },
  {
    id: 'data-science',
    label: 'Data science / IA',
    family: 'it',
    technical: ['Python', 'Pandas', 'NumPy', 'Scikit-learn', 'Machine learning', 'Deep learning', 'Feature engineering', 'NLP', 'Computer vision', 'Time series', 'Évaluation de modèles', 'MLOps', 'Prompt engineering', 'RAG', 'Vector database', 'Fine-tuning', 'LLM'],
    tools: ['Jupyter', 'Google Colab', 'PyTorch', 'TensorFlow', 'Keras', 'Hugging Face', 'LangChain', 'LlamaIndex', 'OpenAI API', 'Claude API', 'Ollama', 'ChromaDB', 'Pinecone', 'MLflow', 'Weights & Biases', 'Docker', 'Git'],
    soft: ['Esprit scientifique', 'Curiosité IA', 'Rigueur expérimentale', 'Esprit critique', 'Communication des résultats'],
    missions: ['Préparer un dataset', 'Créer un modèle prédictif', 'Évaluer un modèle', 'Créer un prototype IA', 'Mettre en place un RAG', 'Documenter des expérimentations'],
    cvFocus: ['projets IA', 'datasets', 'métriques', 'expérimentation', 'déploiement de prototypes']
  },
  { id: 'cyber', label: 'Cybersécurité', family: 'it', technical: ['Linux', 'Réseaux', 'OWASP', 'Analyse de logs', 'Pentest bases', 'Sécurité web', 'IAM', 'Durcissement', 'Sensibilisation'], tools: ['Wireshark', 'Burp Suite', 'Nmap', 'SIEM', 'Kali Linux', 'Git', 'Docker'], soft: ['Rigueur', 'Patience', 'Esprit critique'], missions: ['Surveiller des alertes', 'Documenter des risques', 'Aider aux audits', 'Écrire des procédures'], cvFocus: ['sécurité web', 'méthodologie', 'outillage', 'documentation'] },
  { id: 'marketing', label: 'Marketing digital', technical: ['SEO', 'Réseaux sociaux', 'Emailing', 'Content marketing', 'Analyse de trafic'], tools: ['Google Analytics', 'Canva', 'Meta Business Suite', 'Brevo'], soft: ['Créativité', 'Rigueur', 'Esprit d’analyse'], missions: ['Créer des contenus', 'Suivre les campagnes', 'Optimiser le référencement', 'Analyser les performances'] },
  { id: 'commerce', label: 'Commerce / vente', technical: ['Prospection', 'Négociation', 'CRM', 'Relation client', 'Argumentaire'], tools: ['HubSpot', 'Salesforce', 'Excel', 'LinkedIn'], soft: ['Écoute', 'Persévérance', 'Aisance orale'], missions: ['Qualifier des prospects', 'Relancer des clients', 'Préparer des rendez-vous', 'Suivre un portefeuille'] },
  { id: 'communication', label: 'Communication', technical: ['Stratégie éditoriale', 'Community management', 'Rédaction web', 'Brand content'], tools: ['Canva', 'Notion', 'Suite Adobe', 'CapCut'], soft: ['Expression écrite', 'Créativité', 'Organisation'], missions: ['Planifier des publications', 'Rédiger des supports', 'Créer des visuels', 'Suivre l’image de marque'] },
  { id: 'design', label: 'Design', technical: ['UI design', 'UX research', 'Prototypage', 'Design system'], tools: ['Figma', 'Illustrator', 'Photoshop', 'Canva'], soft: ['Sens du détail', 'Empathie utilisateur', 'Créativité'], missions: ['Créer des maquettes', 'Améliorer un parcours', 'Décliner une charte', 'Tester des prototypes'] },
  { id: 'accounting', label: 'Comptabilité', technical: ['Saisie comptable', 'Rapprochement bancaire', 'Facturation', 'Déclarations'], tools: ['Excel', 'Sage', 'Pennylane', 'Cegid'], soft: ['Rigueur', 'Discrétion', 'Fiabilité'], missions: ['Classer des pièces', 'Suivre les factures', 'Préparer des tableaux', 'Aider aux clôtures'] },
  { id: 'hr', label: 'Ressources humaines', technical: ['Recrutement', 'Onboarding', 'Administration du personnel', 'Marque employeur'], tools: ['Excel', 'LinkedIn', 'ATS', 'Notion'], soft: ['Écoute', 'Confidentialité', 'Organisation'], missions: ['Trier des candidatures', 'Planifier des entretiens', 'Préparer l’accueil', 'Mettre à jour des dossiers'] },
  { id: 'project', label: 'Gestion de projet', technical: ['Planification', 'Suivi KPI', 'Coordination', 'Compte rendu'], tools: ['Trello', 'Notion', 'Jira', 'Excel'], soft: ['Organisation', 'Communication', 'Esprit d’équipe'], missions: ['Suivre un planning', 'Animer des points', 'Documenter un projet', 'Coordonner des actions'] },
  { id: 'realestate', label: 'Immobilier', technical: ['Prospection', 'Estimation', 'Visites', 'Relation propriétaire'], tools: ['CRM immobilier', 'Excel', 'Portails annonces'], soft: ['Sens commercial', 'Présentation', 'Réactivité'], missions: ['Préparer des annonces', 'Qualifier des contacts', 'Organiser des visites', 'Mettre à jour le CRM'] },
  { id: 'hotel', label: 'Restauration / hôtellerie', technical: ['Accueil client', 'Service', 'Réservation', 'Hygiène HACCP'], tools: ['Logiciel de caisse', 'Planning', 'Plateformes réservation'], soft: ['Dynamisme', 'Gestion du stress', 'Sens du service'], missions: ['Accueillir les clients', 'Préparer le service', 'Gérer les réservations', 'Participer à la satisfaction client'] },
  { id: 'btp', label: 'BTP', technical: ['Lecture de plans', 'Suivi chantier', 'Sécurité', 'Métrés'], tools: ['AutoCAD', 'Excel', 'Planning chantier'], soft: ['Précision', 'Esprit terrain', 'Respect des règles'], missions: ['Aider au suivi chantier', 'Préparer des documents', 'Contrôler des métrés', 'Suivre la sécurité'] },
  { id: 'social', label: 'Santé / social', technical: ['Accueil usager', 'Accompagnement', 'Dossier patient', 'Prévention'], tools: ['Logiciels métier', 'Pack Office', 'Planning'], soft: ['Empathie', 'Patience', 'Confidentialité'], missions: ['Aider à l’accueil', 'Mettre à jour des dossiers', 'Participer à des actions', 'Orienter les usagers'] }
];

const promptTemplates = [
  ['CV-IT dynamique prioritaire', 'À partir du profil ci-dessous, applique strictement le skill CV-IT.md : crée le contenu d’un CV informatique ATS-friendly sur exactement 1 page A4. Respecte l’ordre fixe Header, Profil, Compétences Techniques, Expérience Professionnelle, Projets, Formation, Certifications, Informations Complémentaires. Adapte le titre, l’ordre des compétences, les mots-clés et l’angle des projets au poste visé. Donne un contenu prêt à intégrer dans un template docx-js, avec compétences en 6–7 lignes label : valeurs et projets orientés preuves concrètes.'],
  ['Améliore mon CV pour une alternance', 'À partir de mon profil ci-dessous, aide-moi à améliorer mon CV pour une recherche d’alternance. Propose un titre, une accroche courte, les compétences à mettre en avant et reformule mes expériences de façon professionnelle.'],
  ['Rédige un email de candidature spontanée', 'À partir de mon profil ci-dessous, rédige un email court et professionnel pour une candidature spontanée en alternance. Le ton doit être naturel, motivé et facile à personnaliser pour chaque entreprise.'],
  ['Rédige une lettre de motivation courte', 'À partir de mon profil ci-dessous, rédige une lettre de motivation courte pour une alternance. Elle doit tenir sur une page, être concrète et adaptée à un profil junior.'],
  ['Adapte mon profil à cette entreprise', 'À partir de mon profil ci-dessous et des informations de l’entreprise que je vais ajouter, explique quels arguments je dois mettre en avant pour maximiser mes chances.'],
  ['Trouve les compétences à mettre en avant', 'Analyse mon profil ci-dessous et liste les compétences les plus pertinentes pour mon CV, mon email et un entretien d’alternance.'],
  ['Corrige et rends mon message plus professionnel', 'Corrige le message que je vais écrire ensuite. Rends-le plus professionnel, clair et adapté à une candidature d’alternance, sans le rendre trop long.']
];

const emptyProfile = {
  firstName: '', lastName: '', phone: '', email: '', city: '', languages: '', drivingLicense: '', certifications: '', interests: '', targetJob: '', formation: '', level: '', rhythm: '', startDate: '', duration: '', mobility: '', companyType: '', projects: '', experiences: '', goals: '', extraSkills: '', freeStacks: '', github: '', portfolio: '', projectLinks: '', jobOfferKeywords: ''
};

const CopyButton = ({ text, children }) => {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };
  return <button onClick={copy} className="inline-flex items-center gap-2 text-xs bg-zinc-900 text-white px-3 py-2 rounded-lg hover:bg-zinc-700">{copied ? <Check className="w-3 h-3" /> : <Clipboard className="w-3 h-3" />}{copied ? 'Copié' : children}</button>;
};

const splitFreeList = (value) => value.split(/[,\n]/).map(item => item.trim()).filter(Boolean);

const getCvItSkillLines = (domain, selectedStack, profile) => {
  const stack = selectedStack.join(', ') || 'À compléter';
  const keywords = profile.jobOfferKeywords || 'À compléter avec les mots-clés de l’offre';
  if (domain.id === 'data-analysis') {
    return [
      ['Data & SQL', stack],
      ['Visualisation', 'Power BI, Tableau, Looker Studio, dashboards, KPI'],
      ['Traitement', 'nettoyage de données, ETL, reporting automatisé, qualité des données'],
      ['Bases de données', 'PostgreSQL, MySQL, BigQuery, modélisation de données'],
      ['Outils', 'Jupyter, Excel avancé, Git, dbt, Notion'],
      ['Mots-clés offre', keywords]
    ];
  }
  if (domain.id === 'data-science') {
    return [
      ['Data & ML', stack],
      ['IA & LLM', 'RAG, prompt engineering, vector database, Hugging Face, OpenAI API, Claude API'],
      ['Modélisation', 'feature engineering, évaluation de modèles, NLP, computer vision'],
      ['MLOps & outils', 'MLflow, Docker, Git, Jupyter, expérimentation'],
      ['Bases de données', 'SQL, datasets, pipelines, qualité des données'],
      ['Mots-clés offre', keywords]
    ];
  }
  if (domain.id === 'cyber') {
    return [
      ['Sécurité web', stack],
      ['Réseaux & systèmes', 'Linux, durcissement, analyse de logs, supervision'],
      ['Méthodologie', 'OWASP, documentation des risques, procédures, sensibilisation'],
      ['Outils', 'Wireshark, Burp Suite, Nmap, SIEM, Git'],
      ['Soft skills tech', 'rigueur, esprit critique, confidentialité, communication'],
      ['Mots-clés offre', keywords]
    ];
  }
  return [
    ['Frontend', stack],
    ['Backend & API', 'Node.js, Express/NestJS, API REST, GraphQL, authentification, intégrations'],
    ['Bases de données', 'PostgreSQL, MySQL, MongoDB, Redis, ORM, modélisation'],
    ['DevOps & qualité', 'Git, Docker, CI/CD, tests unitaires/E2E, déploiement'],
    ['Outils', 'VS Code, GitHub/GitLab, Postman, Figma, Linux, cloud'],
    ['Mots-clés offre', keywords]
  ];
};

const buildCvItOutput = ({ profile, domain, selectedStack, projectLinks }) => {
  const fullName = `${profile.firstName || 'PRÉNOM'} ${profile.lastName || 'NOM'}`.trim();
  const title = `${profile.targetJob || domain.label}${profile.rhythm || profile.duration ? ' | Alternance' : ''}`;
  const contactLine1 = `${profile.phone || '06 XX XX XX XX'} | ${profile.email || 'email@domain.com'} | ${profile.city || profile.mobility || 'Ville'}`;
  const contactLine2 = `${profile.portfolio || 'portfolio/site'} | ${profile.github || 'github.com/handle'} | ${profile.drivingLicense || 'Permis à compléter'} | ${profile.languages || 'Langues à compléter'}`;
  const skillLines = getCvItSkillLines(domain, selectedStack, profile);
  const projectLines = [profile.github, profile.portfolio, ...projectLinks].filter(Boolean);

  return `CV-IT.md — CONTENU ATS-FRIENDLY 1 PAGE A4\n\nRègles à respecter :\n- CV informatique uniquement, ATS d’abord, design ensuite.\n- Une seule page A4 exactement, texte parsable, Arial, sections claires.\n- Structure fixe : Header, Profil, Compétences Techniques, Expérience Professionnelle, Projets, Formation, Certifications, Informations Complémentaires.\n- Adapter le titre, l’ordre des compétences et l’angle des projets au poste visé.\n- Utiliser les mots-clés exacts de l’offre quand ils sont fournis.\n\n1. HEADER\nNom : ${fullName}\nTitre : ${title}\nContacts ligne 1 : ${contactLine1}\nContacts ligne 2 : ${contactLine2}\nPhoto : prévoir photo ronde si disponible, sinon garder header texte propre.\n\n2. PROFIL — 4 à 6 lignes justifiées\nProfil junior orienté ${domain.label}, en recherche d’alternance${profile.startDate ? ` à partir de ${profile.startDate}` : ''}${profile.rhythm ? ` avec un rythme ${profile.rhythm}` : ''}. Mettre en avant la stack ${selectedStack.slice(0, 8).join(', ') || 'à compléter'}, les projets personnels, la capacité d’apprentissage et les preuves concrètes. Reformuler selon le poste visé : ${profile.targetJob || domain.label}.\nObjectif : ${profile.goals || 'À compléter'}\n\n3. COMPÉTENCES TECHNIQUES — 6 à 7 lignes label : valeurs\n${skillLines.map(([label, value]) => `${label} : ${value}`).join('\n')}\n\n4. EXPÉRIENCE PROFESSIONNELLE — 2 à 3 postes si possible\n${profile.experiences || 'À compléter : intitulé — entreprise | dates, lieu + 3 à 6 bullets concis commençant par un verbe d’action ou un substantif technique.'}\n\n5. PROJETS — 3 à 5 projets orientés poste\nLiens publics à analyser/valoriser :\n${projectLines.map(link => `- ${link}`).join('\n') || '- À compléter avec GitHub, portfolio, démos ou repos publics'}\n\nDescriptions projets fournies :\n${profile.projects || 'À compléter : pour chaque projet, indiquer nom, objectif, URL, stack, résultat, métrique ou apprentissage.'}\n\nAngle demandé : adapter chaque projet au poste ${profile.targetJob || domain.label}. Pour frontend : interfaces, UX, dataviz. Pour backend : API, BDD, architecture. Pour full stack : end-to-end et déploiement. Pour data/IA : datasets, modèles, RAG, métriques.\n\n6. FORMATION\n${profile.formation || 'Formation à compléter'}${profile.level ? ` — ${profile.level}` : ''}${profile.startDate || profile.duration ? ` | ${profile.startDate || ''} ${profile.duration || ''}` : ''}\n\n7. CERTIFICATIONS\n${profile.certifications || 'À compléter si pertinent, sinon section optionnelle.'}\n\n8. INFORMATIONS COMPLÉMENTAIRES\nLangues : ${profile.languages || 'À compléter'} | Permis : ${profile.drivingLicense || 'À compléter'} | Centres d’intérêt : ${profile.interests || 'IA, veille tech, projets personnels, à compléter'}\n\nMOTS-CLÉS D’OFFRE À RETROUVER EXPLICITEMENT\n${profile.jobOfferKeywords || 'À compléter : colle ici les mots techniques et soft skills de l’annonce.'}\n\nCONSIGNE POUR L’IA\nGénère le contenu final du CV selon CV-IT.md. Priorise la pertinence ATS, compresse pour 1 page A4, hiérarchise les compétences, reformule les projets selon le poste et propose si besoin quelles informations manquent pour produire un DOCX/PDF final.`;
};

export const SkillsCVPage = () => {
  const [selectedDomain, setSelectedDomain] = useState(skillDomains[0].id);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [profile, setProfile] = useState(emptyProfile);
  const domain = skillDomains.find(item => item.id === selectedDomain) || skillDomains[0];
  const isItProfile = domain.family === 'it';

  const toggleSkill = (skill) => setSelectedSkills(prev => prev.includes(skill) ? prev.filter(item => item !== skill) : [...prev, skill]);
  const update = (key, value) => setProfile(prev => ({ ...prev, [key]: value }));

  const freeStacks = splitFreeList(profile.freeStacks);
  const projectLinks = splitFreeList(profile.projectLinks);
  const selectedStack = [...selectedSkills, ...freeStacks, profile.extraSkills].filter(Boolean);

  const cvItOutput = useMemo(() => {
    if (!isItProfile) return '';
    return buildCvItOutput({ profile, domain, selectedStack, projectLinks });
  }, [isItProfile, profile, domain, selectedStack, projectLinks]);

  const generatedProfile = useMemo(() => `${isItProfile ? `${cvItOutput}\n\n---\n\n` : ''}PROFIL POUR CANDIDATURE EN ALTERNANCE\n\nMétier ou domaine visé : ${profile.targetJob || domain.label}\nFormation actuelle : ${profile.formation || 'À compléter'}\nNiveau d’étude : ${profile.level || 'À compléter'}\nRythme d’alternance : ${profile.rhythm || 'À compléter'}\nDate de début : ${profile.startDate || 'À compléter'}\nDurée recherchée : ${profile.duration || 'À compléter'}\nLocalisation / mobilité : ${profile.mobility || 'À compléter'}\nType d’entreprise souhaité : ${profile.companyType || 'À compléter'}\n\nCompétences techniques, outils et stacks :\n${selectedStack.map(item => `- ${item}`).join('\n') || '- À compléter'}\n\nQualités utiles :\n${domain.soft.map(item => `- ${item}`).join('\n')}\n\nExemples de missions possibles :\n${domain.missions.map(item => `- ${item}`).join('\n')}\n\nProjets réalisés :\n${profile.projects || 'À compléter'}\n\nLiens projets / GitHub / portfolio :\n${profile.github ? `- GitHub : ${profile.github}\n` : ''}${profile.portfolio ? `- Portfolio : ${profile.portfolio}\n` : ''}${projectLinks.map(link => `- ${link}`).join('\n') || '- À compléter'}\n\nExpériences :\n${profile.experiences || 'À compléter'}\n\nObjectif professionnel :\n${profile.goals || 'À compléter'}\n\nConsigne : aide-moi à transformer ces informations en CV, email de candidature ou lettre de motivation pour une alternance.${isItProfile ? ' Pour ce profil informatique/data, priorise la sortie CV-IT, la stack, les projets et les liens GitHub.' : ''}`, [profile, selectedStack, domain, isItProfile, cvItOutput, projectLinks]);

  return (
    <section className="space-y-8">
      <div className="bg-zinc-950 text-white rounded-3xl p-8 md:p-10 relative overflow-hidden">
        <Sparkles className="absolute right-6 top-6 w-24 h-24 text-red-600 opacity-20" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex bg-red-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-5">Skills & CV</div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4">Prépare ton CV avec tes stacks, projets et skills.</h1>
          <p className="text-zinc-300">Pour les profils IT/data, la sortie prioritaire applique le référentiel CV-IT.md : ATS-friendly, 1 page A4, structure fixe, compétences hiérarchisées, projets GitHub et mots-clés d’offre.</p>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 text-sm text-amber-900">
        <ShieldAlert className="w-5 h-5 flex-shrink-0" />
        <p>Ne partage pas d’informations sensibles avec un outil externe. Pour GitHub/projets, donne seulement des liens publics que tu veux valoriser.</p>
      </div>

      <div className="grid lg:grid-cols-[1fr_1fr] gap-8">
        <div className="space-y-6">
          <div className="bg-white border border-zinc-200 rounded-3xl p-6">
            <h2 className="text-xl font-bold mb-4">1. Choisis ton domaine</h2>
            <div className="grid sm:grid-cols-2 gap-2">
              {skillDomains.map(item => <button key={item.id} onClick={() => { setSelectedDomain(item.id); setSelectedSkills([]); }} className={selectedDomain === item.id ? 'text-left text-sm bg-red-600 text-white px-3 py-2 rounded-xl' : 'text-left text-sm bg-zinc-50 border border-zinc-200 px-3 py-2 rounded-xl hover:border-zinc-400'}>{item.family === 'it' ? '💻 ' : ''}{item.label}</button>)}
            </div>
          </div>

          {isItProfile && (
            <div className="bg-blue-50 border border-blue-100 rounded-3xl p-6">
              <div className="flex items-center gap-2 mb-2 text-blue-900 font-bold"><BrainCircuit className="w-5 h-5" /> Mode CV-IT prioritaire activé</div>
              <p className="text-sm text-blue-800">La sortie suit CV-IT.md : Header, Profil, Compétences Techniques, Expérience, Projets, Formation, Certifications, Informations Complémentaires, avec tailoring par poste tech.</p>
            </div>
          )}

          <div className="bg-white border border-zinc-200 rounded-3xl p-6">
            <h2 className="text-xl font-bold mb-4">2. Sélectionne tes compétences et stacks</h2>
            <div className="space-y-4">
              {[['Compétences / stacks', domain.technical], ['Outils', domain.tools], ['Qualités', domain.soft]].map(([title, list]) => (
                <div key={title}>
                  <h3 className="text-sm font-semibold text-zinc-700 mb-2">{title}</h3>
                  <div className="flex flex-wrap gap-2">{list.map(skill => <button key={skill} onClick={() => toggleSkill(skill)} className={selectedSkills.includes(skill) ? 'text-xs bg-zinc-900 text-white px-3 py-1.5 rounded-full' : 'text-xs bg-zinc-100 text-zinc-700 px-3 py-1.5 rounded-full hover:bg-zinc-200'}>{skill}</button>)}</div>
                </div>
              ))}
            </div>
            <textarea value={profile.freeStacks} onChange={e => update('freeStacks', e.target.value)} placeholder="Ajoute tes stacks libres : Tailwind, Zustand, Astro, Kubernetes, Airflow, Streamlit, etc. Sépare par virgule ou ligne." className="mt-4 w-full border border-zinc-200 rounded-xl px-3 py-2 text-sm min-h-20 focus:outline-none focus:ring-2 focus:ring-red-100" />
          </div>

          <div className="bg-white border border-zinc-200 rounded-3xl p-6">
            <h2 className="text-xl font-bold mb-4">3. Identité et contact CV-IT</h2>
            <div className="grid sm:grid-cols-2 gap-3 mb-3">
              {[
                ['firstName', 'Prénom'], ['lastName', 'Nom'], ['phone', 'Téléphone'], ['email', 'Email'], ['city', 'Ville'], ['languages', 'Langues'], ['drivingLicense', 'Permis'], ['interests', 'Centres d’intérêt']
              ].map(([key, label]) => <input key={key} value={profile[key]} onChange={e => update(key, e.target.value)} placeholder={label} className="border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-100" />)}
            </div>

            <h2 className="text-xl font-bold mb-4">4. Complète ton profil</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                ['targetJob', 'Métier visé'], ['formation', 'Formation actuelle'], ['level', 'Niveau d’étude'], ['rhythm', 'Rythme d’alternance'], ['startDate', 'Date de début'], ['duration', 'Durée recherchée'], ['mobility', 'Localisation / mobilité'], ['companyType', 'Type d’entreprise souhaité']
              ].map(([key, label]) => <input key={key} value={profile[key]} onChange={e => update(key, e.target.value)} placeholder={label} className="border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-100" />)}
            </div>
            <div className="grid gap-3 mt-3">
              <input value={profile.github} onChange={e => update('github', e.target.value)} placeholder="Lien GitHub public" className="border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-100" />
              <input value={profile.portfolio} onChange={e => update('portfolio', e.target.value)} placeholder="Portfolio / site perso / démo" className="border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-100" />
              <textarea value={profile.projectLinks} onChange={e => update('projectLinks', e.target.value)} placeholder="Liens projets perso ou repos GitHub, un par ligne ou séparés par virgule. L’IA pourra les analyser si elle a accès au web." className="border border-zinc-200 rounded-xl px-3 py-2 text-sm min-h-20 focus:outline-none focus:ring-2 focus:ring-red-100" />
              <textarea value={profile.jobOfferKeywords} onChange={e => update('jobOfferKeywords', e.target.value)} placeholder="Mots-clés exacts de l’offre à retrouver dans le CV : Cursor, React, API REST, autonomie, code review, RAG, Power BI…" className="border border-zinc-200 rounded-xl px-3 py-2 text-sm min-h-20 focus:outline-none focus:ring-2 focus:ring-red-100" />
              <textarea value={profile.projects} onChange={e => update('projects', e.target.value)} placeholder="Décris tes projets : nom, objectif, URL, stack, fonctionnalités, résultat, métriques ou apprentissages" className="border border-zinc-200 rounded-xl px-3 py-2 text-sm min-h-20 focus:outline-none focus:ring-2 focus:ring-red-100" />
              <textarea value={profile.experiences} onChange={e => update('experiences', e.target.value)} placeholder="Expériences : intitulé — entreprise | dates, lieu + bullets orientés action/résultat" className="border border-zinc-200 rounded-xl px-3 py-2 text-sm min-h-20 focus:outline-none focus:ring-2 focus:ring-red-100" />
              <textarea value={profile.certifications} onChange={e => update('certifications', e.target.value)} placeholder="Certifications : nom — émetteur | année" className="border border-zinc-200 rounded-xl px-3 py-2 text-sm min-h-20 focus:outline-none focus:ring-2 focus:ring-red-100" />
              <textarea value={profile.goals} onChange={e => update('goals', e.target.value)} placeholder="Objectif professionnel" className="border border-zinc-200 rounded-xl px-3 py-2 text-sm min-h-20 focus:outline-none focus:ring-2 focus:ring-red-100" />
              <input value={profile.extraSkills} onChange={e => update('extraSkills', e.target.value)} placeholder="Autres compétences à ajouter" className="border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-100" />
            </div>
          </div>
        </div>

        <div className="space-y-6 lg:sticky lg:top-6 self-start">
          {isItProfile && (
            <div className="bg-zinc-950 text-white border border-zinc-800 rounded-3xl p-6">
              <div className="flex items-center justify-between gap-3 mb-4"><h2 className="text-xl font-bold flex items-center gap-2"><Code2 className="w-5 h-5" /> CV-IT.md prioritaire</h2><CopyButton text={cvItOutput}>Copier CV-IT</CopyButton></div>
              <pre className="whitespace-pre-wrap text-xs bg-black/30 border border-white/10 rounded-2xl p-4 max-h-[360px] overflow-auto text-zinc-200">{cvItOutput}</pre>
            </div>
          )}

          <div className="bg-white border border-zinc-200 rounded-3xl p-6">
            <div className="flex items-center justify-between gap-3 mb-4"><h2 className="text-xl font-bold">Base complète à copier</h2><CopyButton text={generatedProfile}>Copier</CopyButton></div>
            <pre className="whitespace-pre-wrap text-xs bg-zinc-50 border border-zinc-100 rounded-2xl p-4 max-h-[520px] overflow-auto text-zinc-700">{generatedProfile}</pre>
          </div>

          <div className="bg-white border border-zinc-200 rounded-3xl p-6">
            <h2 className="text-xl font-bold mb-4">Prompts prêts pour ChatGPT ou Claude</h2>
            <div className="space-y-3">
              {promptTemplates.map(([title, prompt]) => {
                const fullPrompt = `${prompt}\n\n${generatedProfile}`;
                return <div key={title} className="border border-zinc-200 rounded-2xl p-4"><p className="font-semibold text-sm mb-2">{title}</p><p className="text-xs text-zinc-500 mb-3">{prompt}</p><CopyButton text={fullPrompt}>Copier le prompt</CopyButton></div>;
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
