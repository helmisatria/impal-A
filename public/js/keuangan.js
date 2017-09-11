function addItem(){
  $('#table-pembelian tr:last').after(`
    <tr>
      <td>KD001</td>
      <td>Betadine</td>
      <td>12</td>
      <td>200000</td>
      <td class="aksi-icon-padding">
        <a class="modal-trigger" href="#modal-lihat-data"><i class="material-icons aksi-icon">remove_red_eye</i></a>
        <a class="modal-trigger" href="#modal-edit-data"><i class="material-icons aksi-icon">mode_edit</i></a>
        <a class="modal-trigger" href="#modal-delete"><i class="material-icons aksi-icon">delete</i></a>
      </td>
    </tr>
    `)
}
