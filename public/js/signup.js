// this is the id of the form
$("#formsignup").submit(function(e) {
  var url = "/signup"; // the script where you handle the form input.

  $.ajax({
    type: "POST",
    url: url,
    data: $("#formsignup").serialize(), // serializes the form's elements.
    statusCode: {
      400: function(data) {
        alert('Username telah digunakan')
      },
      200: function(data) {
        alert(`Hai, ${data.username}! Kamu berhasil terdaftar`) // show response from the php script.
      }
    }
  });

  e.preventDefault(); // avoid to execute the actual submit of the form.
});
