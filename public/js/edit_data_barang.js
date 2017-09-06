$("#edit_data_barang").submit(function(e){
  function objectifyForm(formArray) {//serialize data function

    var returnArray = {};
    for (var i = 0; i < formArray.length; i++){
      returnArray[formArray[i]['name']] = formArray[i]['value'];
    }
    return returnArray;
  }

  const url = '/edit_data_barang'

  $.ajax({
    type: "POST",
    url: url,
    data: {
      id_barang: data[0],
      data: objectifyForm($("#edit_data_barang").serializeArray())
    }, // serializes the form's elements.
    statusCode: {
      400: function(data) {
        alert(data.responseText)
      },
      200: function(data) {
        $('#modal-edit-barang').modal('close')
        swal({
          title: "",
          text: "Data Barang Berhasil Disimpan!",
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

$(".edit_data_barang_trigger").on('click', function(e) {
  $(this).parent().closest('tr').each(function(index, tr){
    data = $('td', tr).map(function(index, td) {
      return $(td).text();
    });
  })

  const url = '/get_data_barang'

  $.ajax({
    type: "POST",
    url: url,
    data: {id_barang: data[0]}, // serializes the form's elements.
    statusCode: {
      400: function(data) {
        alert(data.responseText)
      },
      200: function(data) {
        $('#id_barang_edit').val(data._id);
        $('#nama_barang_edit').val(data.nama_barang);
        $('#stok_edit').val(data.stok);
        $('#stok_opname_edit').val(data.stok_opname)
        $('#kategori_edit').val(data.kategori)
        $('#harga_beli_edit').val(data.harga_beli)
        $('#harga_jual_edit').val(data.harga_jual)
        $('#id_merk_edit').val(data.id_merk)
        Materialize.updateTextFields();
      }
    }
  });
});
