// this is the id of the form
$("#formlogin").submit(function(e) {

    var url = "/login"; // the script where you handle the form input.

    $.ajax({
           type: "POST",
           url: url,
           data: $("#formlogin").serialize(), // serializes the form's elements.
           success: function(data)
           {
               alert(data); // show response from the php script.
           }
         });

    e.preventDefault(); // avoid to execute the actual submit of the form.
});
