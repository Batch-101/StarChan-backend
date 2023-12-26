var express = require('express');
var router = express.Router();

const User = require('../models/users');
const { checkBody } = require('../modules/checkBody');
const uid2 = require('uid2');
const bcrypt = require('bcrypt');
const toFrenchDate = require('../modules/toFrenchDate');


const defaultAvatar = "https://res.cloudinary.com/deu4t97ll/image/upload/v1702547761/profile/eqkmw4ax00s1blduv8pr.jpg";

router.get('/', (req, res) => {
    User.find({}).populate('favoritePictures').then(data => {
        data.length ? res.json({ result: true, users: data }) : res.json({ result: false, error: 'No user found' })
    })
})

router.get('/:userId', (req, res) => {
    const userId = req.params.userId;

    User.findOne({ _id: userId }).populate('favoritePictures').then(user => {
        user ? res.json({ result: true, user }) : res.json({ result: false, error: 'No user found' })
    })
})

router.post('/getUser', (req, res) => {
    const email = req.body.email;
    User.findOne({ email }).populate('favoritePictures').then(user => {
        user ? res.json({ result: true, user }) : res.json({ result: false, error: 'User not connected' })
    })
})

// Cette route sert à aller chercher l'id de l'utilisateur qui est connecté 
router.post('/getUserId', (req, res) => {
    const email = req.body.email;
    User.findOne({ email }).populate('favoritePictures').then(user => {
        user.length ? res.json({ result: true, id: user._id }) : res.json({ result: false, error: 'No user found' })
    })
})

// Route s'enregistrer
router.post('/signup', (req, res) => {
    if (!checkBody(req.body, ['username', 'email', 'password'])) {
        res.json({ result: false, error: 'Missing or empty fields' });
        return;
    }

    const username = req.body.username;
    const email = req.body.email;

    User.findOne({ username }).then(data => {
        if (data === null) {
            const hash = bcrypt.hashSync(req.body.password, 10);

            const newUser = new User({
                username,
                email,
                password: hash,
                token: uid2(32),
                date: toFrenchDate(new Date()),
                isAdmin: false,
                link: defaultAvatar,
                favoritesPictures: []
            });

            newUser.save().then(newDoc => {
                res.json({ result: true, token: newDoc.token });
            });
        } else {
            res.json({ result: false, error: 'User already exists' });
        }
    });
});

// Route se connecter
router.post('/signin', (req, res) => {
    if (!checkBody(req.body, ['email', 'password'])) {
        res.json({ result: false, error: 'Missing or empty fields' });
        return;
    }

    User.findOne({ email: req.body.email }).then(data => {
        if (data && bcrypt.compareSync(req.body.password, data.password)) {
            res.json({ result: true, token: data.token });
        } else {
            res.json({ result: false, error: "User not found" });
        }
    });
});



// MISE A JOUR DU PROFIL :

// 1/4-route POST pour mettre à jour le nom de l'utilisateur

router.post('/updateUsername', async (req, res) => {
    const updatedUsername = req.body.updatedUsername;
    const currentUsername = req.body.currentUsername;
    const regUsername = new RegExp(`\\b${currentUsername}\\b`, 'i');
    const currentEmail = req.body.currentEmail;

    if (regUsername.test(updatedUsername)) {
        await User.updateOne({ email: currentEmail }, { username: updatedUsername });

        res.json({ result: true });
    } else {
        const userData = await User.find({ username: { $regex: new RegExp(`\\b${updatedUsername}\\b`, 'i') } })

        if (!userData.length) {
            await User.updateOne({ email: currentEmail }, { username: updatedUsername });
            res.json({ result: true });
        } else {
            res.json({ result: false, error: "username already exist" });
        }

    }
});

// 2/4-route POST pour mettre à jour l'email de l'utilisateur

router.post('/updateEmail', async (req, res) => {
    const updatedEmail = req.body.updatedEmail;
    const currentEmail = req.body.currentEmail;
    const regEmail = new RegExp(`\\b${currentEmail}\\b`, 'i');

    if (regEmail.test(updatedEmail)) {
        const email = await User.updateOne({ email: currentEmail }, { email: updatedEmail });
        res.json({ result: true, email })

    } else {
        const userData = await User.find({ email: { $regex: new RegExp(`\\b${updatedEmail}\\b`, 'i') } });
        if (!userData.length) {
            await User.updateOne({ email: currentEmail }, { email: updatedEmail });
            res.json({ result: true })

        } else {
            res.json({ result: false, error: "email already exist" })
        }

    }
});

// 3/4-route POST pour mettre à jour du mot de passe de l'utilisateur

router.post('/updatePassword', async (req, res) => {
    const updatedPassword = req.body.updatedPassword;
    const updatedHash = bcrypt.hashSync(updatedPassword, 10);
    const currentEmail = req.body.currentEmail;

    const data = await User.updateOne({ email: currentEmail }, { password: updatedHash });
    res.json({ result: true, data })
});

// 4/4-route POST pour mettre à jour la liste des photos favorites de l'utilisateur

router.post('/updateFavoritePictures', async (req, res) => {
    const email = req.body.email;
    const pictureID = req.body.pictureID;

    // Recherche l'utilisateur dans la base de données par son adresse e-mail et peuple la liste des photos favorite
    const user = await User.findOne({ email }).populate('favoritePictures');

    // Vérifie si la photo spécifiée est déjà incluse dans les favoris de l'utilisateur
    const isPictureIncluded = user.favoritePictures.some(picture => picture._id == pictureID);

    if (isPictureIncluded) {

        // Si l'identifiant de la photo existe, la retire de la liste des favoris
        const favoritePictures = user.favoritePictures.filter(picture => picture._id != pictureID);
        await User.updateOne(user, { favoritePictures });
        res.json({ result: true });

    } else {

        // Sinon, ajoute la photo à la liste des favoris
        await User.updateOne(user, { $push: { favoritePictures: pictureID } });

        res.json({ result: true });
    }


});





module.exports = router;
