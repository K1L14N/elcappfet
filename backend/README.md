# API Serveur de Menus Eldora

Serveur Python FastAPI qui récupère et parse automatiquement les menus de la semaine depuis le site Eldora.

## Fonctionnalités

- **Parsing automatique** : Extrait les menus Bistro et Vitality pour chaque jour de la semaine
- **API REST** : Interface web simple avec endpoints JSON
- **Gestion d'erreurs robuste** : Gestion des erreurs de connexion et de parsing
- **Structure flexible** : S'adapte aux différentes variations de pages
- **CORS activé** : Accessible depuis n'importe quelle origine

## Structure des données

### Réponse complète (`GET /menus`)

```json
{
  "success": true,
  "data": {
    "semaine": "Du 6 au 10 Octobre",
    "jours": {
      "lundi": {
        "bistro": {
          "type": "Bistro",
          "contenu": "CUISINE DU MONDE Korma de poulet Riz aux épices Ragout de légumes au lait de coco",
          "prix": "CHF 14.50"
        },
        "vitality": {
          "type": "Vitality",
          "contenu": "Pavé de cabillaud poché Sauce au cerfeuil Pommes de Peney Le Jorat Gratin de poireaux",
          "prix": "CHF 14.50"
        }
      }
    }
  },
  "metadata": {
    "source_url": "https://app2.eldora.ch/totem/matin?NumEts=9677",
    "parsed_at": "2024-01-01T12:00:00",
    "jours_disponibles": ["lundi", "mardi", "mercredi", "jeudi", "vendredi"],
    "total_jours": 5
  }
}
```

### Réponse par jour (`GET /menus/{jour}`)

```json
{
  "success": true,
  "data": {
    "jour": "lundi",
    "semaine": "Du 6 au 10 Octobre",
    "bistro": {
      "type": "Bistro",
      "contenu": "CUISINE DU MONDE Korma de poulet...",
      "prix": "CHF 14.50"
    },
    "vitality": {
      "type": "Vitality",
      "contenu": "Pavé de cabillaud poché...",
      "prix": "CHF 14.50"
    }
  }
}
```

## Installation

1. **Cloner/Décompresser le projet**

   ```bash
   # Assurez-vous d'être dans le répertoire du projet
   cd /path/to/project
   ```

2. **Installer les dépendances**

   ```bash
   pip install -r requirements.txt
   ```

3. **Démarrer le serveur**
   ```bash
   python3 menu_parser_server.py
   ```

Le serveur démarrera sur `http://localhost:8000`

## Utilisation

### Endpoints disponibles

#### `GET /`

Page d'accueil avec informations sur l'API

#### `GET /health`

Vérification de l'état du service

#### `GET /menus`

Récupère tous les menus de la semaine

#### `GET /menus/{jour}`

Récupère le menu d'un jour spécifique

- `jour` : lundi, mardi, mercredi, jeudi, vendredi (insensible à la casse)

### Exemples d'utilisation

#### Récupérer tous les menus

```bash
curl http://localhost:8000/menus
```

#### Récupérer le menu du lundi

```bash
curl http://localhost:8000/menus/lundi
```

#### Utilisation avec Python

```python
import requests

# Tous les menus
response = requests.get('http://localhost:8000/menus')
data = response.json()

# Menu d'un jour spécifique
response = requests.get('http://localhost:8000/menus/mardi')
data = response.json()
```

## Architecture

### Classes principales

- **`MenuParser`** : Parser HTML générique

  - `parser_html_menu()` : Parse le HTML complet
  - `extraire_menus_jour()` : Extrait les menus d'un jour
  - Gestion robuste des erreurs et variations de structure

- **`EldoraMenuAPI`** : Wrapper FastAPI
  - Configuration CORS
  - Gestion des routes
  - Gestion d'erreurs HTTP

### Modèles de données

- **`MenuItem`** : Représente un menu (Bistro/Vitality)
- **`JourMenu`** : Représente les menus d'un jour
- **`MenuSemaine`** : Représente le menu complet de la semaine

## Gestion d'erreurs

Le serveur gère plusieurs types d'erreurs :

- **Erreurs de connexion** (503) : Problèmes de réseau ou serveur indisponible
- **Erreurs de parsing** (500) : Structure HTML inattendue
- **Jours non trouvés** (404) : Jour demandé non disponible

## Configuration

### Headers HTTP

Le serveur utilise des headers réalistes pour éviter la détection :

- User-Agent : Navigateur Chrome récent
- Accept-Language : Français (France)
- Connection : keep-alive

### Timeouts

- Timeout de connexion : 30 secondes
- Gestion automatique des redirections

## Sécurité

- **Pas de données sensibles** : Seules les informations publiques des menus
- **CORS configuré** : Accessible depuis n'importe quelle origine
- **Pas de stockage persistant** : Les données sont récupérées en temps réel

## Développement

### Structure du projet

```
/
├── menu_parser_server.py    # Serveur principal
├── requirements.txt         # Dépendances Python
└── README.md               # Cette documentation
```

### Ajout de nouvelles sources

Pour ajouter une nouvelle source de menu :

1. Étendre la classe `MenuParser`
2. Ajouter une méthode de récupération spécifique
3. Mettre à jour les routes API si nécessaire

### Tests

Pour tester le serveur :

1. Démarrer le serveur : `python menu_parser_server.py`
2. Ouvrir `http://localhost:8000` dans un navigateur
3. Utiliser curl ou Postman pour tester les endpoints

## Support

En cas de problème :

1. Vérifier les logs du serveur
2. S'assurer que la source Eldora est accessible
3. Vérifier la structure HTML de la page source

## Licence

Ce projet est destiné à un usage éducatif et personnel.
