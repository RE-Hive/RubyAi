document.addEventListener('DOMContentLoaded', function () {

  function updateCartBadge() {
    var k = JSON.parse(localStorage.getItem('rubyai_keranjang') || '[]');
    var total = k.reduce(function (s, x) { return s + x.qty; }, 0);
    var badge = document.getElementById('cartBadge');
    if (!badge) return;
    badge.textContent = total > 99 ? '99+' : total;
    total > 0 ? badge.classList.add('visible') : badge.classList.remove('visible');
  }

  var _toastTimer;
  function showToast(msg) {
    var el = document.getElementById('rubyToast');
    var msgEl = document.getElementById('rubyToastMsg');
    if (!el || !msgEl) return;
    msgEl.textContent = msg;
    el.classList.add('show');
    clearTimeout(_toastTimer);
    _toastTimer = setTimeout(function () { el.classList.remove('show'); }, 2800);
  }

  window.tambahKeranjang = function (produk) {
    var k = JSON.parse(localStorage.getItem('rubyai_keranjang') || '[]');
    var idx = k.findIndex(function (x) { return x.id === produk.id; });
    if (idx > -1) { k[idx].qty += 1; } else { produk.qty = 1; k.push(produk); }
    localStorage.setItem('rubyai_keranjang', JSON.stringify(k));
    updateCartBadge();
    showToast(produk.nama + ' ditambahkan ke keranjang!');
  };

  window.addCart = window.tambahKeranjang;

  var filterBtns = document.querySelectorAll('.filter-btn');
  if (filterBtns.length > 0) {
    var sections = ['semua-promo', 'promo-diskon', 'promo-bonus'];
    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var target = this.getAttribute('data-target');
        filterBtns.forEach(function (b) { b.classList.remove('active'); });
        this.classList.add('active');
        sections.forEach(function (id) {
          var el = document.getElementById(id);
          if (!el) return;
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
  }

  var cartItemsCol = document.getElementById('cartItemsCol');
  var cartSummaryCol = document.getElementById('cartSummaryCol');
  if (cartItemsCol && cartSummaryCol) {

    function getKeranjang() {
      return JSON.parse(localStorage.getItem('rubyai_keranjang') || '[]');
    }

    function simpanKeranjang(k) {
      localStorage.setItem('rubyai_keranjang', JSON.stringify(k));
    }

    window.ubahQty = function (idx, delta) {
      var k = getKeranjang();
      if (!k[idx]) return;
      k[idx].qty += delta;
      if (k[idx].qty <= 0) { window.hapusItem(idx); return; }
      simpanKeranjang(k);
      renderCart();
    };

    window.hapusItem = function (idx) {
      var k = getKeranjang();
      var nama = k[idx] ? k[idx].nama : 'Item';
      k.splice(idx, 1);
      simpanKeranjang(k);
      renderCart();
      showToast(nama + ' dihapus dari keranjang');
    };

    window.kosongkanKeranjang = function () {
      if (!confirm('Kosongkan semua item di keranjang?')) return;
      localStorage.removeItem('rubyai_keranjang');
      renderCart();
      showToast('Keranjang dikosongkan');
    };

    window.checkout = function () {
      if (getKeranjang().length === 0) { showToast('Keranjang masih kosong!'); return; }
      window.location.href = 'langganan.html';
    };

    function renderCart() {
      var k = getKeranjang();
      if (k.length === 0) {
        cartItemsCol.innerHTML =
          '<div class="empty-cart">' +
          '<i class="bi bi-cart-x empty-cart-icon"></i>' +
          '<h4>Keranjang Masih Kosong</h4>' +
          '<p class="mb-4">Kamu belum menambahkan item promo apapun. Yuk cari promo terbaik!</p>' +
          '<a href="promo.html" class="btn btn-ruby px-5"><i class="bi bi-tag-fill me-2"></i>Lihat Promo Sekarang</a>' +
          '</div>';
        cartSummaryCol.innerHTML = '';
        updateCartBadge();
        return;
      }

      var subtotal = 0, totalHemat = 0;
      k.forEach(function (item) {
        subtotal += item.harga * item.qty;
        totalHemat += (item.hargaNormal - item.harga) * item.qty;
      });

      var itemsHTML =
        '<div class="d-flex justify-content-between align-items-center mb-4">' +
        '<h5 class="fw-bold mb-0" style="font-family:\'Syne\',sans-serif;"><i class="bi bi-cart3 me-2 text-ruby"></i>Item Dipilih</h5>' +
        '<span class="badge rounded-pill" style="background:var(--ruby-light);color:var(--ruby-red);font-size:0.8rem;">' + k.length + ' item</span>' +
        '</div><div class="d-flex flex-column gap-3">';

      k.forEach(function (item, idx) {
        var imgSrc = item.gambar || 'asset/bannerr.png';
        var hargaStr = item.harga === 0
          ? '<span style="color:#16a34a;font-weight:800;">GRATIS</span>'
          : '<span class="cart-item-price-final">$' + item.harga.toFixed(2) + '</span>';
        var normalStr = item.hargaNormal !== item.harga
          ? '<span class="cart-item-price-normal">$' + item.hargaNormal.toFixed(2) + '</span>' : '';
        var subtotalStr = item.harga === 0 ? '' :
          '<span class="cart-item-subtotal">Subtotal: $' + (item.harga * item.qty).toFixed(2) + '</span>';

        itemsHTML +=
          '<div class="cart-item" id="item-' + idx + '">' +
          '<img src="' + imgSrc + '" class="cart-item-img" alt="' + item.nama + '" onerror="this.src=\'asset/bannerr.png\'">' +
          '<div class="cart-item-info">' +
          '<div class="cart-item-name">' + item.nama + '</div>' +
          '<span class="cart-item-badge">' + (item.badge || 'Promo') + '</span>' +
          '<div style="display:flex;align-items:baseline;gap:4px;">' + hargaStr + normalStr + '</div>' +
          subtotalStr +
          '<div class="qty-control">' +
          '<button class="qty-btn" onclick="ubahQty(' + idx + ',-1)" aria-label="Kurangi">&#8722;</button>' +
          '<span class="qty-val">' + item.qty + '</span>' +
          '<button class="qty-btn" onclick="ubahQty(' + idx + ',1)" aria-label="Tambah">&#43;</button>' +
          '</div>' +
          '<button class="btn-hapus" onclick="hapusItem(' + idx + ')"><i class="bi bi-trash3"></i> Hapus</button>' +
          '</div></div>';
      });

      itemsHTML +=
        '</div><div class="mt-4 d-flex justify-content-between align-items-center flex-wrap gap-2">' +
        '<button class="btn btn-sm text-danger border-0 p-0 d-flex align-items-center gap-1" onclick="kosongkanKeranjang()"><i class="bi bi-trash3-fill"></i> Kosongkan Semua</button>' +
        '<a href="promo.html" class="btn btn-outline-ruby btn-sm"><i class="bi bi-arrow-left me-1"></i> Tambah Promo Lain</a>' +
        '</div>';

      cartItemsCol.innerHTML = itemsHTML;

      var hematHTML = totalHemat > 0
        ? '<div class="summary-savings"><i class="bi bi-piggy-bank-fill"></i>Kamu hemat $' + totalHemat.toFixed(2) + ' dari promo ini!</div>'
        : '';

      cartSummaryCol.innerHTML =
        '<div class="order-summary">' +
        '<div class="order-summary-title">&#128203; Ringkasan Pesanan</div>' +
        hematHTML +
        '<div class="summary-row"><span class="label">Subtotal (' + k.length + ' item)</span><span class="value">' + (subtotal === 0 ? 'GRATIS' : '$' + subtotal.toFixed(2)) + '</span></div>' +
        '<div class="summary-row"><span class="label">Diskon & Bonus</span><span class="value" style="color:#16a34a;">-$' + totalHemat.toFixed(2) + '</span></div>' +
        '<div class="summary-row"><span class="label">Biaya Platform</span><span class="value" style="color:#16a34a;">GRATIS</span></div>' +
        '<div class="summary-row total"><span class="label">Total Bayar</span><span class="value">' + (subtotal === 0 ? 'GRATIS' : '$' + subtotal.toFixed(2)) + '</span></div>' +
        '<button class="btn btn-ruby w-100 mt-4 py-3 fw-bold" style="font-size:1rem;" onclick="checkout()"><i class="bi bi-shield-check me-2"></i>Lanjut Checkout</button>' +
        '<p class="text-muted text-center mt-3 mb-0" style="font-size:0.78rem;"><i class="bi bi-lock-fill me-1"></i>Transaksi aman &amp; terenkripsi</p>' +
        '<hr class="my-4">' +
        '<div style="font-size:0.78rem;color:var(--text-muted);">' +
        '<div class="d-flex align-items-center gap-2 mb-2"><i class="bi bi-patch-check-fill text-ruby"></i>Promo berlaku satu kali per akun</div>' +
        '<div class="d-flex align-items-center gap-2 mb-2"><i class="bi bi-clock-fill text-ruby"></i>Klaim dalam 24 jam setelah checkout</div>' +
        '<div class="d-flex align-items-center gap-2"><i class="bi bi-headset text-ruby"></i>Support 24/7 via info@rubyai.id</div>' +
        '</div></div>';

      updateCartBadge();
    }

    renderCart();
  }

  var hargaData = {
    bulanan: { starter: '0', starterPer: 'Selamanya gratis', pro: '9.99', proPer: 'per bulan', ent: '24.99', entPer: 'per bulan' },
    tahunan: { starter: '0', starterPer: 'Selamanya gratis', pro: '7.99', proPer: 'per bulan (billed annually)', ent: '19.99', entPer: 'per bulan (billed annually)' }
  };

  window.setToggle = function (mode) {
    var d = hargaData[mode];
    var ids = ['starter-price', 'starter-per', 'pro-price', 'pro-per', 'ent-price', 'ent-per'];
    var vals = [d.starter, d.starterPer, d.pro, d.proPer, d.ent, d.entPer];
    ids.forEach(function (id, i) {
      var el = document.getElementById(id);
      if (el) el.textContent = vals[i];
    });
    var btnB = document.getElementById('btnBulanan');
    var btnT = document.getElementById('btnTahunan');
    if (btnB) btnB.classList.toggle('aktif', mode === 'bulanan');
    if (btnT) btnT.classList.toggle('aktif', mode === 'tahunan');
  };

  updateCartBadge();
});
