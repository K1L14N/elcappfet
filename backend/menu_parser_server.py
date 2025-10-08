#!/usr/bin/env python3
"""
Serveur Python pour parser les menus Eldora
Récupère et analyse le HTML des menus de la semaine depuis Eldora
"""

import re
import json
import logging
import os
from datetime import datetime
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict

import requests
from bs4 import BeautifulSoup
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from dotenv import load_dotenv

# Charger les variables d'environnement depuis .env
load_dotenv()

# Import du générateur d'images
try:
    from image_generator import get_image_generator
except ImportError:
    logging.warning("Module image_generator non trouvé - génération d'images désactivée")


# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@dataclass
class MenuItem:
    """Représente un menu (Bistro ou Vitality) pour un jour donné"""
    type: str  # "Bistro" ou "Vitality"
    contenu: str  # Description du menu
    prix: str  # Prix du menu


@dataclass
class JourMenu:
    """Représente les menus d'un jour spécifique"""
    jour: str  # "lundi", "mardi", etc.
    bistro: Optional[MenuItem]
    vitality: Optional[MenuItem]


@dataclass
class MenuSemaine:
    """Représente le menu complet de la semaine"""
    semaine: str  # "Du 6 au 10 Octobre"
    jours: List[JourMenu]
    metadata: Dict[str, Any]


class MenuParser:
    """Parser générique pour les pages de menu Eldora"""

    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
        })

    def nettoyer_texte(self, texte: str) -> str:
        """Nettoie le texte en supprimant les espaces multiples et caractères indésirables"""
        if not texte:
            return ""

        # Supprimer les espaces multiples et les sauts de ligne
        texte = re.sub(r'\s+', ' ', texte.strip())
        # Supprimer les caractères de contrôle
        texte = re.sub(r'[\x00-\x08\x0b-\x0c\x0e-\x1f\x7f]', '', texte)
        return texte.strip()

    def extraire_menus_jour(self, jour_html) -> JourMenu:
        """Extrait les menus Bistro et Vitality pour un jour donné"""

        # Récupérer le nom du jour
        day_name_elem = jour_html.find('div', class_='dayName')
        if not day_name_elem:
            return None

        jour_nom = self.nettoyer_texte(day_name_elem.get_text()).lower()
        logger.info(f"Extraction du jour: {jour_nom}")

        # Récupérer les panels de menu
        panels = jour_html.find_all('div', class_='panelMenu')
        if len(panels) < 2:
            logger.warning(f"Nombre insuffisant de panels pour {jour_nom}: {len(panels)}")
            return JourMenu(jour=jour_nom, bistro=None, vitality=None)

        bistro = None
        vitality = None

        for panel in panels:
            # Identifier le type de menu
            menu_titre = panel.find('div', class_='menu-titre')
            if not menu_titre:
                continue

            type_menu = self.nettoyer_texte(menu_titre.get_text())

            # Récupérer le contenu du menu
            contenu_elem = panel.find('div', class_='containMenu')
            if not contenu_elem:
                continue

            contenu_span = contenu_elem.find('span')
            if not contenu_span:
                continue

            contenu = self.nettoyer_texte(contenu_span.get_text())

            # Récupérer le prix
            prix_elem = panel.find('div', class_='menu-prix')
            prix = "N/A"
            if prix_elem:
                prix_text = prix_elem.get_text()
                prix_match = re.search(r'CHF\s*([\d.]+)', prix_text)
                if prix_match:
                    prix = f"CHF {prix_match.group(1)}"

            # Créer l'objet MenuItem
            menu_item = MenuItem(
                type=type_menu,
                contenu=contenu,
                prix=prix
            )

            # Assigner selon le type
            if 'bistro' in type_menu.lower():
                bistro = menu_item
            elif 'vitality' in type_menu.lower():
                vitality = menu_item

        return JourMenu(jour=jour_nom, bistro=bistro, vitality=vitality)

    def parser_html_menu(self, html_content: str) -> MenuSemaine:
        """Parse le HTML complet et extrait tous les menus"""

        soup = BeautifulSoup(html_content, 'html.parser')

        # Récupérer la période de la semaine
        titre_elem = soup.find('h1', class_='titreMenu')
        semaine = "Semaine inconnue"
        if titre_elem:
            span_elem = titre_elem.find('span')
            if span_elem:
                semaine = self.nettoyer_texte(span_elem.get_text())

        logger.info(f"Période détectée: {semaine}")

        # Récupérer toutes les lignes de jours
        lignes_jours = soup.find_all('div', class_='ligneSemaine')

        if not lignes_jours:
            logger.error("Aucune ligne de jour trouvée dans le HTML")
            raise ValueError("Structure HTML non reconnue")

        jours_menus = []

        for ligne in lignes_jours:
            jour_menu = self.extraire_menus_jour(ligne)
            if jour_menu:
                jours_menus.append(jour_menu)

        if not jours_menus:
            logger.error("Aucun menu extrait")
            raise ValueError("Aucun menu trouvé dans la page")

        logger.info(f"Menus extraits pour {len(jours_menus)} jours")

        # Métadonnées
        metadata = {
            'source_url': 'https://app2.eldora.ch/totem/matin?NumEts=9677',
            'parsed_at': datetime.now().isoformat(),
            'jours_disponibles': [jour.jour for jour in jours_menus],
            'total_jours': len(jours_menus)
        }

        return MenuSemaine(
            semaine=semaine,
            jours=jours_menus,
            metadata=metadata
        )


