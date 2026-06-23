import React, { useMemo, useState } from 'react';
import { Clipboard, Check, Sparkles, ShieldAlert, Code2, BrainCircuit } from 'lucide-react';

// ─── Contract types ────────────────────────────────────────────────────────────
const CONTRACT_TYPES = [
  { id: 'ALTERNANCE', label: 'Alternance',  output: 'pour une alternance' },
  { id: 'CDI',        label: 'CDI',         output: 'pour un CDI' },
  { id: 'CDD',        label: 'CDD',         output: 'pour un CDD' },
  { id: 'INTERIM',    label: 'Intérim',     output: 'pour des missions d\'intérim' },
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
  },
  {
    id: 'data-analysis',
    label: 'Data analyse',
    family: 'it',
    technical: ['SQL', 'Python', 'Pandas', 'NumPy', 'Excel avancé', 'Power Query', 'Data cleaning', 'Data visualisation', 'Statistiques descriptives', 'KPI', 'A/B testing', 'ETL', 'Modélisation de données', 'Reporting automatisé'],
    tools: ['Power BI', 'Tableau', 'Looker Studio', 'Metabase', 'Jupyter Notebook', 'Google Sheets', 'BigQuery', 'PostgreSQL', 'MySQL', 'Snowflake', 'dbt', 'Git', 'Notion'],
    soft: ['Analyse', 'Rigueur', 'Synthèse', 'Pédagogie', 'Esprit business'],
    missions: ['Créer des tableaux de bord', 'Nettoyer des données', 'Suivre des indicateurs', 'Automatiser des rapports', 'Présenter des insights', 'Fiabiliser une source de données'],
  },
  {
    id: 'data-science',
    label: 'Data science / IA',
    family: 'it',
    technical: ['Python', 'Pandas', 'NumPy', 'Scikit-learn', 'Machine learning', 'Deep learning', 'Feature engineering', 'NLP', 'Computer vision', 'Time series', 'Évaluation de modèles', 'MLOps', 'Prompt engineering', 'RAG', 'Vector database', 'Fine-tuning', 'LLM'],
    tools: ['Jupyter', 'Google Colab', 'PyTorch', 'TensorFlow', 'Keras', 'Hugging Face', 'LangChain', 'LlamaIndex', 'OpenAI API', 'Claude API', 'Ollama', 'ChromaDB', 'Pinecone', 'MLflow', 'Weights & Biases', 'Docker', 'Git'],
    soft: ['Esprit scientifique', 'Curiosité IA', 'Rigueur expérimentale', 'Esprit critique', 'Communication des résultats'],
    missions: ['Préparer un dataset', 'Créer un modèle prédictif', 'Évaluer un modèle', 'Créer un prototype IA', 'Mettre en place un RAG', 'Documenter des expérimentations'],
  },
  { id: 'cyber', label: 'Cybersécurité', family: 'it', technical: ['Linux', 'Réseaux', 'OWASP', 'Analyse de logs', 'Pentest bases', 'Sécurité web', 'IAM', 'Durcissement', 'Sensibilisation'], tools: ['Wireshark', 'Burp Suite', 'Nmap', 'SIEM', 'Kali Linux', 'Git', 'Docker'], soft: ['Rigueur', 'Patience', 'Esprit critique'], missions: ['Surveiller des alertes', 'Documenter des risques', 'Aider aux audits', 'Écrire des procédures'] },
  { id: 'marketing', label: 'Marketing digital', technical: ['SEO', 'Réseaux sociaux', 'Emailing', 'Content marketing', 'Analyse de trafic'], tools: ['Google Analytics', 'Canva', 'Meta Business Suite', 'Brevo'], soft: ['Créativité', 'Rigueur', 'Esprit d\'analyse'], missions: ['Créer des contenus', 'Suivre les campagnes', 'Optimiser le référencement', 'Analyser les performances'] },
  { id: 'commerce', label: 'Commerce / vente', technical: ['Prospection', 'Négociation', 'CRM', 'Relation client', 'Argumentaire'], tools: ['HubSpot', 'Salesforce', 'Excel', 'LinkedIn'], soft: ['Écoute', 'Persévérance', 'Aisance orale'], missions: ['Qualifier des prospects', 'Relancer des clients', 'Préparer des rendez-vous', 'Suivre un portefeuille'] },
  { id: 'communication', label: 'Communication', technical: ['Stratégie éditoriale', 'Community management', 'Rédaction web', 'Brand content'], tools: ['Canva', 'Notion', 'Suite Adobe', 'CapCut'], soft: ['Expression écrite', 'Créativité', 'Organisation'], missions: ['Planifier des publications', 'Rédiger des supports', 'Créer des visuels', 'Suivre l\'image de marque'] },
  { id: 'design', label: 'Design', technical: ['UI design', 'UX research', 'Prototypage', 'Design system'], tools: ['Figma', 'Illustrator', 'Photoshop', 'Canva'], soft: ['Sens du détail', 'Empathie utilisateur', 'Créativité'], missions: ['Créer des maquettes', 'Améliorer un parcours', 'Décliner une charte', 'Tester des prototypes'] },
  { id: 'accounting', label: 'Comptabilité', technical: ['Saisie comptable', 'Rapprochement bancaire', 'Facturation', 'Déclarations'], tools: ['Excel', 'Sage', 'Pennylane', 'Cegid'], soft: ['Rigueur', 'Discrétion', 'Fiabilité'], missions: ['Classer des pièces', 'Suivre les factures', 'Préparer des tableaux', 'Aider aux clôtures'] },
  { id: 'hr', label: 'Ressources humaines', technical: ['Recrutement', 'Onboarding', 'Administration du personnel', 'Marque employeur'], tools: ['Excel', 'LinkedIn', 'ATS', 'Notion'], soft: ['Écoute', 'Confidentialité', 'Organisation'], missions: ['Trier des candidatures', 'Planifier des entretiens', 'Préparer l\'accueil', 'Mettre à jour des dossiers'] },
  { id: 'project', label: 'Gestion de projet', technical: ['Planification', 'Suivi KPI', 'Coordination', 'Compte rendu'], tools: ['Trello', 'Notion', 'Jira', 'Excel'], soft: ['Organisation', 'Communication', 'Esprit d\'équipe'], missions: ['Suivre un planning', 'Animer des points', 'Documenter un projet', 'Coordonner des actions'] },
  { id: 'realestate', label: 'Immobilier', technical: ['Prospection', 'Estimation', 'Visites', 'Relation propriétaire'], tools: ['CRM immobilier', 'Excel', 'Portails annonces'], soft: ['Sens commercial', 'Présentation', 'Réactivité'], missions: ['Préparer des annonces', 'Qualifier des contacts', 'Organiser des visites', 'Mettre à jour le CRM'] },
  { id: 'hotel', label: 'Restauration / hôtellerie', technical: ['Accueil client', 'Service', 'Réservation', 'Hygiène HACCP'], tools: ['Logiciel de caisse', 'Planning', 'Plateformes réservation'], soft: ['Dynamisme', 'Gestion du stress', 'Sens du service'], missions: ['Accueillir les clients', 'Préparer le service', 'Gérer les réservations', 'Participer à la satisfaction client'] },
  { id: 'btp', label: 'BTP', technical: ['Lecture de plans', 'Suivi chantier', 'Sécurité', 'Métrés'], tools: ['AutoCAD', 'Excel', 'Planning chantier'], soft: ['Précision', 'Esprit terrain', 'Respect des règles'], missions: ['Aider au suivi chantier', 'Préparer des documents', 'Contrôler des métrés', 'Suivre la sécurité'] },
  { id: 'social', label: 'Santé / social', technical: ['Accueil usager', 'Accompagnement', 'Dossier patient', 'Prévention'], tools: ['Logiciels métier', 'Pack Office', 'Planning'], soft: ['Empathie', 'Patience', 'Confidentialité'], missions: ['Aider à l\'accueil', 'Mettre à jour des dossiers', 'Participer à des actions', 'Orienter les usagers'] },
];

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

