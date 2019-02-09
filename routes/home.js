const passport = require('passport');
require('../passport')(passport);
require('../routeAuth');
module.exports = (router,sql,md5,moment,jwt)=>{

    router.post('/login',(req,res,next)=>{
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
                res.json({'status': false, 'msg': "User not found.", route:"login"})
            }
        }).catch(error=>{
            res.json({'status': false, 'msg': "Server timed out. Try again later.", route:"login"});
        });
    });

    router.post('/checkapi',passport.authenticate('login',{session: true}),(req,res,next)=> {
        res.json({status : "USer_Authenticated"});
    });

    router.get('/dashboard',(req,res,next)=> {
        const sqlQ = `select username,project_title,date_starts,category from ilance_users u, ilance_projects p, ilance_category c where p.user_id = u.user_id and c.cid = p.cid`;
        sql.execute([sqlQ]).then(data=>{
            res.json({status : true, route:"dashboard", data:data[0]});
        }).catch(error=>{
            console.log(error);
            res.json({'status': false, 'msg': "Server timed out. Try again later.", route:"login"});
        })
    });

    return router;
};