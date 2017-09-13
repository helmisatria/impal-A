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
let countBelanja = 0

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

  var tbl = $('table#table-pembelian tr').get().map(function(row) {
    return $(row).find('td').get().map(function(cell) {
      return $(cell).html();
    });
  });

  $.ajax({
    type: "POST",
    url: '/add_pembelian',
    data: {
      data: tbl,
      countBelanja
    },
    statusCode: {
      400: function(data) {
        console.log('400', data);
        swal({
          title: "",
          text: data.responseJSON.text,
          type: data.responseJSON.type,
          confirmButtonText: "Ok, Terimakasih"
        });
      },
      200: function(data) {
        console.log('200', data);
        swal({
          title: "",
          text: data.text,
          type: data.type,
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

function deleteItem(id) {
  let harga = Number($(`#${id}`).closest('tr')[0].cells[3].innerText)
  totalBiaya -= harga
  $('#hargaTotal').text(totalBiaya)
  console.log($(`#${id}`).closest('tr')[0].cells[3].innerText)
  $(`#${id}`).closest('tr').remove()
  countBelanja--
}

function addItem(){
  sameId = $(`tr#${idBarang}`).length
  if (sameId !== 0) {
    return swal({
      title: "",
      text: "Barang sudah dimasukkan ke keranjang",
      type: "error",
      confirmButtonText: "OK, Terimakasih"
    }, () => {
      setTimeout(() => {
        location.reload()
      }, 300)
    });
  }
  totalBiaya = totalBiaya + total
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
    <tr id="${idBarang}">
      <td>${idBarang}</td>
      <td>${dataBarang.nama_barang}</td>
      <td>${kuantitas}</td>
      <td class="harga">${total}</td>
      <td class="aksi-icon-padding">
        <a id="${idBarang}" class="delete-icon"><i id="${idBarang}" onclick="deleteItem('${idBarang}')" class="material-icons aksi-icon delete-icon">delete</i></a>
      </td>
    </tr>
    `)
  total = 0
  countBelanja++
}
