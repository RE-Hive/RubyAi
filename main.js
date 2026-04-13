/* sction detial produk */

function addCart(item) {
  var k = JSON.parse(localStorage.getItem('rubyai_keranjang') || '[]');
  var i = k.findIndex(function(x) { return x.id === item.id; });
  if (i > -1) { k[i].qty += 1; } else { item.qty = 1; k.push(item); }
  localStorage.setItem('rubyai_keranjang', JSON.stringify(k));
  updateBadge();
  showToast(item.nama + ' ditambahkan ke keranjang!');
}
function updateBadge() {
  var k = JSON.parse(localStorage.getItem('rubyai_keranjang') || '[]');
  var t = k.reduce(function(s, x) { return s + x.qty; }, 0);
  var b = document.getElementById('cartBadge');
  if (!b) return;
  b.textContent = t > 99 ? '99+' : t;
  t > 0 ? b.classList.add('visible') : b.classList.remove('visible');
}
var _tt;
function showToast(msg) {
  var el = document.getElementById('rubyToast');
  document.getElementById('rubyToastMsg').textContent = msg;
  el.classList.add('show');
  clearTimeout(_tt);
  _tt = setTimeout(function() { el.classList.remove('show'); }, 2800);
}
updateBadge();

/* end section detail produk */

/* section keranjang */

