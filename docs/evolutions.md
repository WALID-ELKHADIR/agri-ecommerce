# Évolutions préparées (phase 5)

Ces emplacements existent dans le code mais **ne sont pas publiés sur le site**. Chacun indique ce qui manque pour l'activer.

## Version arabe
- **Code** : `lib/i18n/{fr,ar,index}.ts` (dictionnaires, `getDictionary`, `direction`). `app/layout.tsx` pose `lang` et `dir` à partir de `DEFAULT_LOCALE` (fr).
- **Pour l'activer** :
  1. faire relire `lib/i18n/ar.ts` par un locuteur natif ;
  2. ajouter un segment `app/[lang]/` ou un sous-domaine ;
  3. remplacer les textes en dur par le dictionnaire ;
  4. vérifier le miroir des mises en page (`rtl`) ;
  5. ajouter les `alternates.languages` aux métadonnées.

## WhatsApp par région
- **Code** : `lib/whatsapp-region.ts` (`resolveWhatsappNumber`, testé). Les numéros par région se saisissent déjà dans l'admin (Réglages).
- **Pour l'activer** : demander la région au visiteur (sélecteur ou ville du tiroir de devis), puis passer le numéro résolu aux liens WhatsApp (`WhatsappProvider`).

## Calculateur de pompe
- **Code** : `lib/evolutions/pump-calculator.ts` (types d'entrée et de sortie).
- **Pour l'activer** : obtenir du propriétaire les courbes ou plages débit/HMT réelles de chaque pompe (aucune valeur inventée), écrire la règle de sélection et ses tests, puis créer la page.

## Fiches conseils
- **Code** : `lib/evolutions/advice.ts` (modèle d'une fiche).
- **Pour l'activer** : rédiger les contenus, choisir le stockage (table Supabase ou fichiers MDX), créer `/conseils` et l'ajouter au plan du site.

## Suivi de l'entonnoir
- **Code** : `lib/evolutions/funnel.ts` (étapes nommées). Les clics WhatsApp sont déjà enregistrés avec leur origine (`quote_requests.source`).
- **Pour l'activer** : enregistrer les étapes (table dédiée, sans outil tiers ni cookie de suivi), puis ajouter un graphique d'entonnoir au tableau de bord admin.
