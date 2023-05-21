const express = require("express");
const bodyparser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require("mongoose");
var path = require('path');


const app = express();
app.use(bodyparser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));



const Now = new Date();
const Times = Now.toLocaleString();
const dateArray = Times.split("/");
const Time = dateArray.join("-");

mongoose.connect("mongodb://127.0.0.1:27017/Blog_app", {
    useNewUrlParser: true
});

var dbcourse = [];

var conn = mongoose.connection;

const postSchema = {
    Title: String,
    Category: String,
    Body: String
}

const commentSchema = {
    CTitle: String,
    Comment: String,
    postId: mongoose.Types.ObjectId
}

const Post = mongoose.model("Post", postSchema);

const Comment = mongoose.model("Comment", commentSchema);


conn.on('connected', function () {
    console.log('database is connected successfully');
});

app.set('view engine', 'ejs');

app.get("/", (req, res) => {

    Post.find({}, (err, Posts) => {
        res.render("index", { Posts: Posts, Time: Time });
    })

})

app.get("/addpost", (req, res) => {
    res.render("addpost", { Add: "ADD POST" });
})

app.post("/addpost", (req, res) => {

    const post = new Post({
        Title: _.capitalize(req.body.Title),
        Category: _.capitalize(req.body.Category),
        Body: _.capitalize(req.body.Body)
    });

    post.save(err => {
        if (!err) {
            res.redirect("/");
        }
    })
})


app.get("/posts/:postId", async (req, res) => {

    const requestedId = req.params.postId;

    console.log("S:" + requestedId);

    Post.findOne({ _id: requestedId }, (err, post) => {
        Comment.find({ postId: req.params.postId }, (err, comment) => {
            res.render('about', {
                Title: post.Title,
                Category: post.Category,
                Body: post.Body,
                Time: Time,
                Commenthead: "ADD COMMENT",
                comments: comment,
                post: post
            });
        });
    });
})



app.post('/posts/:postId', (req, res) => {
    // Create a new comment document
    const comment = new Comment({
        CTitle: _.capitalize(req.body.commenttitle),
        Comment: _.capitalize(req.body.commentcontent),
        postId: req.params.postId
    });

    comment.save(err => {
        if (!err) {
            res.redirect("/");
        }
    })
});


app.get('/posts/delete/:postId', (req, res) => {
    Post.findByIdAndDelete({ _id: req.params.postId }, (err) => {
        if (err) {
            res.send("sorry")
        } else {
            res.redirect("/");
        }
    })
})


app.get('/posts/edit/:postId', async (req, res) => {
    const post_data = await Post.findById({ _id: req.params.postId })
    res.render('edit', { post: post_data })
})

app.post('/posts/edit/:postId', async (req, res) => {
    Post.findOneAndUpdate({ _id: req.params.postId }, req.body, { new: true }, (err, post) => {
        if (err) {
            console.log('cant update');
        } else {
            res.redirect("/");
        }
    })
})

app.get("/contact", (req, res) => {
    res.render('contact', {
        contact: "Contact Form"
    })
})

app.listen(3001, () => {
    console.log("running");
})