function getKeranjang() {
      return JSON.parse(localStorage.getItem('rubyai_keranjang') || '[]');
    }

    function simpanKeranjang(keranjang) {
      localStorage.setItem('rubyai_keranjang', JSON.stringify(keranjang));
    }

    function updateCartBadge() {
      var keranjang = getKeranjang();
      var total = keranjang.reduce(function(s, i) { return s + i.qty; }, 0);
      var badge = document.getElementById('cartBadge');
      if (!badge) return;
      badge.textContent = total > 99 ? '99+' : total;
      total > 0 ? badge.classList.add('visible') : badge.classList.remove('visible');
    }

    function formatUSD(val) {
      if (val === 0) return 'GRATIS';
      return '$' + val.toFixed(2);
    }

    function renderCart() {
      var keranjang = getKeranjang();
      var itemsCol   = document.getElementById('cartItemsCol');
      var summaryCol = document.getElementById('cartSummaryCol');

      /* ---- EMPTY STATE ---- */
      if (keranjang.length === 0) {
        itemsCol.innerHTML =
          '<div class="empty-cart">' +
            '<i class="bi bi-cart-x empty-cart-icon"></i>' +
            '<h4>Keranjang Masih Kosong</h4>' +
            '<p class="mb-4">Kamu belum menambahkan item promo apapun. Yuk cari promo terbaik!</p>' +
            '<a href="promo.html" class="btn btn-ruby px-5"><i class="bi bi-tag-fill me-2"></i>Lihat Promo Sekarang</a>' +
          '</div>';
        summaryCol.innerHTML = '';
        updateCartBadge();
        return;
      }

      var subtotal   = 0;
      var totalHemat = 0;
      keranjang.forEach(function(item) {
        subtotal   += item.harga * item.qty;
        totalHemat += (item.hargaNormal - item.harga) * item.qty;
      });

      var itemsHTML = '<div class="d-flex justify-content-between align-items-center mb-4">' +
        '<h5 class="fw-bold mb-0" style="font-family:\'Syne\',sans-serif;">' +
          '<i class="bi bi-cart3 me-2 text-ruby"></i>Item Dipilih' +
        '</h5>' +
        '<span class="badge rounded-pill" style="background:var(--ruby-light);color:var(--ruby-red);font-size:0.8rem;">' +
          keranjang.length + ' item</span>' +
      '</div>' +
      '<div class="d-flex flex-column gap-3">';

      keranjang.forEach(function(item, idx) {
        var imgSrc = item.gambar || 'bannerr.png';
        var hargaStr = item.harga === 0 ? '<span style="color:#16a34a;font-weight:800;">GRATIS</span>' :
          '<span class="cart-item-price-final">$' + item.harga.toFixed(2) + '</span>';
        var normalStr = item.hargaNormal !== item.harga ?
          '<span class="cart-item-price-normal">$' + item.hargaNormal.toFixed(2) + '</span>' : '';
        var subtotalItem = item.harga * item.qty;
        var subtotalStr = item.harga === 0 ? '' :
          '<span class="cart-item-subtotal">Subtotal: $' + subtotalItem.toFixed(2) + '</span>';

        itemsHTML +=
          '<div class="cart-item" id="item-' + idx + '">' +
            '<img src="' + imgSrc + '" class="cart-item-img" alt="' + item.nama + '" ' +
              'onerror="this.src=\'bannerr.png\'">' +
            '<div class="cart-item-info">' +
              '<div class="cart-item-name">' + item.nama + '</div>' +
              '<span class="cart-item-badge">' + (item.badge || 'Promo') + '</span>' +
              '<div style="display:flex;align-items:baseline;gap:4px;">' +
                hargaStr + normalStr +
              '</div>' +
              subtotalStr +
              '<div class="qty-control">' +
                '<button class="qty-btn" onclick="ubahQty(' + idx + ', -1)" aria-label="Kurangi">&#8722;</button>' +
                '<span class="qty-val">' + item.qty + '</span>' +
                '<button class="qty-btn" onclick="ubahQty(' + idx + ', 1)" aria-label="Tambah">&#43;</button>' +
              '</div>' +
              '<button class="btn-hapus" onclick="hapusItem(' + idx + ')">' +
                '<i class="bi bi-trash3"></i> Hapus' +
              '</button>' +
            '</div>' +
          '</div>';
      });

      itemsHTML += '</div>';
      itemsHTML += '<div class="mt-4 d-flex justify-content-between align-items-center flex-wrap gap-2">' +
        '<button class="btn btn-sm text-danger border-0 p-0 d-flex align-items-center gap-1" onclick="kosongkanKeranjang()">' +
          '<i class="bi bi-trash3-fill"></i> Kosongkan Semua' +
        '</button>' +
        '<a href="promo.html" class="btn btn-outline-ruby btn-sm">' +
          '<i class="bi bi-arrow-left me-1"></i> Tambah Promo Lain' +
        '</a>' +
      '</div>';

      itemsCol.innerHTML = itemsHTML;

      var hematHTML = totalHemat > 0 ?
        '<div class="summary-savings">' +
          '<i class="bi bi-piggy-bank-fill"></i>' +
          'Kamu hemat $' + totalHemat.toFixed(2) + ' dari promo ini!' +
        '</div>' : '';

      summaryCol.innerHTML =
        '<div class="order-summary">' +
          '<div class="order-summary-title">&#128203; Ringkasan Pesanan</div>' +

          hematHTML +

          '<div class="summary-row">' +
            '<span class="label">Subtotal (' + keranjang.length + ' item)</span>' +
            '<span class="value">' + (subtotal === 0 ? 'GRATIS' : '$' + subtotal.toFixed(2)) + '</span>' +
          '</div>' +
          '<div class="summary-row">' +
            '<span class="label">Diskon & Bonus</span>' +
            '<span class="value" style="color:#16a34a;">-$' + totalHemat.toFixed(2) + '</span>' +
          '</div>' +
          '<div class="summary-row">' +
            '<span class="label">Biaya Platform</span>' +
            '<span class="value" style="color:#16a34a;">GRATIS</span>' +
          '</div>' +
          '<div class="summary-row total">' +
            '<span class="label">Total Bayar</span>' +
            '<span class="value">' + (subtotal === 0 ? 'GRATIS' : '$' + subtotal.toFixed(2)) + '</span>' +
          '</div>' +

          '<button class="btn btn-ruby w-100 mt-4 py-3 fw-bold" style="font-size:1rem;" onclick="checkout()">' +
            '<i class="bi bi-shield-check me-2"></i>Lanjut Checkout' +
          '</button>' +
          '<p class="text-muted text-center mt-3 mb-0" style="font-size:0.78rem;">' +
            '<i class="bi bi-lock-fill me-1"></i>Transaksi aman &amp; terenkripsi' +
          '</p>' +

          '<hr class="my-4">' +
          '<div style="font-size:0.78rem;color:var(--text-muted);">' +
            '<div class="d-flex align-items-center gap-2 mb-2">' +
              '<i class="bi bi-patch-check-fill text-ruby"></i>' +
              'Promo berlaku satu kali per akun' +
            '</div>' +
            '<div class="d-flex align-items-center gap-2 mb-2">' +
              '<i class="bi bi-clock-fill text-ruby"></i>' +
              'Klaim dalam 24 jam setelah checkout' +
            '</div>' +
            '<div class="d-flex align-items-center gap-2">' +
              '<i class="bi bi-headset text-ruby"></i>' +
              'Support 24/7 via info@rubyai.id' +
            '</div>' +
          '</div>' +
        '</div>';

      updateCartBadge();
    }

    function ubahQty(idx, delta) {
      var keranjang = getKeranjang();
      if (!keranjang[idx]) return;
      keranjang[idx].qty += delta;
      if (keranjang[idx].qty <= 0) {
        hapusItem(idx);
        return;
      }
      simpanKeranjang(keranjang);
      renderCart();
    }

    function hapusItem(idx) {
      var keranjang = getKeranjang();
      var nama = keranjang[idx] ? keranjang[idx].nama : 'Item';
      keranjang.splice(idx, 1);
      simpanKeranjang(keranjang);
      renderCart();
      showToast(nama + ' dihapus dari keranjang');
    }

    function kosongkanKeranjang() {
      if (!confirm('Kosongkan semua item di keranjang?')) return;
      localStorage.removeItem('rubyai_keranjang');
      renderCart();
      showToast('Keranjang dikosongkan');
    }

    function checkout() {
      var keranjang = getKeranjang();
      if (keranjang.length === 0) {
        showToast('Keranjang masih kosong!');
        return;
      }

      window.location.href = 'langganan.html';
    }

    var _toastTimer;
    function showToast(msg) {
      var toast = document.getElementById('rubyToast');
      var msgEl = document.getElementById('rubyToastMsg');
      if (!toast) return;
      msgEl.textContent = msg;
      toast.classList.add('show');
      clearTimeout(_toastTimer);
      _toastTimer = setTimeout(function() { toast.classList.remove('show'); }, 2800);
    }

    renderCart();

