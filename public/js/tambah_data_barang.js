$("#create_data").submit(function(e) {
  var url = "/create_data"; // the script where you handle the form input.

  $.ajax({
    type: "POST",
    url: url,
    data: $("#create_data").serialize(), // serializes the form's elements.
    statusCode: {
      400: function(data) {
        alert(data.responseText)
      },
      200: function(data) {
        swal({
          title: "",
          text: data.responseText,
          type: "success",
          confirmButtonText: "Ok, Terimakasih",
        }, () => {
          $('#modal-create-data').modal('close');
          setTimeout(() => {
            location.reload()
          }, 300)
        });
      }
    }
  });

  e.preventDefault(); // avoid to execute the actual submit of the form.
});
