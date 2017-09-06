let data

$(".hapus_data_barang_trigger").on('click', function(e) {
  $(this).parent().closest('tr').each(function(index, tr){
    data = $('td', tr).map(function(index, td) {
      return $(td).text();
    });
  })
});

$("#delete-confirmation").on('click', function(e){
  const url = '/hapus_data_barang'

  $.ajax({
    type: "POST",
    url: url,
    data: {
      id_barang: data[0]
    }, // serializes the form's elements.
    statusCode: {
      400: function(data) {
        alert(data.responseText)
      },
      200: function(data) {
        $('#modal-delete').modal('close');
        swal({
          title: "",
          text: "Data Barang Berhasil Dihapus!",
          type: "success",
          confirmButtonText: "Ok, Terimakasih"
        }, () => {
          setTimeout(() => {
            location.reload()
          }, 300)
        });
      }
    }
  });
  e.preventDefault(); // avoid to execute the actual submit of the form.

})
