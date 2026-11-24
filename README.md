# Quiet Tab Blocker

Une extension légère pour Brave et Google Chrome qui empêche les sites de votre liste noire d’ouvrir de nouveaux onglets ou fenêtres.

<img width="253" height="393" alt="Capture d&#39;écran 2026-11-24 110806" src="https://github.com/user-attachments/assets/a5271c0f-322a-4157-806c-4efebe5b224f" />


## Fonctionnalités

- interrupteur global on/off ;
- ajout manuel d’un domaine ou ajout du site actuel ;
- prise en charge automatique des sous-domaines ;
- blocage des liens et formulaires en nouvel onglet, des clics `Ctrl`/`Cmd`/molette et de `window.open` ;
- fermeture de sécurité d’un onglet si un site contourne la prévention côté page ;
- stockage local uniquement, sans collecte de données ni service externe.

## Installation dans Brave

1. Ouvrez `brave://extensions`.
2. Activez **Mode développeur** en haut à droite.
3. Cliquez sur **Charger l’extension non empaquetée**.
4. Sélectionnez ce dossier `extensionblocker`.
5. Épinglez **Quiet Tab Blocker** dans la barre d’outils si vous le souhaitez.

## Installation dans Chrome

1. Ouvrez `chrome://extensions`.
2. Activez **Mode développeur**.
3. Cliquez sur **Charger l’extension non empaquetée**.
4. Sélectionnez ce dossier.

## Utilisation

Ouvrez l’icône de l’extension, ajoutez par exemple `exemple.com`, puis laissez l’interrupteur activé. Le domaine et tous ses sous-domaines ne pourront plus ouvrir de nouvel onglet. Les onglets que vous ouvrez depuis les autres sites restent inchangés.

## Confidentialité

Les domaines et l’état on/off sont enregistrés dans `chrome.storage.local`, uniquement dans votre profil de navigateur. L’extension ne contient aucun suivi et n’envoie aucune donnée sur Internet.
