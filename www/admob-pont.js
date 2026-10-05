// Pont entre le site (index.html) et le plugin natif AdMob de Capacitor.
// Ce fichier ne fait rien dans un navigateur classique (Capacitor n'existe pas),
// il ne s'active que dans l'application Android packagée.

(function () {
  // ⚠️ MODE TEST ACTIVÉ : identifiant de pub factice fourni par Google,
  // qui fonctionne toujours. Sert uniquement à vérifier que l'intégration
  // technique fonctionne, pendant que le vrai compte AdMob "chauffe".
  // Une fois confirmé, remettre : "ca-app-pub-4323566518250268/3701681010"
  const IDENTIFIANT_BLOC_RECOMPENSE = "ca-app-pub-3940256099942544/5224354917";

  if (!window.Capacitor || !window.Capacitor.Plugins || !window.Capacitor.Plugins.AdMob) {
    // Pas dans l'app Android (ex: test dans Chrome) → on ne fait rien,
    // index.html utilisera automatiquement son mode de test (délai simulé).
    return;
  }

  const AdMob = window.Capacitor.Plugins.AdMob;
  let initialise = false;
  let pubPrete = false;

  async function sInitialiser() {
    if (initialise) return;
    initialise = true;
    try {
      await AdMob.initialize({
        requestTrackingAuthorization: true,
        initializeForTesting: true // ⚠️ mode test — remettre à false avant publication finale
      });
      await chargerPub();
    } catch (erreur) {
      console.error("Erreur initialisation AdMob :", erreur);
    }
  }

  async function chargerPub() {
    try {
      pubPrete = false;
      await AdMob.prepareRewardVideoAd({ adId: IDENTIFIANT_BLOC_RECOMPENSE });
      pubPrete = true;
    } catch (erreur) {
      console.error("Erreur chargement pub récompensée :", erreur);
      pubPrete = false;
    }
  }

  // Fonction appelée par index.html au clic sur "Télécharger"
  window.admobAfficherPubRecompensee = async function (surRecompenseObtenue, surEchec) {
    try {
      if (!pubPrete) {
        // La pub n'était pas encore prête → on tente un chargement à la volée
        await chargerPub();
        if (!pubPrete) {
          surEchec("pub non prête");
          return;
        }
      }

      let dejaDebloque = false;

      const debloquer = (parEvenement) => {
        if (dejaDebloque) return;
        dejaDebloque = true;
        try { abonnementRecompense.remove(); } catch (e) {}
        try { abonnementFermeture.remove(); } catch (e) {}
        chargerPub(); // recharge une nouvelle pub pour la prochaine fois
        console.log("Récompense débloquée via :", parEvenement);
        surRecompenseObtenue();
      };

      const abonnementRecompense = AdMob.addListener("onRewardedVideoAdReward", () => {
        debloquer("évènement reward");
      });

      const abonnementFermeture = AdMob.addListener("onRewardedVideoAdClosed", () => {
        // Sécurité : même si l'évènement "reward" précis n'est jamais arrivé
        // (différences selon version du plugin / appareil), le fait que la
        // pub se soit fermée après avoir été montrée suffit à débloquer.
        debloquer("fermeture de la pub");
      });

      await AdMob.showRewardVideoAd();

      // Double filet de sécurité : si ni l'évènement "reward" ni "closed"
      // ne s'est déclenché quelques secondes après la fin de l'appel natif
      // (bug connu sur certaines versions/appareils), on débloque quand
      // même plutôt que de laisser l'app bloquée indéfiniment.
      setTimeout(() => debloquer("filet de sécurité (aucun évènement reçu)"), 4000);
    } catch (erreur) {
      surEchec(erreur);
    }
  };

  document.addEventListener("DOMContentLoaded", sInitialiser);
  if (document.readyState === "complete" || document.readyState === "interactive") {
    sInitialiser();
  }
})();
