var express = require('express');
var router = express.Router();
const Picture = require('../models/pictures');
const toFrenchDate = require('../modules/toFrenchDate');
const User = require('../models/users');



// route GET pour récupérer les photos

router.get('/', (req, res) => {
    Picture.find()
        .populate('user')
        .then(picturesData => {
            picturesData.length ? res.json({ result: true, pictures: picturesData }) : res.json({ result: false, pictures: [], error: "No picture found" })
        })
});


router.get('/:pictureId', (req, res) => {
    Picture.findOne({ _id: req.params.pictureId })
        .populate('user')
        .then(pictureData => {
            pictureData.link ? res.json({ result: true, picture: pictureData }) : res.json({ result: false, picture: {}, error: "No picture found" })
        })
});

// route POST pour créer un nouveau document picture qui s'enregistrera dans la base de données

router.post('/newPicture', (req, res) => {
    const user = req.body.user;
    const title = req.body.title;
    const description = req.body.description;
    const link = req.body.link;
    const place = req.body.place;
    const newPicture = new Picture({
        user,
        title,
        description,
        link,
        place,
        date: toFrenchDate(new Date())
    })

    newPicture.save().then(pictureData => {
        pictureData ? res.json({ result: true }) : res.json({ result: false })
    })

})

//  Route GET pour récupérer les photos favorites d'un utilisateur spécifié par son adresse e-mail.

router.get('/favorites/:email', async (req, res) => {
    const email = req.params.email;
    const user = await User.findOne({ email });

    const favoritePictures = [];
    for (const id of user.favoritePictures) {
        const picture = await Picture.findOne({ _id: id }).populate('user');
        favoritePictures.push(picture);
    }

    favoritePictures.length == user.favoritePictures.length && res.json({ result: true, favorites: favoritePictures })
})

module.exports = router;
