let express = require('express')
let router = express.Router()
let controller = require('../scrapers/Scraper.js')


router.get('/manwhaList/:page', controller.scrapeHomePage)
router.get('/manwha/:manwhaId', controller.scrapeManwhaInfo)
router.get('/manwha/:manwhaId/:chapter', controller.scrapeManwhaImages)


module.exports = router
