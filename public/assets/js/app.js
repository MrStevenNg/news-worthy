// Whenever someone clicks a h2 tag
$(document).on("click", "h2", function () {
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
    .then(function (data) {
      // console.log(data);

      let inputForm = "<h2>" + data.title + "</h2>";
      inputForm += "<p>" + data.summary + "</p>";
      inputForm += "<em><a href = '" + data.link + "' alt='" + data.title + "'>" + data.link + "</a></em><br><br>"
      inputForm += "<div class='form-group'>";
      inputForm += "<label for='comment'>Comment:</label>";
      inputForm += "<textarea class='form-control' rows='1' id='comment' name='body'></textarea>";
      inputForm += "</div>";
      inputForm += "<button class='btn btn-primary rounded' data-id='" + data._id + "' id='post-comment'>Post Comment</button>";

      // Append the above HTML into the div with the class of .create-note
      $(".create-note").append(inputForm);

      let inputComments = "<br><hr><br><br><p>Posted Comments:</p>";
      inputComments += "<div>";
      inputComments += "<ol class='notes'></ol></div>";

      $(".create-note").append(inputComments);

      ajaxLoop(data);

    });

});

// When you click on the button with an ID of #post-comment
$(document).on("click", "#post-comment", function () {

  const commentText = $("#comment").val();
  // IF, #comment != "" THEN, ELSE do nothing.
  if (commentText !== "") {

    // Grab the id associated with the article from the submit button
    var thisId = $(this).attr("data-id");

    // Clear .notes to prevent repeat data being displayed.
    $(".notes").empty();

    // Run a POST request to change the note, using what's entered in the inputs
    $.ajax({
        method: "POST",
        url: "/articles/" + thisId,
        data: {
          // Value taken from comment textarea
          body: $("#comment").val()
        }
      })
      // With that done
      .then(function (data) {
        // Log the response
        // console.log(data);

        //for-loop to append all comments(notes)
        for (let i = 0; i < data.note.length; i++) {

          // SECOND AJAX CALL TO /notes //////////
          $.ajax({
              method: "GET",
              url: "/notes/" + data.note[i]
            })
            .then(function (data) {

              console.log(data);

              if (data._id !== null) {
                let newComment = "<li class='del' data-id='" + data._id + "'>" + data.body + "</li>";

                // Place the comment in the div with the class of .notes
                $(".notes").append(newComment);
              }



            });
          ////////////////////////////////////////

        }



        // Empty the comment textarea
        $("#comment").val("");
      });
  }
});

$(document).on("click", ".del", function (event) {
  // Get the ID from the corresponding button's data attribute
  let thisId = $(this).data("id");
  $(this).remove();
  // AJAX call to send the DELETE request.
  $.ajax("/note/" + thisId, {
    type: "DELETE"
    // Promise.
  }).then(function (data) {
    console.log("deleted id#" + data._id);

  });
});

function ajaxLoop(data) {

  //for-loop to append all comments(notes)
  for (let i = 0; i < data.note.length; i++) {

    // SECOND AJAX CALL TO /notes //////////
    $.ajax({
        method: "GET",
        url: "/notes/" + data.note[i]._id
      })
      .then(function (data) {

        // console.log(data);

        let newComment = "<li class='del' data-id='" + data._id + "'>" + data.body + "</li>";

        // Place the comment in the div with the class of .notes
        $(".notes").append(newComment);

      });
    ////////////////////////////////////////

  }

}