const splitFreeList = (value) => value.split(/[,\n]/).map(s => s.trim()).filter(Boolean);

const getCvItSkillLines = (domain, selectedStack, profile) => {
  const stack = selectedStack.join(', ') || 'À compléter';
  const keywords = profile.jobOfferKeywords || 'À compléter avec les mots-clés de l\'offre';
  if (domain.id === 'data-analysis') return [
    ['Data & SQL', stack],
    ['Visualisation', 'Power BI, Tableau, Looker Studio, dashboards, KPI'],
    ['Traitement', 'nettoyage de données, ETL, reporting automatisé, qualité des données'],
    ['Bases de données', 'PostgreSQL, MySQL, BigQuery, modélisation de données'],
    ['Outils', 'Jupyter, Excel avancé, Git, dbt, Notion'],
    ['Mots-clés offre', keywords],
  ];
  if (domain.id === 'data-science') return [
    ['Data & ML', stack],
    ['IA & LLM', 'RAG, prompt engineering, vector database, Hugging Face, OpenAI API, Claude API'],
    ['Modélisation', 'feature engineering, évaluation de modèles, NLP, computer vision'],
    ['MLOps & outils', 'MLflow, Docker, Git, Jupyter, expérimentation'],
    ['Bases de données', 'SQL, datasets, pipelines, qualité des données'],
    ['Mots-clés offre', keywords],
  ];
  if (domain.id === 'cyber') return [
    ['Sécurité web', stack],
    ['Réseaux & systèmes', 'Linux, durcissement, analyse de logs, supervision'],
    ['Méthodologie', 'OWASP, documentation des risques, procédures, sensibilisation'],
    ['Outils', 'Wireshark, Burp Suite, Nmap, SIEM, Git'],
    ['Soft skills tech', 'rigueur, esprit critique, confidentialité, communication'],
    ['Mots-clés offre', keywords],
  ];
  return [
    ['Frontend', stack],
    ['Backend & API', 'Node.js, Express/NestJS, API REST, GraphQL, authentification, intégrations'],
    ['Bases de données', 'PostgreSQL, MySQL, MongoDB, Redis, ORM, modélisation'],
    ['DevOps & qualité', 'Git, Docker, CI/CD, tests unitaires/E2E, déploiement'],
    ['Outils', 'VS Code, GitHub/GitLab, Postman, Figma, Linux, cloud'],
    ['Mots-clés offre', keywords],
  ];
};

