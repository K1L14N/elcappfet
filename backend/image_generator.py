#!/usr/bin/env python3
"""
Service de génération d'images pour les menus Eldora avec Gemini AI
Génère des images de plats à partir des données de menu et les cache en mémoire
"""

import os
import json
import hashlib
import logging
import asyncio
from datetime import datetime, timedelta
from typing import Dict, Optional, Tuple
from io import BytesIO

from PIL import Image
from google import genai
from google.genai import types
from dotenv import load_dotenv

# Charger les variables d'environnement depuis .env
load_dotenv()

logger = logging.getLogger(__name__)

class MenuImageGenerator:
    """
    Générateur d'images pour les menus utilisant Gemini AI
    Cache les images en mémoire avec expiration automatique
    """

    def __init__(self, api_key: Optional[str] = None):
        """
        Initialise le générateur d'images

        Args:
            api_key: Clé API Gemini (utilise GOOGLE_GENAI_API_KEY env var si None)
        """
        self.api_key = api_key or os.getenv('GOOGLE_GENAI_API_KEY')
        logger.info(f"Clé API chargée: {self.api_key[:20]}..." if self.api_key else "Aucune clé API trouvée")

        if not self.api_key:
            raise ValueError("Clé API Gemini requise (paramètre ou GOOGLE_GENAI_API_KEY)")

        self.client = genai.Client(api_key=self.api_key)
        self.cache: Dict[str, Tuple[bytes, datetime]] = {}
        self.cache_ttl = int(os.getenv('CACHE_TTL_HOURS', '2')) * 3600  # 2 heures par défaut

        logger.info(f"MenuImageGenerator initialisé avec TTL cache: {self.cache_ttl}s")

    def _generate_menu_hash(self, menu_item) -> str:
        """
        Génère un hash unique pour un menu item

        Args:
            menu_item: Objet MenuItem

        Returns:
            Hash string unique pour ce menu
        """
        menu_str = f"{menu_item.type}_{menu_item.contenu}_{menu_item.prix}"
        return hashlib.md5(menu_str.encode()).hexdigest()

    def _generate_prompt(self, menu_item) -> str:
        """
        Génère un prompt optimisé pour Gemini AI basé sur les données du menu

        Args:
            menu_item: Objet MenuItem

        Returns:
            Prompt string pour la génération d'image
        """
        return f"""
        Crée une image appétissante et professionnelle d'un plat {menu_item.type} dans un restaurant d'entreprise suisse moderne.

        Détails du plat:
        - Nom/Description: {menu_item.contenu}
        - Prix: {menu_item.prix}
        - Catégorie: {menu_item.type}

        Style requis:
        - Format: 4:3 (300x225px)
        - Qualité: Haute résolution, professionnelle
        - Éclairage: Lumière naturelle, appétissante
        - Composition: Centrée, propre présentation
        - Couleurs: Vives et naturelles
        - Arrière-plan: Cuisine/restaurant moderne épuré

        Évite: Logos, texte, personnes, éléments distrayants.
        Focus: Uniquement sur le plat de manière appétissante.
        """

    def _is_cache_valid(self, cache_time: datetime) -> bool:
        """
        Vérifie si une entrée de cache est encore valide

        Args:
            cache_time: Timestamp de création du cache

        Returns:
            True si le cache est valide
        """
        return datetime.now() - cache_time < timedelta(seconds=self.cache_ttl)

    def _cleanup_expired_cache(self):
        """Nettoie les entrées de cache expirées"""
        expired_keys = [
            key for key, (_, timestamp) in self.cache.items()
            if not self._is_cache_valid(timestamp)
        ]

        for key in expired_keys:
            del self.cache[key]
            logger.info(f"Cache expiré supprimé: {key}")

        if expired_keys:
            logger.info(f"Nettoyage cache: {len(expired_keys)} entrées supprimées")

    async def generate_image(self, menu_item) -> bytes:
        """
        Génère une image pour un menu item

        Args:
            menu_item: Objet MenuItem

        Returns:
            Bytes de l'image générée au format PNG

        Raises:
            Exception: Si la génération échoue
        """
        # Générer hash unique pour ce menu
        menu_hash = self._generate_menu_hash(menu_item)

        # Vérifier le cache
        if menu_hash in self.cache:
            cached_image, cache_time = self.cache[menu_hash]
            if self._is_cache_valid(cache_time):
                logger.info(f"Image servie depuis le cache: {menu_hash}")
                return cached_image
            else:
                # Supprimer du cache si expiré
                del self.cache[menu_hash]

        # Nettoyer le cache expiré avant génération
        self._cleanup_expired_cache()

        try:
            logger.info(f"Génération d'image pour menu: {menu_item.contenu}")

            # Générer le prompt
            prompt = self._generate_prompt(menu_item)

            # Appeler Gemini AI
            response = self.client.models.generate_content(
                model="gemini-2.5-flash-image",
                contents=[prompt]
            )

            # Extraire l'image de la réponse
            if response.candidates and response.candidates[0].content.parts:
                for part in response.candidates[0].content.parts:
                    if hasattr(part, 'inline_data') and part.inline_data:
                        # Convertir en bytes
                        image_bytes = part.inline_data.data

                        # Ouvrir avec PIL pour validation et conversion
                        image = Image.open(BytesIO(image_bytes))

                        # Redimensionner en 4:3 (300x225) si nécessaire
                        target_ratio = 4/3
                        current_ratio = image.width / image.height

                        if abs(current_ratio - target_ratio) > 0.01:  # Tolérance de 1%
                            if current_ratio > target_ratio:
                                # Image trop large
                                new_width = int(image.height * target_ratio)
                                new_height = image.height
                            else:
                                # Image trop haute
                                new_width = image.width
                                new_height = int(image.width / target_ratio)

                            image = image.resize((new_width, new_height), Image.Resampling.LANCZOS)

                        # Convertir en PNG optimisé
                        output = BytesIO()
                        image.save(output, format='PNG', optimize=True, quality=85)
                        optimized_bytes = output.getvalue()

                        # Mettre en cache
                        self.cache[menu_hash] = (optimized_bytes, datetime.now())

                        logger.info(f"Image générée et mise en cache: {menu_hash}")
                        return optimized_bytes

            raise Exception("Aucune image générée par Gemini AI")

        except Exception as e:
            logger.error(f"Erreur génération image pour {menu_hash}: {str(e)}")
            raise Exception(f"Échec génération image: {str(e)}")

    def get_cache_stats(self) -> Dict:
        """
        Retourne les statistiques du cache

        Returns:
            Dictionnaire avec les statistiques du cache
        """
        total_entries = len(self.cache)
        valid_entries = sum(1 for _, (_, timestamp) in self.cache.items()
                          if self._is_cache_valid(timestamp))

        return {
            "total_entries": total_entries,
            "valid_entries": valid_entries,
            "expired_entries": total_entries - valid_entries,
            "cache_ttl_seconds": self.cache_ttl,
            "memory_usage_mb": total_entries * 0.1  # Estimation approximative
        }

# Instance globale pour l'API
image_generator = None

def get_image_generator() -> MenuImageGenerator:
    """Retourne l'instance globale du générateur d'images"""
    global image_generator
    if image_generator is None:
        image_generator = MenuImageGenerator()
    return image_generator