/* end section keranjang */

/* section langganan */
const harga = {
      bulanan:  { starter: '0',  starterPer: 'Selamanya gratis', pro: '9.99',  proPer: 'per bulan', ent: '24.99', entPer: 'per bulan' },
      tahunan:  { starter: '0',  starterPer: 'Selamanya gratis', pro: '7.99',  proPer: 'per bulan (billed annually)', ent: '19.99', entPer: 'per bulan (billed annually)' }
    };

    function setToggle(mode) {
      const d = harga[mode];
      document.getElementById('starter-price').textContent = d.starter;
      document.getElementById('starter-per').textContent   = d.starterPer;
      document.getElementById('pro-price').textContent     = d.pro;
      document.getElementById('pro-per').textContent       = d.proPer;
      document.getElementById('ent-price').textContent     = d.ent;
      document.getElementById('ent-per').textContent       = d.entPer;

      document.getElementById('btnBulanan').classList.toggle('aktif', mode === 'bulanan');
      document.getElementById('btnTahunan').classList.toggle('aktif', mode === 'tahunan');
    }

/* end section langganan */

/* section promo */

var filterBtns = document.querySelectorAll('.filter-btn');
    var sections   = ['semua-promo', 'promo-diskon', 'promo-bonus'];

    filterBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {

        var target = this.getAttribute('data-target');
        filterBtns.forEach(function(b) { b.classList.remove('active'); });
        this.classList.add('active');

        sections.forEach(function(id) {
          var el = document.getElementById(id);
          if (id === target) {
            el.style.display = 'block';
            el.classList.remove('promo-section');
            void el.offsetWidth;
            el.classList.add('promo-section');
          } else {
            el.style.display = 'none';
          }
        });

      });
    });

    function tambahKeranjang(produk) {
      var keranjang = JSON.parse(localStorage.getItem('rubyai_keranjang') || '[]');
      var idx = keranjang.findIndex(function(i) { return i.id === produk.id; });
      if (idx > -1) {
        keranjang[idx].qty += 1;
      } else {
        produk.qty = 1;
        keranjang.push(produk);
      }
      localStorage.setItem('rubyai_keranjang', JSON.stringify(keranjang));
      updateCartBadge();
      showToast(produk.nama + ' ditambahkan ke keranjang!');
    }

    function updateCartBadge() {
      var keranjang = JSON.parse(localStorage.getItem('rubyai_keranjang') || '[]');
      var total = keranjang.reduce(function(s, i) { return s + i.qty; }, 0);
      var badge = document.getElementById('cartBadge');
      if (!badge) return;
      badge.textContent = total > 99 ? '99+' : total;
      total > 0 ? badge.classList.add('visible') : badge.classList.remove('visible');
    }

    var _toastTimer;
    function showToast(msg) {
      var toast = document.getElementById('rubyToast');
      var msgEl = document.getElementById('rubyToastMsg');
      if (!toast) return;
      msgEl.textContent = msg;
      toast.classList.add('show');
      clearTimeout(_toastTimer);
      _toastTimer = setTimeout(function() { toast.classList.remove('show'); }, 2800);
    }

    updateCartBadge();

/* end section promo */



