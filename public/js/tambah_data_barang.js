$("#tambah_data_barang").submit(function(e) {
  var url = "/tambah_data_barang"; // the script where you handle the form input.

  $.ajax({
    type: "POST",
    url: url,
    data: $("#tambah_data_barang").serialize(), // serializes the form's elements.
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
          $('#modal-new-barang').modal('close');
          setTimeout(() => {
            location.reload()
          }, 300)
        });
      }
    }
  });

  e.preventDefault(); // avoid to execute the actual submit of the form.
});
