#!/usr/bin/env python3
"""
Script de test pour le parser de menus Eldora
À exécuter manuellement pour tester le fonctionnement
"""

import sys
import json
from menu_parser_server import MenuParser

def test_parser():
    """Teste le parser avec l'URL Eldora"""

    print("🚀 Test du parser de menus Eldora")
    print("=" * 50)

    parser = MenuParser()

    try:
        # Récupérer le HTML
        print("📡 Récupération du HTML depuis Eldora...")
        response = parser.session.get(
            'https://app2.eldora.ch/totem/matin?NumEts=9677',
            timeout=30
        )
        response.raise_for_status()
        print(f"✅ HTML récupéré ({len(response.text)} caractères)")

        # Parser le HTML
        print("🔍 Parsing du HTML...")
        menu_semaine = parser.parser_html_menu(response.text)

        # Afficher les résultats
        print("\n📊 RÉSULTATS DU PARSING")
        print("=" * 50)
        print(f"📅 Semaine: {menu_semaine.semaine}")
        print(f"📋 Jours trouvés: {len(menu_semaine.jours)}")

        for jour in menu_semaine.jours:
            print(f"\n📅 {jour.jour.upper()}:")
            if jour.bistro:
                print(f"   🍽️  Bistro: {jour.bistro.contenu[:60]}...")
                print(f"   💰 Prix: {jour.bistro.prix}")
            else:
                print("   ❌ Bistro: Non trouvé")
            if jour.vitality:
                print(f"   🥗 Vitality: {jour.vitality.contenu[:60]}...")
                print(f"   💰 Prix: {jour.vitality.prix}")
            else:
                print("   ❌ Vitality: Non trouvé")
        # Afficher les métadonnées
        print("\n📋 MÉTADonnées")
        print("=" * 50)
        print(f"🔗 Source: {menu_semaine.metadata['source_url']}")
        print(f"🕒 Parsé le: {menu_semaine.metadata['parsed_at']}")
        print(f"📅 Jours disponibles: {menu_semaine.metadata['jours_disponibles']}")

        # Tester l'export JSON
        print("\n💾 TEST EXPORT JSON")
        print("=" * 50)

        data_export = {
            "success": True,
            "data": {
                "semaine": menu_semaine.semaine,
                "jours": {jour.jour: {
                    "bistro": jour.bistro.__dict__ if jour.bistro else None,
                    "vitality": jour.vitality.__dict__ if jour.vitality else None
                } for jour in menu_semaine.jours}
            },
            "metadata": menu_semaine.metadata
        }

        print("✅ Export JSON réussi")
        print(f"📏 Taille du JSON: {len(json.dumps(data_export))} caractères")

        # Tester un jour spécifique
        if menu_semaine.jours:
            premier_jour = menu_semaine.jours[0]
            print(f"\n🔍 TEST JOUR SPÉCIFIQUE: {premier_jour.jour}")
            print("=" * 50)

            jour_data = {
                "success": True,
                "data": {
                    "jour": premier_jour.jour,
                    "semaine": menu_semaine.semaine,
                    "bistro": premier_jour.bistro.__dict__ if premier_jour.bistro else None,
                    "vitality": premier_jour.vitality.__dict__ if premier_jour.vitality else None
                },
                "metadata": menu_semaine.metadata
            }

            print("✅ Export jour spécifique réussi")
            print(f"📏 Taille du JSON: {len(json.dumps(jour_data))} caractères")

        print("\n🎉 TEST RÉUSSI !")
        print("=" * 50)
        print("Le parser fonctionne correctement !")
        print("Vous pouvez maintenant démarrer le serveur avec:")
        print("  python menu_parser_server.py")

        return True

    except Exception as e:
        print(f"\n❌ ERREUR LORS DU TEST: {str(e)}")
        print(f"Type d'erreur: {type(e).__name__}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_parser()
    sys.exit(0 if success else 1)