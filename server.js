var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var exphbs = require("express-handlebars");

// const assert = require("assert");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = 3000;

// Initialize Express
var app = express();

// Set Handlebars.
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// Connect to the Mongo DB
// mongoose.connect("mongodb://localhost/news-worthy", { useNewUrlParser: true });
// Connect to MongoDB (Heroku)
// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/news-worthy";

mongoose.connect(MONGODB_URI);

// Routes

// A GET route for scraping the dailyrepublic website
app.get("/", function(req, res) {
  // First, we grab the body of the html with axios
  axios.get("https://www.dailyrepublic.com/all-dr-news/solano-news/").then(function(response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);
    var result = [];
    $("article.post").each(function(i, element) {

      var title = $(element).find("a").first().text();
      var summary = $(element).find("div.entry-summary p").text();
      var link = $(element).find("a").attr("href");
      var date = $(element).find("footer span.entry-utility-prep").first().text();

      result.push({
        title: title,
        summary: summary,
        link: link,
        date: date
      });
    });

result.forEach(resArticle => {
  db.Article.find({ title: resArticle.title}, function (err, article) {
    if(article.length === 0) {
      // no articles found
      // console.log("no articles found save it to the database");
            db.Article.create(resArticle)
      .catch(function(err) {
        // If an error occurred, log it
        console.log(err);
      });
    } else {
      // console.log('article found , dont save to database');
    }
  });
}); // loop over each element in result
    }); // end of axios call
    //render at the end
    db.Article.find({}, function(err, dbArticles) {
      const dbObj = {
        dbArticle: dbArticles
      }
      res.render("index", dbObj);
    })
  }); //end of app.get

// Route for grabbing a specific Note by id to display on the DOM.
app.get("/notes/:id", function(req, res) {
  db.Note.findById(req.params.id)
  .then(function(dbNote) {
    res.json(dbNote);
  });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
  // TODO
  // ====
  // Finish the route so it finds one article using the req.params.id,
  // and run the populate method with "note",
  // then responds with the article with the note included
  db.Article.findById(req.params.id).populate("note")
  .then(function(dbArticle) {
    res.json(dbArticle);
  })
  .catch(function(err) {
    res.json(err);
  });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
  // TODO
  // ====
  // save the new note that gets posted to the Notes collection
  // then find an article from the req.params.id
  // and update it's "note" property with the _id of the new note
  db.Note.create(req.body)
    .then(function(dbNote) {
      // console.log("This is the id: " + req.params.id);
      return db.Article.findOneAndUpdate(
        { _id: req.params.id }, 
        {$addToSet: {note: dbNote}}, { new: true });
    })
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
  });
  
  app.delete("/note/:id", function(req,res) {
    db.Note.findByIdAndDelete(req.params.id)
    .then(function(dbNote) {
      res.json(dbNote);
    }).catch(function(err) {
      res.json(err);
    });
  
    });


// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "! \n http://localhost:3000");
});
