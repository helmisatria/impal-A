$(".cetak_data_barang_trigger").on('click', function(e) {
  let data
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
        console.log(data);
        $('#id_barang_cetak').text(data._id);
        $('#nama_barang_cetak').text(data.nama_barang);
        $('#stok_cetak').text(data.stok);
        $('#stok_opname_cetak').text(data.stok_opname)
        $('#kategori_cetak').text(data.kategori)
        $('#harga_beli_cetak').text(data.harga_beli)
        $('#harga_jual_cetak').text(data.harga_jual)
        $('#id_merk_cetak').text(data.id_merk)
      }
    }
  });

  Materialize.updateTextFields();
});
  // e.preventDefault(); // avoid to execute the actual submit of the form.
