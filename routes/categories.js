var express = require('express');
const Category = require('../models/categories');
const Subject = require('../models/subjects');
var router = express.Router();


//  route Post pour créer une catégorie

router.post('/newCategories', (req, res) => {
    Category.findOne({ title: { $regex: new RegExp(`\\b${req.body.title}\\b`, 'i') } }).then(data => {
        if (data === null) {
            const newCategory = new Category({
                subjects: [],
                title: req.body.title,
            });

            newCategory.save().then(newDoc => {
                res.json({ result: true });
            });
        } else {
            // Categorie déja existante
            res.json({ result: false, error: 'Categorie already exists' });
        }
    });
});



//route GET pour récupérer toutes les catégories

router.get('/', (req, res) => {
    Category.find().then(text => {
        res.json({ categories: text });
    });
});



// route GET pour récupérer une catégorie selon son id


router.get("/:id", (req, res) => {
    const categoryID = req.params.id;

    Category.findOne({ _id: categoryID }).then(category => {
        if (category.title) {
            res.json({ result: true, categorie: category });
        } else {
            res.json({ result: false, error: "Category not found" });
        }
    });
});


// route DELETE pour supprimer une catégorie

router.delete("/", async (req, res) => {

    const categoryID = req.body.id;

    Category.findOne({ _id: categoryID }).then(async (category) => {
        const deleteSubject = async () => {
            for (const subjectID of category.subjects) {
                Subject.deleteOne({ _id: subjectID })
            }
        }

        await deleteSubject();


        Category.deleteOne({
            title: category.title,
        }).then(deletedCategory => {
            if (deletedCategory.deletedCount > 0) {
                res.json({ result: true, message: "Category is deleted" });

            } else {
                res.json({ result: false, error: "Category couldn't be deleted" });
            }

        });

    })


});







module.exports = router;