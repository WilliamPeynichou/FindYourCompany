import React from 'react';
import { Mail, RefreshCw, FileText, Bot, AlertTriangle, Target } from 'lucide-react';

const tips = [
  { icon: Target, title: 'Choisir les bonnes entreprises', text: 'Commence par les entreprises proches, dans ton domaine, avec un site ou un email disponible. Ne te limite pas aux offres publiées : beaucoup d’alternances viennent de candidatures spontanées.' },
  { icon: Mail, title: 'Écrire un email court', text: 'Ton email doit dire qui tu es, ce que tu cherches, ton rythme, ta date de début et pourquoi l’entreprise t’intéresse. Le but est d’obtenir une réponse, pas de tout raconter.' },
  { icon: RefreshCw, title: 'Relancer proprement', text: 'Relance après 5 à 7 jours ouvrés si tu n’as pas de réponse. Reste poli, court et précis. Une relance augmente fortement tes chances.' },
  { icon: FileText, title: 'Adapter ton CV', text: 'Mets en avant les compétences qui correspondent à l’entreprise ciblée. Pour un profil junior, les projets, stages, jobs et qualités concrètes comptent beaucoup.' },
  { icon: Bot, title: 'Utiliser ChatGPT ou Claude', text: 'Donne un profil structuré, puis demande une version courte, naturelle et personnalisable. Vérifie toujours le texte avant de l’envoyer.' },
  { icon: AlertTriangle, title: 'Éviter les erreurs fréquentes', text: 'N’envoie pas le même message impersonnel partout, n’oublie pas ton rythme d’alternance, et ne promets pas des compétences que tu ne maîtrises pas.' }
];

export const AlternanceGuidePage = () => {
  const emailExample = `Objet : Candidature alternance - [Métier visé]\n\nBonjour,\n\nJe suis actuellement en formation [nom de la formation] et je recherche une alternance à partir de [date], avec un rythme [rythme].\n\nVotre entreprise m’intéresse car elle correspond à mon projet dans le domaine [secteur/métier]. Je souhaite développer mes compétences en [2-3 compétences] tout en contribuant à des missions concrètes.\n\nJe serais ravi(e) de vous transmettre mon CV et d’échanger avec vous sur une éventuelle opportunité, même dans le cadre d’une candidature spontanée.\n\nCordialement,\n[Nom]\n[Téléphone]`;

  const followupExample = `Bonjour,\n\nJe me permets de revenir vers vous concernant ma candidature en alternance envoyée la semaine dernière.\n\nJe reste très intéressé(e) par votre entreprise et disponible pour échanger ou vous transmettre des informations complémentaires.\n\nMerci pour votre retour,\n[Nom]`;

  return (
    <section className="space-y-8">
      <div className="bg-white border border-zinc-200 rounded-3xl p-8 md:p-10">
        <div className="inline-flex bg-red-50 text-red-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-5">Guide alternance</div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4">Comment trouver son alternance plus efficacement ?</h1>
        <p className="text-zinc-500 max-w-3xl">Une méthode simple : cibler les bonnes entreprises, envoyer un message clair, suivre ses candidatures et relancer au bon moment.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tips.map((tip) => {
          const ICON = tip.icon;
          return <article key={tip.title} className="bg-white border border-zinc-200 rounded-2xl p-5"><ICON className="w-6 h-6 text-red-600 mb-3" /><h2 className="font-bold mb-2">{tip.title}</h2><p className="text-sm text-zinc-500 leading-relaxed">{tip.text}</p></article>;
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-zinc-950 text-white rounded-3xl p-6">
          <h2 className="text-2xl font-bold mb-3">Combien d’entreprises contacter ?</h2>
          <p className="text-zinc-300 text-sm leading-relaxed">Vise 10 à 20 entreprises qualifiées par semaine plutôt que 100 messages génériques. Note chaque candidature, relance celles sans réponse et améliore ton message au fil des retours.</p>
          <ul className="mt-4 space-y-2 text-sm text-zinc-200">
            <li>• Priorité aux entreprises avec email ou site web.</li>
            <li>• Personnalise au moins la première phrase.</li>
            <li>• Ajoute toujours ton rythme et ta date de début.</li>
            <li>• Relance après 5 à 7 jours ouvrés.</li>
          </ul>
        </div>

        <div className="bg-red-50 border border-red-100 rounded-3xl p-6">
          <h2 className="text-2xl font-bold mb-3 text-red-950">Candidature spontanée : bonne pratique</h2>
          <p className="text-sm text-red-800 leading-relaxed">Ne dis pas seulement “je cherche une alternance”. Explique rapidement ce que tu peux apprendre et apporter : aide opérationnelle, motivation, projets réalisés, outils déjà utilisés.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white border border-zinc-200 rounded-3xl p-6">
          <h2 className="text-xl font-bold mb-3">Exemple d’email</h2>
          <pre className="whitespace-pre-wrap text-xs bg-zinc-50 rounded-2xl p-4 text-zinc-700 border border-zinc-100">{emailExample}</pre>
        </div>
        <div className="bg-white border border-zinc-200 rounded-3xl p-6">
          <h2 className="text-xl font-bold mb-3">Exemple de relance</h2>
          <pre className="whitespace-pre-wrap text-xs bg-zinc-50 rounded-2xl p-4 text-zinc-700 border border-zinc-100">{followupExample}</pre>
        </div>
      </div>
    </section>
  );
};
