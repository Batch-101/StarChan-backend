var express = require('express');
var router = express.Router();
const fetch = require('node-fetch');

const newsKey = process.env.NEWS_API_KEY;

router.get('/', (req, res) => {

    fetch(`https://newsapi.org/v2/everything?q=space&language=fr&apiKey=${newsKey}`)
        .then(response => response.json())
        .then(data => {
            if (data.status === 'ok') {
                res.json({ articles: data.articles });
            } else {
                res.json({ result: false, articles: [] });
            }
        })
});


module.exports = router;
