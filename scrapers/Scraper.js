let cheerio = require('cheerio')
let axios = require('axios')

let scrapeHomePage = async (req, res) => {
    const { page } = req.params

    let scraper = async (page) => {
        let manwha = []
        try {
            let res = await axios.get(`https://toonily.com/page/${page}/`)
            let $ = cheerio.load(res.data)

            let manwhas = $('.row-eq-height .page-item-detail')

            manwhas.each((index, element) => {

                let title = $(element).find('.item-summary .font-title h3 a').text()

                let image = $(element).find('.item-thumb a img').attr('data-src')

                let id = $(element).find('.item-summary .post-title h3 a').attr('href').split('/')[4]

                let obj = { index, title, image, id }

                manwha = [...manwha, obj]

            })

            return manwha

        } catch (error) {
            console.error(error.message)
        }
    }

    try {
        console.log('<--- GET [/ManwhaList/] Request SUCCESS')

        let start = Date.now()
        let manwha = await scraper(page)
        if (!manwha) return res.status(400).json({ success: false, message: 'Error with fetching Home Page' })
        let end = Date.now()

        res.status(200).json({ success: true, data: manwha })

        console.log(`--> GET [/ManwhaList/] Response SUCCESS ${start - end}ms`)
    } catch (error) {
        console.error(error.message)
        res.status(500).json({ success: false, message: 'server error' })
    }


}

let scrapeManwhaInfo = async (req, res) => {
    let { manwhaId } = req.params

    let scraper = async (manwhaId) => {
        try {
            let res = await axios.get(`https://toonily.com/webtoon/${manwhaId}/`)
            let $ = cheerio.load(res.data)

            let siteContent = $('.site-content div') // ROOT

            let title = $(siteContent).find('.post-title h1').contents().not('span').text().trim();
            let image = $(siteContent).find('.summary_image a img').attr('data-src');

            let info = [];
            $(siteContent).find('.manga-info-row').each((index, element) => {
                let headings = $(element).find('.summary-heading h5');
                let contents = $(element).find('.summary-content');

                let mangaInfo = {};

                headings.each((index, heading) => {
                    let headingText = $(heading).text().split('(')[0].trim(); // Get heading text
                    let contentText = $(contents[index]).text().trim(); // Get corresponding content

                    // If the heading is "Genre," convert the value into an array
                    if (headingText === 'Genre') {
                        mangaInfo[headingText] = contentText.split(',').map(genre => genre.trim());
                    } else {
                        mangaInfo[headingText] = contentText;
                    }
                });

                info.push(mangaInfo);
            });

            let summary = $(siteContent).find('.summary__content p').text() // get the summary
            let chaptersLength = $(siteContent).find('.listing-chapters_wrap ul li').length; // numbers of chapters available

            let chapters = []
            $(siteContent).find('.listing-chapters_wrap ul li').each((index, element) => {
                let chapterName = $(element).find('a').text().trim();
                let releaseDate = $(element).find('.chapter-release-date i').text().trim(); //

                chapters.push({
                    name: chapterName,
                    releaseDate: releaseDate,
                    chapterId: chapterName.split(" ").join('-')
                });
            })

            let manwha = {
                title: title,
                image: image,
                info: info,
                summary: summary,
                chaptersCount: chaptersLength,
                chapters: chapters
            }

            return manwha

        } catch (error) {
            console.error(error.message)
        }


    }

    try {
        console.log('<--- GET [/ManwhaInfo/] Request SUCCESS')

        let start = Date.now()
        let manwha = await scraper(manwhaId)
        if (!manwha) return res.status(400).json({ success: false, message: 'Manwha not found.' })
        let end = Date.now()

        res.status(200).json({ success: true, data: manwha })
        console.log(`--> GET [/ManwhaInfo/] Response SUCCESS ${start - end}ms`)
    } catch (error) {
        console.error(error.message)
        res.status(500).json({ success: false, message: 'server error' })
    }

}

let scrapeManwhaImages = async (req, res) => {
    let { manwhaId, chapter } = req.params

    let scraper = async (manwhaId, chapter) => {
        try {
            // Use Axios to fetch the chapter page
            let response = await axios.get(`https://toonily.com/webtoon/${manwhaId}/${chapter}/`, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            })
            let $ = cheerio.load(response.data)

            let title = $('.container div div h1').text()

            let images = [] // The Link of images
            $('.reading-content img').each((index, element) => {
                let imgSrc = $(element).attr('data-src').trim()

                images.push({ [`${index}`]: imgSrc })
            })

            let manwha = {
                title: title,
                images: images
            }

            return manwha

        } catch (error) {
            console.error(error.message)
            throw error
        }
    }

    try {
        console.log('<--- GET [/ManwhaImages/] Request SUCCESS')

        let start = Date.now()
        let manwha = await scraper(manwhaId, chapter)
        if (!manwha || manwha.length === 0) return res.status(404).json({ success: false, message: 'No images found.' })

        let end = Date.now()

        res.status(200).json({ success: true, data: manwha })
        console.log(`--> GET [/ManwhaImages/] Response SUCCESS ${end - start}ms`)
    } catch (error) {
        console.error(error.message)
        res.status(500).json({ success: false, message: 'Server error' })
    }
}


module.exports = {
    scrapeHomePage,
    scrapeManwhaInfo,
    scrapeManwhaImages
}
