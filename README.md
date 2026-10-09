# NextCV — projet Android (Capacitor)

## Comment envoyer ce projet sur GitHub depuis Termux

1. Décompresse ce dossier sur ton téléphone (si tu as reçu un .zip).
2. Dans Termux, place-toi dans le dossier du projet :
   ```
   cd chemin/vers/cv-express-app
   ```
3. Initialise git et connecte-le à GitHub :
   ```
   git init
   git add .
   git commit -m "Premier envoi de NextCV"
   git branch -M main
   git remote add origin https://github.com/shalom-dev12/cv-express.git
   git push -u origin main
   ```
   (Il faudra créer le dépôt vide "cv-express" sur github.com avant, via le bouton "New repository" — ne coche rien, pas de README ni de .gitignore, pour éviter un conflit.)

4. Une fois poussé, va dans l'onglet **Actions** de ton dépôt GitHub : la construction de l'APK démarre automatiquement. Patiente quelques minutes.
5. Quand c'est vert ✓, clique sur le run terminé → en bas, télécharge l'artefact **nextcv-apk** → dézippe-le sur ton téléphone pour obtenir `app-debug.apk`.
6. Installe cet APK sur ton téléphone (autorise "sources inconnues" si demandé) pour tester l'app réelle avec la vraie pub récompensée AdMob.
