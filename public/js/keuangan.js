$(document).ready(function() {
  //Autocomplete
  $(function() {
    $.ajax({
      type: 'GET',
      url: '/get_id_barang',
      statusCode: {
        400: function(response) {
          alert(response)
        },
        200: function(response) {
          console.log(response);
          var barangArray = response;
          var dataBarang = {};
          for (var i = 0; i < barangArray.length; i++) {
            dataBarang[barangArray[i]._id] = barangArray[i].flag; //countryArray[i].flag or null
          }
          $('input.autocomplete').autocomplete({
            data: dataBarang,
            limit: 5, // The max amount of results that can be shown at once. Default: Infinity.
          });
        }
      }
    });
  });
});

let kuantitas
let dataBarang
let idBarang
let total
let totalBiaya = 0

function autoFill() {
  idBarang = document.getElementById('idBarang').value
  $.ajax({
    type: "POST",
    url: '/get_data/barang',
    data: {id: idBarang}, // serializes the form's elements.
    statusCode: {
      400: function(data) {
        alert(data.responseText)
      },
      200: function(data) {
        dataBarang = data
        document.getElementById('namaBarang').value = data.nama_barang
        $('label.namaBarang').addClass('active')
        document.getElementById('kategori').value = data.kategori
        $('label.kategori').addClass('active')
      }
    }
  });
}

function hargaJualFill() {
  kuantitas = document.getElementById('kuantitas').value
  document.getElementById('hargaJual').value = Number(dataBarang.harga_jual)*kuantitas
  total = Number(dataBarang.harga_jual)*kuantitas
  $('label.hargaJual').addClass('active')
}

function hargaJualDiskon() {
  const diskon = document.getElementById('diskon').value
  document.getElementById('hargaJual').value = Number(dataBarang.harga_jual)*kuantitas*((100-diskon)/100)
  total = Number(dataBarang.harga_jual)*kuantitas*((100-diskon)/100)
}

function getTableData() {
  // Loop through grabbing everything
  var myRows = [];
  var $headers = $("th");
  var $rows = $("tbody tr").each(function(index) {
    $cells = $(this).find("td");
    myRows[index] = {};
    $cells.each(function(cellIndex) {
      myRows[index][$($headers[cellIndex]).html()] = $(this).html();
    });
  });

  // Let's put this in the object like you want and convert to JSON (Note: jQuery will also do this for you on the Ajax request)
  var result = {};
  result = myRows;

  $.ajax({
    type: "POST",
    url: '/add_pembelian',
    data: {
      data: result
    },
    statusCode: {
      400: function(data) {
        alert(data.responseText)
      },
      200: function(data) {
        swal({
          title: "",
          text: "Data Pembelian Berhasil Disimpan!",
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
}

$('a.delete-icon').on('click', function() {
  console.log(this);
  $(this).parent().remove();
})

$('a.aksi-icon').on('click', function() {
  console.log(this);
  $(this).parent().remove();
})

function addItem(){
  totalBiaya = totalBiaya + total
  console.log(totalBiaya);
  $('#hargaTotal').text(totalBiaya)

  $('#idBarang').val('')
  $('label.idBarang').removeClass('active')
  $('#namaBarang').val('')
  $('label.namaBarang').removeClass('active')
  $('#kategori').val('')
  $('label.kategori').removeClass('active')
  $('#kuantitas').val('')
  $('label.kuantitas').removeClass('active')
  $('#hargaJual').val('')
  $('label.hargaJual').removeClass('active')
  $('#diskon').val('')
  $('label.diskon').removeClass('active')
  $('#table-pembelian tr:last').after(`
    <tr>
      <td>${idBarang}</td>
      <td>${dataBarang.nama_barang}</td>
      <td>${kuantitas}</td>
      <td>${total}</td>
      <td class="aksi-icon-padding">
        <a class="modal-trigger" href="#modal-edit-data"><i class="material-icons aksi-icon">mode_edit</i></a>
        <a class="delete-icon"><i class="material-icons aksi-icon">delete</i></a>
      </td>
    </tr>
    `)
  total = 0
}
