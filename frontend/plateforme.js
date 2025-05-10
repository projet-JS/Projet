// URL du backend
const BACKEND_URL = "http://localhost:3000"; // Remplacez par l'URL de votre backend en production

// Démarrer l'examen
document.getElementById("commencer").addEventListener("click", function () {
    const lien = document.getElementById("lien").value;

    // Vérifier que le champ lien n'est pas vide
    if (!lien) {
        alert("Veuillez entrer un lien valide.");
        return;
    }

    fetch(`${BACKEND_URL}/api/examens`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ lien: lien }),
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Erreur HTTP : ${response.status}`);
            }
            return response.json();
        })
        .then((data) => {
            console.log("Réponse du backend :", data);
            alert("Examen démarré avec succès !");
        })
        .catch((error) => {
            console.error("Erreur :", error);
            alert("Une erreur s'est produite lors du démarrage de l'examen.");
        });
});

// Générer un lien unique pour l'examen
document.getElementById("genererLien").addEventListener("click", () => {
    const lien = `${BACKEND_URL}/examen/${Math.random().toString(36).substr(2, 9)}`;
    document.getElementById("lienExamen").innerText = `Lien généré : ${lien}`;
});

// Gérer la géolocalisation
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
        (position) => {
            console.log("Coordonnées :", position.coords);
            alert(`Votre position : Latitude ${position.coords.latitude}, Longitude ${position.coords.longitude}`);
        },
        (error) => {
            let errorMessage = "Erreur de géolocalisation : ";
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage += "L'utilisateur a refusé la demande de géolocalisation.";
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage += "Les informations de localisation ne sont pas disponibles.";
                    break;
                case error.TIMEOUT:
                    errorMessage += "La demande de géolocalisation a expiré.";
                    break;
                default:
                    errorMessage += "Une erreur inconnue s'est produite.";
                    break;
            }
            console.error(errorMessage);
            alert(errorMessage);
        }
    );
} else {
    alert("La géolocalisation n'est pas supportée par ce navigateur.");
}