const buildCvItOutput = ({ profile, domain, selectedStack, projectLinks, contractOutput }) => {
  const fullName = `${profile.firstName || 'PRÉNOM'} ${profile.lastName || 'NOM'}`.trim();
  const title = `${profile.targetJob || domain.label} — ${contractOutput}`;
  const contactLine1 = `${profile.phone || '06 XX XX XX XX'} | ${profile.email || 'email@domain.com'} | ${profile.city || profile.mobility || 'Ville'}`;
  const contactLine2 = `${profile.portfolio || 'portfolio/site'} | ${profile.github || 'github.com/handle'} | ${profile.drivingLicense || 'Permis à compléter'} | ${profile.languages || 'Langues à compléter'}`;
  const skillLines = getCvItSkillLines(domain, selectedStack, profile);
  const projectLines = [profile.github, profile.portfolio, ...projectLinks].filter(Boolean);

  return `CV-IT.md — CONTENU ATS-FRIENDLY 1 PAGE A4 [${contractOutput.toUpperCase()}]

Règles à respecter :
- CV informatique uniquement, ATS d'abord, design ensuite.
- Une seule page A4 exactement, texte parsable, Arial, sections claires.
- Structure fixe : Header, Profil, Compétences Techniques, Expérience Professionnelle, Projets, Formation, Certifications, Informations Complémentaires.
- Adapter le titre, l'ordre des compétences et l'angle des projets ${contractOutput}.
- Utiliser les mots-clés exacts de l'offre quand ils sont fournis.

1. HEADER
Nom : ${fullName}
Titre : ${title}
Contacts ligne 1 : ${contactLine1}
Contacts ligne 2 : ${contactLine2}

2. PROFIL — 4 à 6 lignes justifiées
Profil ${domain.label} ${contractOutput}. Mettre en avant la stack ${selectedStack.slice(0, 8).join(', ') || 'à compléter'}, les projets personnels, les livrables concrets.
Reformuler selon le poste visé : ${profile.targetJob || domain.label}
Objectif : ${profile.goals || 'À compléter'}

3. COMPÉTENCES TECHNIQUES — 6 à 7 lignes label : valeurs
${skillLines.map(([label, value]) => `${label} : ${value}`).join('\n')}

4. EXPÉRIENCE PROFESSIONNELLE — 2 à 3 postes si possible
${profile.experiences || 'À compléter : intitulé — entreprise | dates, lieu + 3 à 6 bullets concis commençant par un verbe d\'action ou un substantif technique.'}

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
${profile.jobOfferKeywords || 'À compléter : colle ici les mots techniques et soft skills de l\'annonce.'}

CONSIGNE POUR L'IA
Génère le contenu final du CV selon CV-IT.md ${contractOutput}. Priorise la pertinence ATS, compresse pour 1 page A4, hiérarchise les compétences, reformule les projets selon le poste.`;
};

