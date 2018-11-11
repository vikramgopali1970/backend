const yelp = require('yelp-fusion');
const key = `MiXOeAkEeYjZ_hKS81cuSvS4p57Rs1Q-FWXUdjDTi4qJNsdZLLWIgdKT1CKtNoDZOK9b6IIcJuS8FXvmusjtrwCS2W97TGzDQLHkIu9CZm2m0tQw2TcyRaFoYcvnW3Yx`;
const client = yelp.client(key);

const scrape = require('html-metadata');
const request = require('request');
const Sentiment = require('sentiment');
const sentiment = new Sentiment();




module.exports = (router)=>{

router.post("/verifyBusiness",(req,res,next)=>{
    let data = req.body;
    if(Object.keys(req.body).length ==0){
        res.json([]);
    }
    console.log(data.bCity+","+data.bState);
    client.search({
        term:data.bName,
        location:data.bCity+","+data.bState
    }).then(success=>{
        let result = success.jsonBody.businesses;
        console.log("check thios",result[0]);
        let addressMatch = result.filter(id=>{
            let display_address = id.location.address1.split(" ");
            let givenAdrres = data.bAddress.split(" ");
            if(givenAdrres[0] == display_address[0] ){
                return id;
            }
        });
        let matchNumber = addressMatch.filter(id=>{
            if(id.phone === data.bPhoneNumber){
                return id;
            }
        });
        console.log(matchNumber[0]);
        if(matchNumber.length > 0){
            console.log(matchNumber[0].url)
            let options =  {
                url: matchNumber[0].url,
                jar: request.jar(), // Cookie jar
                headers: {
                    'User-Agent': 'webscraper'
                }
            };

            scrape(options, function(error, metadata){
                console.log("adasdadasdas",metadata);
                console.log("hurrey");
                let id = 3;
                metadata.jsonLd.map((ele,ind)=>{
                   if("aggregateRating" in ele){
                       id = ind;
                   }
                });

                console.log("check id",id);
                let reviews = metadata.jsonLd[id];
                let avgRate = 5-metadata.jsonLd[id].aggregateRating.ratingValue;
                console.log("hererere",metadata.jsonLd[id].aggregateRating.ratingValue);
                let reviewsStrings = reviews.review.map(obj=>{
                    return obj.description;
                });
                let count=0;
                let dataGraph = [];
                for(let i=0;i<reviewsStrings.length;i++) {
                    dataGraph.push(sentiment.analyze(reviewsStrings[i]).score);
                    if(sentiment.analyze(reviewsStrings[i]).comparative < 0){
                        count++
                    }
                }
                console.log((avgRate/5));
                avgRate = (avgRate/5)*60 + (count/reviewsStrings.length)*40
                res.json([avgRate,dataGraph]);
            });
        }else{
            res.json([]);
        }
    }).catch(error=>{
        console.log(error);
    })
});


router.post('/getReviews',(req,res,next)=>{
    let data = req.body;
    console.log("here",data.bName+"-"+data.bAddress.split(",")[0]);
    client.reviews(data.bName+"-"+data.bAddress.split(",")[0]).then(response => {
        res.json(response.jsonBody.reviews);
    }).catch(e => {
        console.log(e);
    });
});

router.post('/verifyPhone',(req,res,next)=>{
    let data = req.body;
    client.phoneSearch({
        phone:data.bPhoneNumber
    }).then(response => {
        console.log(response.jsonBody.businesses[0].name);
    }).catch(e => {
        console.log(e);
    });
});





    return router;
};