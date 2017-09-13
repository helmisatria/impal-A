$(document).ready(function(){
  $.ajax({
    statusCode: {
      403: function(data) {
        alert('Harap login kembali, demi keamanan')
      }
    }
  });
});
// this is the id of the form
$("#formlogin").submit(function(e) {
  var url = "/login"; // the script where you handle the form input.
  console.log('$("#formlogin").serialize()', $("#formlogin").serialize());
  $.ajax({
    type: "POST",
    url: url,
    data: $("#formlogin").serialize(), // serializes the form's elements.
    statusCode: {
      400: function(data) {
        alert(data.responseText)
      },
      200: function(data) {
        alert(`Welcome, ${data.username}!`)
        window.location.replace('/dashboard');
      }
    }
  });

  e.preventDefault(); // avoid to execute the actual submit of the form.
});