class EldoraMenuAPI:
    """API FastAPI pour servir les menus Eldora"""

    def __init__(self):
        self.app = FastAPI(
            title="API Menus Eldora",
            description="API pour récupérer et parser les menus de la semaine Eldora",
            version="1.0.0"
        )

        # Configuration CORS
        self.app.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

        self.parser = MenuParser()
        self._setup_routes()

    def _setup_routes(self):
        """Configure les routes de l'API"""

        @self.app.get("/")
        async def root():
            """Point d'entrée racine"""
            return {
                "message": "API Menus Eldora",
                "version": "1.0.0",
                "endpoints": {
                    "/menus": "Récupérer tous les menus de la semaine (legacy)",
                    "/menus/today": "Récupérer le menu du jour (optimisé mobile)",
                    "/menus/weekly": "Récupérer le menu complet de la semaine",
                    "/menus/{jour}": "Récupérer le menu d'un jour spécifique",
                    "/images/menu/{type}/{description}": "Générer une image pour un menu",
                    "/images/cache/stats": "Statistiques du cache d'images",
                    "/images/cache": "Vider le cache d'images (DELETE)",
                    "/health": "État de santé du service"
                }
            }

        @self.app.get("/health")
        async def health_check():
            """Vérification de l'état du service"""
            return {
                "status": "healthy",
                "timestamp": datetime.now().isoformat(),
                "service": "Eldora Menu Parser API"
            }

        @self.app.get("/menus", response_model=Dict[str, Any])
        async def get_menus_complets():
            """Récupère tous les menus de la semaine (legacy endpoint)"""
            try:
                # Récupérer le HTML
                response = self.parser.session.get(
                    'https://app2.eldora.ch/totem/matin?NumEts=9677',
                    timeout=30
                )
                response.raise_for_status()

                # Parser le HTML
                menu_semaine = self.parser.parser_html_menu(response.text)

                # Convertir en dictionnaire pour la réponse JSON
                return {
                    "success": True,
                    "data": {
                        "semaine": menu_semaine.semaine,
                        "jours": {jour.jour: {
                            "bistro": asdict(jour.bistro) if jour.bistro else None,
                            "vitality": asdict(jour.vitality) if jour.vitality else None
                        } for jour in menu_semaine.jours}
                    },
                    "metadata": menu_semaine.metadata
                }

            except requests.RequestException as e:
                logger.error(f"Erreur de requête HTTP: {e}")
                raise HTTPException(status_code=503, detail=f"Erreur de connexion: {str(e)}")
            except Exception as e:
                logger.error(f"Erreur lors du parsing: {e}")
                raise HTTPException(status_code=500, detail=f"Erreur de traitement: {str(e)}")

        @self.app.get("/menus/today", response_model=Dict[str, Any])
        async def get_today_menu():
            """Récupère le menu du jour optimisé pour mobile"""
            try:
                # Récupérer le HTML
                response = self.parser.session.get(
                    'https://app2.eldora.ch/totem/matin?NumEts=9677',
                    timeout=30
                )
                response.raise_for_status()

                # Parser le HTML
                menu_semaine = self.parser.parser_html_menu(response.text)

                # Trouver le jour actuel
                today = datetime.now().strftime("%A").lower()
                jour_actuel = None

                # Mapping des noms de jours français vers anglais pour comparaison
                day_mapping = {
                    'monday': 'lundi',
                    'tuesday': 'mardi',
                    'wednesday': 'mercredi',
                    'thursday': 'jeudi',
                    'friday': 'vendredi',
                    'saturday': 'samedi',
                    'sunday': 'dimanche'
                }

                today_fr = day_mapping.get(today, today)
                logger.info(f"Jour actuel (EN): {today}, (FR): {today_fr}")

                # Chercher le jour actuel dans les menus disponibles
                for jour_menu in menu_semaine.jours:
                    if jour_menu.jour.lower() == today_fr.lower():
                        jour_actuel = jour_menu
                        break

                # Si pas trouvé, prendre le premier jour disponible
                if not jour_actuel and menu_semaine.jours:
                    jour_actuel = menu_semaine.jours[0]
                    logger.info(f"Jour actuel non trouvé, utilisation du premier: {jour_actuel.jour}")

                if not jour_actuel:
                    raise HTTPException(status_code=404, detail="Aucun menu trouvé pour aujourd'hui")

                # Préparer les données du menu du jour
                bistro_data = None
                if jour_actuel.bistro:
                    bistro_dict = asdict(jour_actuel.bistro)
                    bistro_dict["disponible"] = True
                    bistro_data = bistro_dict
                else:
                    bistro_data = {"disponible": False}

                vitality_data = None
                if jour_actuel.vitality:
                    vitality_dict = asdict(jour_actuel.vitality)
                    vitality_dict["disponible"] = True
                    vitality_data = vitality_dict
                else:
                    vitality_data = {"disponible": False}

                # Retourner le menu du jour avec en-têtes de cache optimisés pour mobile
                return {
                    "success": True,
                    "data": {
                        "jour": jour_actuel.jour,
                        "semaine": menu_semaine.semaine,
                        "bistro": bistro_data,
                        "vitality": vitality_data
                    },
                    "metadata": {
                        **menu_semaine.metadata,
                        "served_at": datetime.now().isoformat(),
                        "endpoint": "today"
                    }
                }

            except requests.RequestException as e:
                logger.error(f"Erreur de requête HTTP: {e}")
                raise HTTPException(status_code=503, detail=f"Erreur de connexion: {str(e)}")
            except Exception as e:
                logger.error(f"Erreur lors du traitement: {e}")
                raise HTTPException(status_code=500, detail=f"Erreur de traitement: {str(e)}")

        @self.app.get("/menus/weekly", response_model=Dict[str, Any])
        async def get_weekly_menu():
            """Récupère le menu complet de la semaine pour l'interface hebdomadaire"""
            try:
                # Récupérer le HTML
                response = self.parser.session.get(
                    'https://app2.eldora.ch/totem/matin?NumEts=9677',
                    timeout=30
                )
                response.raise_for_status()

                # Parser le HTML
                menu_semaine = self.parser.parser_html_menu(response.text)

                # Convertir en dictionnaire avec disponibilité
                jours_data = {}
                for jour in menu_semaine.jours:
                    # Préparer les données bistro
                    bistro_data = None
                    if jour.bistro:
                        bistro_dict = asdict(jour.bistro)
                        bistro_dict["disponible"] = True
                        bistro_data = bistro_dict
                    else:
                        bistro_data = {"disponible": False}

                    # Préparer les données vitality
                    vitality_data = None
                    if jour.vitality:
                        vitality_dict = asdict(jour.vitality)
                        vitality_dict["disponible"] = True
                        vitality_data = vitality_dict
                    else:
                        vitality_data = {"disponible": False}

                    jours_data[jour.jour] = {
                        "bistro": bistro_data,
                        "vitality": vitality_data
                    }

                return {
                    "success": True,
                    "data": {
                        "semaine": menu_semaine.semaine,
                        "jours": jours_data
                    },
                    "metadata": {
                        **menu_semaine.metadata,
                        "served_at": datetime.now().isoformat(),
                        "endpoint": "weekly",
                        "total_jours": len(menu_semaine.jours)
                    }
                }

            except requests.RequestException as e:
                logger.error(f"Erreur de requête HTTP: {e}")
                raise HTTPException(status_code=503, detail=f"Erreur de connexion: {str(e)}")
            except Exception as e:
                logger.error(f"Erreur lors du parsing: {e}")
                raise HTTPException(status_code=500, detail=f"Erreur de traitement: {str(e)}")

        @self.app.get("/images/menu/{menu_type}/{menu_description}")
        async def get_menu_image(menu_type: str, menu_description: str):
            """
            Génère et retourne une image pour un menu spécifique

            Args:
                menu_type: Type de menu (Bistro, Vitality)
                menu_description: Description du plat

            Returns:
                Image PNG du plat générée par IA
            """
            try:
                # Vérifier si le générateur d'images est disponible
                if 'get_image_generator' not in globals():
                    raise HTTPException(
                        status_code=503,
                        detail="Service de génération d'images non disponible"
                    )

                # Créer un objet menu temporaire pour la génération
                from dataclasses import dataclass
                @dataclass
                class TempMenuItem:
                    type: str
                    contenu: str
                    prix: str

                # Parser la description pour extraire le prix si présent
                prix = "N/A"
                prix_match = re.search(r'CHF\s*([\d.]+)', menu_description)
                if prix_match:
                    prix = f"CHF {prix_match.group(1)}"
                    menu_description = re.sub(r'\s*CHF\s*[\d.]+\s*', '', menu_description)

                menu_item = TempMenuItem(
                    type=menu_type,
                    contenu=menu_description.strip(),
                    prix=prix
                )

                # Générer l'image
                image_generator = get_image_generator()
                image_bytes = await image_generator.generate_image(menu_item)

                # Retourner l'image en streaming
                def iter_image():
                    yield image_bytes

                return StreamingResponse(
                    iter_image(),
                    media_type="image/png",
                    headers={"Cache-Control": "public, max-age=7200"}  # Cache 2h
                )

            except Exception as e:
                logger.error(f"Erreur génération image: {str(e)}")
                raise HTTPException(status_code=500, detail=f"Erreur génération image: {str(e)}")

        @self.app.get("/images/cache/stats")
        async def get_cache_stats():
            """Retourne les statistiques du cache d'images"""
            try:
                if 'get_image_generator' not in globals():
                    return {"error": "Service de génération d'images non disponible"}

                image_generator = get_image_generator()
                return image_generator.get_cache_stats()

            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Erreur récupération stats: {str(e)}")

        @self.app.delete("/images/cache")
        async def clear_image_cache():
            """Vide le cache d'images"""
            try:
                if 'get_image_generator' not in globals():
                    raise HTTPException(status_code=503, detail="Service non disponible")

                image_generator = get_image_generator()
                cache_size_before = len(image_generator.cache)
                image_generator.cache.clear()

                return {
                    "message": "Cache vidé avec succès",
                    "entries_removed": cache_size_before
                }

            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Erreur vidage cache: {str(e)}")

        @self.app.get("/menus/{jour}", response_model=Dict[str, Any])
        async def get_menu_jour(jour: str):
            """Récupère le menu d'un jour spécifique"""
            try:
                # Récupérer tous les menus
                response = self.parser.session.get(
                    'https://app2.eldora.ch/totem/matin?NumEts=9677',
                    timeout=30
                )
                response.raise_for_status()

                # Parser le HTML
                menu_semaine = self.parser.parser_html_menu(response.text)

                # Chercher le jour demandé
                jour_trouve = None
                for jour_menu in menu_semaine.jours:
                    if jour_menu.jour.lower() == jour.lower():
                        jour_trouve = jour_menu
                        break

                if not jour_trouve:
                    raise HTTPException(
                        status_code=404,
                        detail=f"Jour '{jour}' non trouvé. Jours disponibles: {[j.jour for j in menu_semaine.jours]}"
                    )

                # Retourner le menu du jour
                return {
                    "success": True,
                    "data": {
                        "jour": jour_trouve.jour,
                        "semaine": menu_semaine.semaine,
                        "bistro": asdict(jour_trouve.bistro) if jour_trouve.bistro else None,
                        "vitality": asdict(jour_trouve.vitality) if jour_trouve.vitality else None
                    },
                    "metadata": menu_semaine.metadata
                }

            except requests.RequestException as e:
                logger.error(f"Erreur de requête HTTP: {e}")
                raise HTTPException(status_code=503, detail=f"Erreur de connexion: {str(e)}")
            except Exception as e:
                logger.error(f"Erreur lors du traitement: {e}")
                raise HTTPException(status_code=500, detail=f"Erreur de traitement: {str(e)}")


# Instance globale de l'API
api = EldoraMenuAPI()


if __name__ == "__main__":
    import uvicorn
    logger.info("Démarrage du serveur API Menus Eldora...")
    uvicorn.run(
        "menu_parser_server:api.app",
        host="0.0.0.0",
        port=8000,
        log_level="info",
        reload=True
    )