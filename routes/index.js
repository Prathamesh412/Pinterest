var express = require('express');
const User = require('./users');
const passport = require('passport');
var router = express.Router();
const localStrategy = require('passport-local');
const upload = require('./multer');
const Post = require('./post');
const LoggerService = require('../services/logger.service');

const indexLogger = new LoggerService("index")

passport.use(new localStrategy(User.authenticate()))

// Check Authentication
checkAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) { return next() }
  res.redirect("/login")
}

/////////////////////** Routes Below */

router.get('/login', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/register', function(req, res, next) {
  res.render('register');
});

router.get('/profile',checkAuthenticated,async function(req, res, next) {
 const username = req.session.passport.user
 const loggedUser = await User.findOne({username}).populate("posts");

 indexLogger.info("return profile", loggedUser)
  res.render('profile',{loggedUser});
});

router.get('/add', checkAuthenticated,async function(req, res, next) {
  const username = req.session.passport.user
  const loggedUser = await User.findOne({username});
   res.render('add',{loggedUser});
});

router.get('/show/posts', checkAuthenticated,async function(req, res, next) {
  const user = await User
  .findOne({username: req.session.passport.user}).populate("posts")
  console.log(user.posts)

  res.render('show', { user});
});

router.get('/feed', checkAuthenticated,async function(req, res, next) {
  const user = await User.findOne({username: req.session.passport.user})
 
 const posts = await Post.find(); // No need to populate "posts" here
 res.render('feed', { user, posts});
});

router.post("/createpost",checkAuthenticated, upload.single("postimage"),async (req,res,next)=>{

  try {
    const user = await User.findOne({ username: req.session.passport.user });

    // Create the post and wait for it to be created
    const post = await Post.create({
      user: user._id,
      title: req.body.title,
      description: req.body.description,
      image: req.file.filename
    });

    // Update the user's posts array
    user.posts.push(post._id);

    // Save the user with the updated posts array
    await user.save();

    res.redirect("/profile");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
})

router.post("/login",passport.authenticate("local",{
  failureRedirect:"/register",
  successRedirect:"/profile"
}),(req,res,next)=>{
})

router.post("/fileupload",checkAuthenticated,upload.single("image"), async function(req,res,next){
  const username = req.session.passport.user
  const newUser = await User.findOne({username});
  console.log(newUser)
  newUser.profileImage = req.file.filename;
  await newUser.save()
  res.redirect("/profile")

})


router.post('/register', function(req, res, next) {

  const {username,password,email,phone_number} = req.body

  const data = new User({
    username: username,
    email,
    phoneNo: phone_number
  })

  User.register(data, password).then(function(){
    passport.authenticate("local")(req,res,function(){
      res.redirect("/profile")
    })
  })
});


router.delete('/logout',(req,res) => {
  req.logOut()
  res.redirect("/login")
})

router.get("/", (req,res)=>{
  res.redirect("/login")
})

router.get('*', (req, res) => {
  res.redirect('/profile')
})

module.exports = router;
