var mongoose = require('mongoose');
var express = require('express');
var router = express.Router();

var Post = mongoose.model('Post');
var Comment = mongoose.model('Comment');


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// Get all posts from the db
router.get('/posts', function(req, res, next) {
  Post.find(function(err, posts){
    if(err){ return next(err); }

    res.json(posts);
  });
});
// Post data to the db.
router.post('/posts', function(req, res, next) {
  var post = new Post(req.body);

  post.save(function(err, post){
    if(err){ return next(err); }

    res.json(post);
  });
});
// Preloading posts.
router.param('post', function(req, res, next, id){
  var query = Post.findById(id);

  query.exec(function (err, post){
    if (err) { return next(err); }
    if (!post) { return next(new Error('Can\'t find post')); }

    req.post = post;
    return next();
  });
});
// Proloading comments.
router.param('comment', function(req, res, next, id){
  var query = Comment.findById(id);

  query.exec(function (err, comment){
    if(err) { return next(err); }
    if(!comment) {return next(new Error('Cannot find any comment')); }

    req.comment = comment;
    return next();
  })
})
// Get a single post.
router.get('/posts/:post', function(req, res){
  req.post.populate('comments', function(err, post) {
    if (err) { return next(err); }
    res.json(post);
  });
});
// Make an upvote save to db.
router.put('/posts/:post/upvote', function(req, res, next){
  req.post.upvote(function(err, post){
    if (err) { return next(err); }

    res.json(post);
  });
});
// Comments
router.post('/posts/:post/comments', function(req, res, next){
  var comment = new Comment(req.body);
  comment.post = req.post;

  comment.save(function(err, comment){
    if(err){ return next(err); }

    req.post.comments.push(comment);
    req.post.save(function(err, post) {
      if(err) { return next(err); }
      res.json(comment);
    });
  });
});

router.put('/posts/:post/comments/:comment/upvote', function(req, res, next) {
  req.comment.upvote(function(err, comment){
    if (err) { return next(err); }

    res.json(comment);
  });
});

module.exports = router;
