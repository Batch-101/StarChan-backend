var express = require('express');
var router = express.Router();

const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const uniqid = require('uniqid');
const User = require('../models/users');


// route POST pour télécharger une image sur Cloudinary

router.post('/uploadToProfile/:email', async (req, res) => {

    // Génère un chemin unique pour sauvegarder temporairement la photo
    const photoPath = `/tmp/${uniqid()}.jpg`;

    // Déplace la photo vers le chemin spécifié
    const resultMove = await req.files.image.mv(photoPath);

    // Récupère l'adresse e-mail de l'utilisateur depuis les paramètres de la requête
    const email = req.params.email;

    // Recherche l'utilisateur dans la base de données par son adresse e-mail
    User.findOne({ email }).then(async (user) => {
        if (user) {
            // Si l'utilisateur existe

            if (!resultMove) {
                // Si le déplacement de la photo vers le chemin temporaire est réussi

                // Télécharge la photo vers Cloudinary
                const resultCloudinary = await cloudinary.uploader.upload(photoPath, { folder: 'profile' });

                // Supprime le fichier temporaire
                fs.unlinkSync(photoPath);

                // Met à jour le lien de la photo de profil dans la base de données
                User.updateOne({ email }, { link: resultCloudinary.secure_url }).then(() => {
                    res.json({ result: true, message: 'Profile picture is updated!' });
                })


            } else {
                // Si le déplacement de la photo vers le chemin temporaire échoue, renvoie une réponse JSON avec un message d'erreu
                res.json({ result: false, error: 'Upload to Cloudinary failed' });
            }
        } else {
            // Si l'utilisateur n'est pas trouvé, renvoie une réponse JSON avec un message d'erreur approprié
            res.json({ result: false, error: 'User not found' });
        }
    })


})


router.post('/uploadToGallery', async (req, res) => {
    const photoPath = `/tmp/${uniqid()}.jpg`;
    const resultMove = await req.files.image.mv(photoPath);

    if (!resultMove) {

        const resultCloudinary = await cloudinary.uploader.upload(photoPath, { folder: 'gallery' });

        fs.unlinkSync(photoPath);

        res.json({ result: true, url: resultCloudinary.secure_url, message: 'Upload to Cloudinary is a success !' });

    } else {
        res.json({ result: false, error: 'Upload to Cloudinary failed' });
    }
})


router.post('/uploadToForum', async (req, res) => {
    const photoPath = `/tmp/${uniqid()}.jpg`;
    const resultMove = await req.files.image.mv(photoPath);

    if (!resultMove) {

        const resultCloudinary = await cloudinary.uploader.upload(photoPath, { folder: 'forum' });

        fs.unlinkSync(photoPath);

        res.json({ result: true, url: resultCloudinary.secure_url, message: 'Upload to Cloudinary is a success !' });

    } else {
        res.json({ result: false, error: 'Upload to Cloudinary failed' });
    }
})


module.exports = router;
