// Whenever someone clicks a h2 tag
$(document).on("click", "h2", function() {
  // Empty the notes from the note section
  $(".create-note").empty();
  // Save the id from the p tag
  const thisId = $(this).attr("data-id");

  // Now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  })
    // With that done, add the note information to the page
    .then(function(data) {
      console.log(data);

      let inputForm = "<h2>" + data.title + "</h2>";
      inputForm += "<p>" + data.summary + "</p>";
      inputForm += "<em><a href = '" + data.link + "' alt='" + data.title + "'>" + data.link + "</a></em><br><br>"
      inputForm += "<div class='form-group'>";
      inputForm += "<label for='comment'>Comment:</label>";
      inputForm += "<textarea class='form-control' rows='1' id='comment'></textarea>";
      inputForm += "</div>";
      inputForm += "<button class='btn btn-primary rounded' data-id='" + data._id + "' id='post-comment'>Post Comment</button>";

      // Append the above HTML into the div with the class of .create-note
      $(".create-note").append(inputForm);

      // If there's a note in the article
      if (data.note) {

        let inputComments = "<br><hr><br><br><p>Posted Comments:</p>";
        inputComments += "<div class='notes border border-dark rounded p-5'>";
        inputComments += "</div>";

        $(".create-note").append(inputComments);

        // Place the comment in the div with the class of .notes
        $(".notes").val(data.note.body);
      }

    });
});

// When you click on the button with an ID of #post-comment
$(document).on("click", "#post-comment", function() {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      // Value taken from comment textarea
      comment: $("#comment").val()
    }
  })
    // With that done
    .then(function(data) {
      // Log the response
      console.log(data);
      // Empty the comment textarea
      $("#comment").empty();
    });
});
