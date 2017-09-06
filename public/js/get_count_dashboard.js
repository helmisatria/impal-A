$(document).ready(function(){
  const url = '/get_count_dashboard'

  $.ajax({
    type: "POST",
    url: url,
    statusCode: {
      400: function(data) {
        console.log(data);
        alert(data.responseText)
      },
      200: function(data) {
        $('#dashboard_jumlah_data_barang').text(data.data_barang)
      }
    }
  })
});
