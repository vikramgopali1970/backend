const JwtStrategy   = require('passport-local').Strategy;
ExtractJwt = require('passport-jwt').ExtractJwt;
const sql = require('./database/sqlwrapper');

const md5 = require('md5');

module.exports = function(passport){
    passport.use('login', new JwtStrategy({
            passReqToCallback : true,
        },
        function(req, username, password, done) {
            sql.execute([`select * from ilance_users where username="${username}"`]).then(data=>{
                if(data[0].length > 0){
                    if(md5(md5(data[0][0].password)+data[0][0].salt) === password){
                        done(null,data[0][0]);
                    }else{
                        done(null,false);
                    }
                }else{
                    done(null,false);
                }
            }).catch(error=>{
                console.log(error);
                done(null,false);
            })
        })
    );
};