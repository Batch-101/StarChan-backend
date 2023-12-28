var express = require('express');
var router = express.Router();
const Subject = require('../models/subjects');


router.post('/search', async (req, res) => {

    // Récupère tous les sujets disponibles dans la base de données
    const subjects = await Subject.find();

    if (subjects.length) {
        // Si des sujets existent

        // Récupère les mots-clés de la requête
        const keywords = req.body.keywords;
        const matchingSubjects = [];

        // Filtre les sujets qui correspondent aux mots-clés fournis
        subjects.map(subject => {

            // Normalise la chaîne en utilisant la forme de décomposition Unicode (NFD)
            // Supprime les caractères diacritiques (accents) de la chaîne résultante
            const title = subject.title.normalize('NFD').replace(/[\u0300-\u036f]/g, "");

            let isMatching = true;

            // Vérifie chaque mot-clé dans le titre du sujet
            keywords.map(keyword => {
                const normalizedKeyword = keyword.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
                const regex = new RegExp(`\\b${normalizedKeyword}\\b`, "i");

                // Si le mot-clé ne correspond pas, indique qu'il ne correspond pas
                if (!regex.test(title)) {
                    isMatching = false;
                    return
                }
            });

            // Ajoute le sujet correspondant aux mots-clés à l'array matchingSubjects
            isMatching && matchingSubjects.push(subject);
        })

        matchingSubjects.length ? res.json({ result: true, subjects: matchingSubjects }) : res.json({ result: false, error: "No matching subjects" })

    } else {
        res.json({ result: false, error: "No subject found" });
    }


})


module.exports = router;