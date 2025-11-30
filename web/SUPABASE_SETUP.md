# 🗄️ Configuration Supabase pour DSO

## 📋 Vue d'ensemble

Supabase est utilisé pour :
- **Suivi des scans** : Historique complet de tous les scans
- **Analytics** : Statistiques et tendances
- **Collaboration** : Partage de résultats d'équipe
- **Persistance** : Sauvegarde des résultats et analyses

## 🚀 Configuration

### 1. Créer un projet Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Notez l'URL du projet et la clé anonyme

### 2. Configurer la base de données

1. Dans Supabase Dashboard, allez dans **SQL Editor**
2. Exécutez le script `web/supabase/schema.sql`
3. Vérifiez que toutes les tables sont créées

### 3. Configurer les variables d'environnement

1. Copiez `.env.example` vers `.env` :
   ```bash
   cp .env.example .env
   ```

2. Remplissez les valeurs :
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

### 4. Vérifier la configuration

L'interface web détectera automatiquement si Supabase est configuré. Si ce n'est pas le cas, elle fonctionnera en mode local sans persistance.

## 📊 Structure de la base de données

### Tables principales

- **users** : Utilisateurs (étend auth.users)
- **projects** : Projets scannés
- **scans** : Historique des scans
- **findings** : Vulnérabilités détectées
- **fixes** : Correctifs appliqués
- **ai_analysis** : Analyses IA
- **top_fixes** : Corrections prioritaires
- **scan_history** : Historique pour analytics

## 🔒 Sécurité

- **Row Level Security (RLS)** activé sur toutes les tables
- Les utilisateurs ne voient que leurs propres données
- Authentification via Supabase Auth

## 📈 Analytics disponibles

- Statistiques de scans (30 derniers jours)
- Tendances des vulnérabilités
- Temps moyen de scan
- Taux de correction

## 🎯 Utilisation

Une fois configuré, Supabase est utilisé automatiquement :
- Chaque scan est sauvegardé
- Les résultats sont persistés
- L'historique est disponible dans le Dashboard
- Les analytics sont calculés automatiquement

