const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20');
const LocalStrategy = require('passport-local').Strategy;
const passportJWT = require("passport-jwt");
const JWTStrategy   = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
const clientID = '998458657011-des9fr05brk7a9t7ivg9ob1iu7kn269t.apps.googleusercontent.com';
const clientSecret = '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';
const User = require('../models/User');

passport.serializeUser((user, done) => {
    done(null, user.id);
})

passport.deserializeUser((id, done) => {
    User.findById(id)
      .then(user => {
        done(null, user);
      });   
})

passport.use(
    new GoogleStrategy({
    // options for the strategy
    callbackURL: 'http://localhost:3001/auth/google/redirect',
    clientID,
    clientSecret
}, (accessToken, refreshToken, profile, done) => {
    // passport callback function..
    console.log('inside cal back paassport')
    console.log(profile)
    // Add a new user
    User.findOne({userID: profile.id})
      .then(user => {
        if(user) {
            // Log that user in...
            console.log(`User is ${user}`)
            done(null, user);
        } else {
            new User({
                userID: profile.id,
                username: profile.displayName
            })
            .save()
            .then(newUser => {
                console.log(`New user created: ${newUser}`)
                done(null, newUser);
            })
            .catch(err => done(err));
        }
      })
    
})
);

passport.use(new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password'
}, async (username, password, done) => {
    console.log('Inside Local strategy callback');
    console.log('Username:', username);
    User.findOne({username})
        .then(user => {
            if(!user){
                return done(null, false, {message: 'User not found.'});
            }

            User.comparePassword(password, user.password)
                .then(isMatch => {
                    if (isMatch) {
                        console.log(isMatch)
                        return done(null, user, {message: 'Logged In Successfully'});
                    } else {
                        return done(null, false, {message: 'Incorrect email or password.'});
                    }
                });
        })
        .catch(err => {
            console.log('here')
            done(err)
        });
}));

passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey   : 'SECRET_SECRET'
}, (jwtPayload, done) => {
    console.log('Inside JWT strategy callback');
    console.log('JWT Payload:', jwtPayload);
        //find the user in db if needed. This functionality may be omitted if you store everything you'll need in JWT payload.
        User.findOne({_id: jwtPayload._id})
            .then(user => {
                return done(null, user);
            })
            .catch(err => {
                return done(err);
            });
}))