// Pont entre le site (index.html) et le plugin natif AdMob de Capacitor.
// Ce fichier ne fait rien dans un navigateur classique (Capacitor n'existe pas),
// il ne s'active que dans l'application Android packagée.

(function () {
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
        initializeForTesting: true
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

      let recompenseRecue = false;

      const abonnementRecompense = AdMob.addListener("onRewardedVideoAdReward", () => {
        recompenseRecue = true;
      });

      const abonnementFermeture = AdMob.addListener("onRewardedVideoAdClosed", () => {
        abonnementRecompense.remove();
        abonnementFermeture.remove();
        // Recharge une nouvelle pub pour la prochaine fois
        chargerPub();

        if (recompenseRecue) {
          surRecompenseObtenue();
        } else {
          surEchec("pub fermée avant la fin");
        }
      });

      await AdMob.showRewardVideoAd();
    } catch (erreur) {
      surEchec(erreur);
    }
  };

  document.addEventListener("DOMContentLoaded", sInitialiser);
  if (document.readyState === "complete" || document.readyState === "interactive") {
    sInitialiser();
  }
})();
