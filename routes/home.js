var passport = require('passport');
require('../passport')(passport);
module.exports = (router,sql,md5,moment,jwt)=>{

    router.post('/login',passport.authenticate('login',{session: true}),(req,res,next)=>{
        let data = req.body;
        const uname = data.username;
        const pass = data.password;
        const loginQuery = `select * from ilance_users where username = "${uname}"`;
        sql.execute([loginQuery]).then(data=>{
            let userData = Object.assign({},data[0][0]);
            let hash = md5(md5(pass)+userData.salt);
            if(userData.password === hash){
                delete userData["password"];
                delete userData["salt"];
                delete userData["secretquestion"];
                delete userData["secretanswer"];
                userData["expire"] = moment().add(180, 'm').valueOf();
                const token = jwt.encode(userData,"secret");
                res.send({'status': true, 'user': userData, 'token': 'JWT ' + token, route:"dashboard"});
            }else{
                res.json("No Match");
            }
        }).catch(error=>{
            console.log(error);
        });
    });

    router.post('/checkapi',passport.authenticate('login',{session: true}),(req,res,next)=> {
        res.json({status : "USer_Authenticated"});
    });

    router.get('/dashboard',passport.authenticate('login',{session: true}),(req,res,next)=> {
        res.json({status : "USer_Authenticated"});
    });

    return router;
};