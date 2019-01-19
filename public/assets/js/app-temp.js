// Whenever someone clicks a h2 tag
$(document).on("click", "h2", function() {
    // Empty the notes from the note section
    $("#notes").empty();
    // Save the id from the p tag
    var thisId = $(this).attr("data-id");
  
    // Now make an ajax call for the Article
    $.ajax({
      method: "GET",
      url: "/articles/" + thisId
    })
      // With that done, add the note information to the page
      .then(function(data) {
          console.log(data.title);
          $("#test").empty()
          $("#test").text(data.title);
        
    });
      
  });