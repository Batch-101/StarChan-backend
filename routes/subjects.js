var express = require('express');
var router = express.Router();
const Subject = require('../models/subjects');
const Category = require('../models/categories');
const User = require('../models/users');
const toFrenchDate = require('../modules/toFrenchDate');

// Creation route Post pour créer un sujet


router.post('/newSubjects', async (req, res) => {

    const title = req.body.subjectTitle;
    const message = req.body.message;

    const subjectTitle = await Subject.findOne({ title: { $regex: new RegExp(`\\b${req.body.subjectTitle}\\b`, 'i') } })
    if (subjectTitle === null) {
        const category = await Category.findOne({ title: { $regex: new RegExp(`\\b${req.body.categoryName}\\b`, 'i') } })
        if (category) {

            const user = await User.findOne({ email: req.body.email })
            if (user) {

                if (user.token === req.body.token) {

                    const newSubject = new Subject({
                        category: category._id,
                        user: user._id,
                        title,
                        message,
                        date: toFrenchDate(new Date()),
                        link: req.body.link
                    })

                    const result = await newSubject.save();

                    if (result) {
                        const updatedCategory = await Category.updateOne(category, { $push: { subjects: result._id } });
                        updatedCategory && res.json({ result: true, message: "Subject created successfully" })
                    } else {
                        res.json({ result: false, error: "Couldn't save the subject" })
                    }


                } else {
                    res.json({ result: false, error: 'Invalid token' })
                    // Le token envoyé par l'utilisateur n'est pas/plus valide
                }
            } else {
                // L'utilisateur recherché n'a pas été trouvé
                res.json({ result: false, error: 'User not found' });
            }

        } else {
            // La catégorie recherchée n'existe pas
            res.json({ result: false, error: 'Category not found' });
        }
    } else {
        // Le sujet existe déjà
        res.json({ result: false, error: 'Subject already exists' }); // false si le sujet existe
    }
});


// Creation route POST pour répondre au sujet 

router.post('/newAnswer', async (req, res) => {

    const message = req.body.message
    const subjectID = req.body.subjectID;
    const user = await User.findOne({ email: req.body.email })
    if (user) {
        const userId = user._id
        const newAnswer = {
            subject: subjectID,
            user: userId,
            message: message,
            date: toFrenchDate(new Date()),
            link: req.body.link
        }

        const updatedAnswer = await Subject.updateOne({ _id: subjectID }, { $push: { answers: newAnswer } });
        updatedAnswer ? res.json({ result: true, message: "Answer posted" }) : res.json({ result: false, error: "Answer not posted", updatedAnswer })
    } else {
        res.json({ result: false, error: "User not found" })
    }


})


// Creation route GET pour récupérer tous les sujets

router.get('/', (req, res) => {
    Subject.find().populate('user').populate('answers.user').then(subjects => {
        res.json({ subjects: subjects });
    });
});

// Creation route GET pour récupérer un sujets sans tenir compte de la casse

router.get('/oneSubject', (req, res) => {
    Subject.findOne({ title: { $regex: new RegExp(`\\b${req.body.title}\\b`, 'i') } }).populate('user').populate('answers.user').then(subject => {
        res.json({ subject })
    })
})

// Creation route GET pour récupérer sujet en fonction de son ID

router.get('/:id', (req, res) => {
    Subject.findOne({ _id: req.params.id }).populate('user').populate('answers.user').then(subject => {
        res.json({ subject })
    })
})

// Creation route GET pour récupérer les sujets liés à la catégorie

router.get('/:categoryId', (req, res) => {
    const categoryId = req.params.categoryId;
    Subject.find({ category: categoryId }).then(subjects => {
        res.json({ subjects });
    });
});

// Creation route DELETE pour supprimer un sujet

router.delete("/deleteSubjectById", async (req, res) => {

    const categoryID = req.body.categoryID;
    const subjectID = req.body.subjectID;

    const category = await Category.findOne({ _id: categoryID });
    const updatedSubjects = category.subjects.filter(subject => subject._id != subjectID);

    await Category.updateOne(category, { subjects: updatedSubjects });

    const deletedSubject = await Subject.deleteOne({ _id: subjectID });

    deletedSubject.deletedCount > 0 ? res.json({ result: true }) : res.json({ result: false });

})

router.delete("/deleteAnswerFromSubjectById", async (req, res) => {

    // Récupère les identifiants du sujet et de la réponse à supprimer
    const subjectID = req.body.subjectID;
    const answerID = req.body.answerID;

    // Recherche le sujet dans la base de données par son id
    const subject = await Subject.findOne({ _id: subjectID });

    // Filtre les réponses pour exclure celle spécifiée par l'identifiant
    const updatedAnswers = subject.answers.filter(answer => answer._id != answerID);

    // Met à jour le sujet avec les réponses filtrées
    await Subject.updateOne(subject, { answers: updatedAnswers });

    res.json({ result: true })

})


router.delete("/deleteSubjectsFromCategory", async (req, res) => {

    const categoryID = req.body.id;

    // Recherche la catégorie dans la base de données par son identifiant
    const category = await Category.findOne({ _id: categoryID });

    // Récupère les identifiants des sujets associés à cette catégorie
    const subjectsIDs = category.subjects;

    // Initialise un compteur pour suivre le nombre de sujets supprimés
    let counter = 0;

    // Supprime chaque sujet par son identifiant et met à jour le compteur
    for (const subjID of subjectsIDs) {
        await Subject.deleteOne({ _id: subjID });
        counter++;
    }

    // Vérifie si tous les sujets ont été supprimés avec succès
    if (counter === subjectsIDs.length) {
        // Si tous les sujets sont supprimés, supprime la catégorie elle-même

        await Category.deleteOne({ _id: categoryID });
        res.json({ result: true, message: "The category and its subjects were removed successfully" })
    }


})
module.exports = router;