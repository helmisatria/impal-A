$(document).ready(function() {
  $("#cetak_data_barang_btn").click(function(e) {
    e.preventDefault();

    //getting data from our table
    var data_type = 'data:application/vnd.ms-excel';
    var table_div = document.getElementById('table_data');
    var table_html = table_div.outerHTML.replace(/ /g, '%20');

    var a = document.createElement('a');
    a.href = data_type + ', ' + table_html;
    a.download = 'exported ' + Math.floor((Math.random() * 9999999) + 1000000) + '.xls';
    a.click();
  });
});
