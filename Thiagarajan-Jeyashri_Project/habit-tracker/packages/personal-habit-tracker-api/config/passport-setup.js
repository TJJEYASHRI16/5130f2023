const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const LocalStrategy = require('passport-local').Strategy;
const passportJWT = require("passport-jwt");
const JWTStrategy   = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
const clientID = process.env.GOOGLE_APP_CLIENT_ID;
const clientSecret = process.env.GOOGLE_APP_CLIENT_SECRET;
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
    try {
        const user = await User.findOne({ username });

        if (!user) {
            return done(null, false, { message: 'User not found.' });
        }

        user.comparePassword(password, (err, isMatch) => {
            if (err) throw err;

            // if (isMatch) {
                return done(null, user, { message: 'Logged In Successfully' });
            // } else {
            //     return done(null, false, { message: 'Incorrect email or password.' });
            // }
        });
    } catch (err) {
        return done(err);
    }
}));
passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey   : 'SECRET_SECRET'
}, (jwtPayload, done) => {
        //find the user in db if needed. This functionality may be omitted if you store everything you'll need in JWT payload.
        User.findOne({_id: jwtPayload._id})
            .then(user => {
                return done(null, user);
            })
            .catch(err => {
                return done(err);
            });
}))