// ─── Empty profile ─────────────────────────────────────────────────────────────
const emptyProfile = {
  firstName: '', lastName: '', phone: '', email: '', city: '',
  languages: '', drivingLicense: '', certifications: '', interests: '',
  targetJob: '', formation: '', level: '', mobility: '', companyType: '',
  projects: '', experiences: '', goals: '', extraSkills: '',
  freeStacks: '', github: '', portfolio: '', projectLinks: '', jobOfferKeywords: '',
};

// ─── Main component ────────────────────────────────────────────────────────────
export const SkillsCVPage = () => {
  const [contractType, setContractType]     = useState('ALTERNANCE');
  const [selectedDomain, setSelectedDomain] = useState(skillDomains[0].id);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [profile, setProfile]               = useState(emptyProfile);

  const domain        = skillDomains.find(d => d.id === selectedDomain) || skillDomains[0];
  const isItProfile   = domain.family === 'it';
  const activeContract = CONTRACT_TYPES.find(c => c.id === contractType);
  const contractOutput = activeContract?.output || 'pour une alternance';
  const contractLabel  = activeContract?.label  || contractType;

  const toggleSkill = (skill) =>
    setSelectedSkills(prev => prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]);
  const update = (key, value) => setProfile(prev => ({ ...prev, [key]: value }));

  const freeStacks   = splitFreeList(profile.freeStacks);
  const projectLinks = splitFreeList(profile.projectLinks);
  const selectedStack = [...selectedSkills, ...freeStacks, profile.extraSkills].filter(Boolean);

  const cvItOutput = useMemo(() => {
    if (!isItProfile) return '';
    return buildCvItOutput({ profile, domain, selectedStack, projectLinks, contractOutput });
  }, [isItProfile, profile, domain, selectedStack, projectLinks, contractOutput]);

  const generatedProfile = useMemo(() => `${isItProfile ? `${cvItOutput}\n\n---\n\n` : ''}PROFIL POUR CANDIDATURE — ${contractOutput.toUpperCase()}

Métier ou domaine visé : ${profile.targetJob || domain.label}
Formation : ${profile.formation || 'À compléter'}
Niveau d'étude : ${profile.level || 'À compléter'}
Localisation / mobilité : ${profile.mobility || 'À compléter'}
Type d'entreprise souhaité : ${profile.companyType || 'À compléter'}

Compétences techniques, outils et stacks :
${selectedStack.map(s => `- ${s}`).join('\n') || '- À compléter'}

Qualités utiles :
${domain.soft.map(s => `- ${s}`).join('\n')}

Exemples de missions possibles :
${domain.missions.map(s => `- ${s}`).join('\n')}

Projets réalisés :
${profile.projects || 'À compléter'}

Liens projets / GitHub / portfolio :
${profile.github ? `- GitHub : ${profile.github}\n` : ''}${profile.portfolio ? `- Portfolio : ${profile.portfolio}\n` : ''}${projectLinks.map(l => `- ${l}`).join('\n') || '- À compléter'}

Expériences :
${profile.experiences || 'À compléter'}

Objectif professionnel :
${profile.goals || 'À compléter'}

Consigne : aide-moi à transformer ces informations en CV, email de candidature ou lettre de motivation ${contractOutput}.${isItProfile ? ' Pour ce profil informatique/data, priorise la sortie CV-IT, la stack, les projets et les liens GitHub.' : ''}`,
    [profile, selectedStack, domain, isItProfile, cvItOutput, projectLinks, contractOutput]);

  const promptTemplates = useMemo(() => [
    isItProfile
      ? [`CV-IT — ${contractLabel}`, `À partir du profil ci-dessous, applique CV-IT.md : crée un CV ATS-friendly sur 1 page A4 ${contractOutput}. Structure fixe : Header, Profil, Compétences, Expérience, Projets, Formation, Certifications. Donne un contenu prêt à intégrer.`]
      : [`Améliore mon CV ${contractOutput}`, `À partir du profil ci-dessous, aide-moi à créer un CV ${contractOutput}. Propose un titre, une accroche et reformule mes expériences de façon professionnelle.`],
    [`Email de candidature ${contractOutput}`, `Rédige un email de candidature spontanée ${contractOutput} à partir de mon profil. Ton professionnel, concis, orienté valeur ajoutée immédiate.`],
    [`Lettre de motivation ${contractOutput}`, `Rédige une lettre de motivation courte ${contractOutput} à partir de mon profil. Une page, ton direct, preuves concrètes.`],
    [`Adapte mon profil à cette entreprise`, `À partir de mon profil et des informations de l'entreprise que je vais ajouter, explique quels arguments mettre en avant pour un recruteur ${contractOutput}.`],
    [`Trouve les compétences à mettre en avant`, `Analyse mon profil et liste les compétences les plus pertinentes pour un CV ${contractOutput}.`],
    [`Corrige et rends mon message plus professionnel`, `Corrige le message que je vais écrire ensuite. Rends-le plus professionnel et adapté à une candidature ${contractOutput}.`],
  ], [contractOutput, contractLabel, isItProfile]);

  return (
    <section className="space-y-8">
      {/* Hero */}
      <div className="bg-zinc-950 text-white rounded-3xl p-8 md:p-10 relative overflow-hidden">
        <Sparkles className="absolute right-6 top-6 w-24 h-24 text-red-600 opacity-20" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex bg-red-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-5">Skills & CV</div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4">Prépare ton CV avec tes stacks, projets et skills.</h1>
          <p className="text-zinc-300">Sélectionne ton domaine, tes compétences et génère ta base de profil à coller dans ChatGPT ou Claude.</p>
        </div>
      </div>

      {/* Alerte sécurité */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 text-sm text-amber-900">
        <ShieldAlert className="w-5 h-5 flex-shrink-0" />
        <p>Ne partage pas d'informations sensibles avec un outil externe. Pour GitHub/projets, donne seulement des liens publics.</p>
      </div>

      <div className="grid lg:grid-cols-[1fr_1fr] gap-8">
        {/* ── Colonne gauche ── */}
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
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Mode CV-IT */}
          {isItProfile && (
            <div className="bg-blue-50 border border-blue-100 rounded-3xl p-5">
              <div className="flex items-center gap-2 mb-1 text-blue-900 font-bold text-sm">
                <BrainCircuit className="w-4 h-4" /> Mode CV-IT activé
              </div>
              <p className="text-xs text-blue-800">La sortie suit CV-IT.md : Header, Profil, Compétences, Expérience, Projets, Formation, Certifications — ATS-friendly 1 page A4.</p>
            </div>
          )}

          {/* Skills */}
          <div className="bg-white border border-zinc-200 rounded-3xl p-6">
            <h2 className="text-xl font-bold mb-4">2. Sélectionne tes compétences</h2>
            <div className="space-y-4">
              {[['Compétences / stacks', domain.technical], ['Outils', domain.tools], ['Qualités', domain.soft]].map(([title, list]) => (
                <div key={title}>
                  <h3 className="text-sm font-semibold text-zinc-600 mb-2">{title}</h3>
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
              placeholder="Ajoute tes stacks libres : Tailwind, Zustand, Astro, Kubernetes… Sépare par virgule ou ligne."
              className="mt-4 w-full border border-zinc-200 rounded-xl px-3 py-2 text-sm min-h-20 focus:outline-none focus:ring-2 focus:ring-red-100"
            />
          </div>

          {/* Identité + Profil */}
          <div className="bg-white border border-zinc-200 rounded-3xl p-6 space-y-4">
            <h2 className="text-xl font-bold">3. Ton profil</h2>

            {/* Type de contrat — petits boutons */}
            <div>
              <p className="text-sm font-semibold text-zinc-600 mb-2">Ce CV est pour…</p>
              <div className="flex flex-wrap gap-2">
                {CONTRACT_TYPES.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setContractType(c.id)}
                    className={`text-sm px-4 py-1.5 rounded-full border font-medium transition-all
                      ${contractType === c.id
                        ? 'bg-zinc-900 text-white border-zinc-900'
                        : 'bg-white text-zinc-600 border-zinc-300 hover:border-zinc-500'}`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              {[
                ['firstName', 'Prénom'], ['lastName', 'Nom'],
                ['phone', 'Téléphone'], ['email', 'Email'],
                ['city', 'Ville'], ['languages', 'Langues'],
                ['drivingLicense', 'Permis'], ['interests', 'Centres d\'intérêt'],
                ['targetJob', 'Métier / poste visé'], ['formation', 'Formation / diplôme'],
                ['level', 'Niveau d\'étude'], ['mobility', 'Localisation / mobilité'],
                ['companyType', 'Type d\'entreprise souhaité'],
              ].map(([key, label]) => (
                <input key={key} value={profile[key]} onChange={e => update(key, e.target.value)}
                  placeholder={label}
                  className="border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-100" />
              ))}
            </div>

            <div className="grid gap-3">
              <input value={profile.github}      onChange={e => update('github', e.target.value)}      placeholder="Lien GitHub public"                 className="border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-100" />
              <input value={profile.portfolio}   onChange={e => update('portfolio', e.target.value)}   placeholder="Portfolio / site perso / démo"      className="border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-100" />
              <textarea value={profile.projectLinks}     onChange={e => update('projectLinks', e.target.value)}     placeholder="Liens projets / repos GitHub, un par ligne."                                                          className="border border-zinc-200 rounded-xl px-3 py-2 text-sm min-h-16 focus:outline-none focus:ring-2 focus:ring-red-100" />
              <textarea value={profile.jobOfferKeywords} onChange={e => update('jobOfferKeywords', e.target.value)} placeholder="Mots-clés de l'offre à retrouver dans le CV : React, API REST, autonomie, Power BI…"               className="border border-zinc-200 rounded-xl px-3 py-2 text-sm min-h-16 focus:outline-none focus:ring-2 focus:ring-red-100" />
              <textarea value={profile.projects}         onChange={e => update('projects', e.target.value)}         placeholder="Décris tes projets : nom, objectif, URL, stack, résultat, métriques"                                className="border border-zinc-200 rounded-xl px-3 py-2 text-sm min-h-20 focus:outline-none focus:ring-2 focus:ring-red-100" />
              <textarea value={profile.experiences}      onChange={e => update('experiences', e.target.value)}      placeholder="Expériences : intitulé — entreprise | dates + bullets orientés action/résultat"                    className="border border-zinc-200 rounded-xl px-3 py-2 text-sm min-h-20 focus:outline-none focus:ring-2 focus:ring-red-100" />
              <textarea value={profile.certifications}   onChange={e => update('certifications', e.target.value)}   placeholder="Certifications : nom — émetteur | année"                                                           className="border border-zinc-200 rounded-xl px-3 py-2 text-sm min-h-16 focus:outline-none focus:ring-2 focus:ring-red-100" />
              <textarea value={profile.goals}            onChange={e => update('goals', e.target.value)}            placeholder="Objectif professionnel"                                                                            className="border border-zinc-200 rounded-xl px-3 py-2 text-sm min-h-16 focus:outline-none focus:ring-2 focus:ring-red-100" />
              <input    value={profile.extraSkills}      onChange={e => update('extraSkills', e.target.value)}      placeholder="Autres compétences à ajouter"                                                                     className="border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-100" />
            </div>
          </div>
        </div>

        {/* ── Colonne droite : sorties ── */}
        <div className="space-y-6 lg:sticky lg:top-6 self-start">

          {isItProfile && (
            <div className="bg-zinc-950 text-white border border-zinc-800 rounded-3xl p-6">
              <div className="flex items-center justify-between gap-3 mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Code2 className="w-5 h-5" /> CV-IT — <span className="text-zinc-400 text-sm font-normal">{contractOutput}</span>
                </h2>
                <CopyButton text={cvItOutput}>Copier CV-IT</CopyButton>
              </div>
              <pre className="whitespace-pre-wrap text-xs bg-black/30 border border-white/10 rounded-2xl p-4 max-h-[360px] overflow-auto text-zinc-200">{cvItOutput}</pre>
            </div>
          )}

          <div className="bg-white border border-zinc-200 rounded-3xl p-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-xl font-bold">Base complète à copier</h2>
                <p className="text-xs text-zinc-400 mt-0.5">{contractOutput}</p>
              </div>
              <CopyButton text={generatedProfile}>Copier</CopyButton>
            </div>
            <pre className="whitespace-pre-wrap text-xs bg-zinc-50 border border-zinc-100 rounded-2xl p-4 max-h-[520px] overflow-auto text-zinc-700">{generatedProfile}</pre>
          </div>

          <div className="bg-white border border-zinc-200 rounded-3xl p-6">
            <h2 className="text-xl font-bold mb-1">Prompts prêts pour ChatGPT ou Claude</h2>
            <p className="text-xs text-zinc-400 mb-4">{contractOutput}</p>
            <div className="space-y-3">
              {promptTemplates.map(([title, prompt]) => (
                <div key={title} className="border border-zinc-200 rounded-2xl p-4">
                  <p className="font-semibold text-sm mb-1">{title}</p>
                  <p className="text-xs text-zinc-500 mb-3">{prompt}</p>
                  <CopyButton text={`${prompt}\n\n${generatedProfile}`}>Copier le prompt</CopyButton>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
