/**
 * 蛋糕OA系统 - 订单管理模块
 */
(function () {
  'use strict';

  var PAGE_SIZE = 10;
  var currentPage = 0;
  var currentKeyword = '';

  /* ===== Order List ===== */

  function loadOrderList(page, keyword) {
    if (page === undefined || page === null) page = 0;
    if (keyword === undefined) keyword = '';
    currentPage = page;
    currentKeyword = keyword;

    var url = '/api/orders?page=' + page + '&size=' + PAGE_SIZE;
    if (keyword) {
      url += '&keyword=' + encodeURIComponent(keyword);
    }

    App.api('GET', url)
      .then(function (res) {
        var pageData = res.data;
        var list = pageData.content || [];
        var container = document.getElementById('order-list-content');
        var emptyEl = document.getElementById('order-list-empty');
        var pagEl = document.getElementById('order-list-pagination');

        if (list.length === 0) {
          container.innerHTML = '';
          emptyEl.classList.remove('hidden');
          pagEl.classList.add('hidden');
          return;
        }

        emptyEl.classList.add('hidden');
        var html = '';
        for (var i = 0; i < list.length; i++) {
          var o = list[i];
          html += renderOrderCard(o);
        }
        container.innerHTML = html;

        // Pagination
        renderPagination(pagEl, pageData);

        // Bind detail buttons
        bindDetailButtons();
      })
      .catch(function () {
        App.showToast('加载订单列表失败');
      });
  }

  function renderOrderCard(o) {
    var lunarStr = '';
    if (o.orderDate && window.Lunar) {
      lunarStr = Lunar.toLunar(o.orderDate);
      if (lunarStr) lunarStr = '（' + lunarStr + '）';
    }
    return '<div class="card">' +
      '<div class="card-title">🎂 ' + escapeHtml(o.customerName) + '</div>' +
      '<div class="card-meta">' +
        '📱 ' + escapeHtml(o.phone) + '<br>' +
        '📅 ' + App.formatDate(o.orderDate) + ' <span style="color:#6C5CE7;">' + lunarStr + '</span>　💰 ¥' + (o.price || 0) + '<br>' +
        '📍 ' + escapeHtml(o.address || '') +
      '</div>' +
      '<div class="card-actions">' +
        '<button class="btn btn-primary btn-sm order-detail-btn" data-id="' + o.id + '" type="button">查看详情</button>' +
        '<button class="btn btn-secondary btn-sm order-delete-btn" data-id="' + o.id + '" type="button">删除</button>' +
      '</div>' +
    '</div>';
  }

  function renderPagination(el, pageData) {
    var totalPages = pageData.totalPages || 0;
    if (totalPages <= 1) {
      el.classList.add('hidden');
      return;
    }
    el.classList.remove('hidden');
    var curPage = pageData.number || 0;
    var prevDisabled = curPage <= 0 ? ' disabled' : '';
    var nextDisabled = curPage >= totalPages - 1 ? ' disabled' : '';
    el.innerHTML =
      '<button class="btn btn-secondary btn-sm" id="order-prev-btn"' + prevDisabled + ' type="button">← 上一页</button>' +
      '<span class="pagination-info">' + (curPage + 1) + ' / ' + totalPages + '</span>' +
      '<button class="btn btn-secondary btn-sm" id="order-next-btn"' + nextDisabled + ' type="button">下一页 →</button>';

    var prevBtn = document.getElementById('order-prev-btn');
    var nextBtn = document.getElementById('order-next-btn');
    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        if (curPage > 0) loadOrderList(curPage - 1, currentKeyword);
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        if (curPage < totalPages - 1) loadOrderList(curPage + 1, currentKeyword);
      });
    }
  }

  /* ===== Search ===== */

  function initSearch() {
    var searchBtn = document.getElementById('order-search-btn');
    var searchInput = document.getElementById('order-search-input');
    if (searchBtn) {
      searchBtn.addEventListener('click', function () {
        var kw = searchInput ? searchInput.value.trim() : '';
        loadOrderList(0, kw);
      });
    }
    if (searchInput) {
      searchInput.addEventListener('keyup', function (e) {
        if (e.keyCode === 13) {
          loadOrderList(0, searchInput.value.trim());
        }
      });
    }
  }

  /* ===== Order Detail ===== */

  function bindDetailButtons() {
    var btns = document.querySelectorAll('.order-detail-btn');
    for (var i = 0; i < btns.length; i++) {
      btns[i].addEventListener('click', function () {
        var id = this.getAttribute('data-id');
        showOrderDetail(id);
      });
    }
    var delBtns = document.querySelectorAll('.order-delete-btn');
    for (var j = 0; j < delBtns.length; j++) {
      delBtns[j].addEventListener('click', function () {
        var id = this.getAttribute('data-id');
        deleteOrder(id);
      });
    }
  }

  function showOrderDetail(id) {
    App.api('GET', '/api/orders/' + id)
      .then(function (res) {
        var o = res.data;
        var lunarStr = '';
        if (o.orderDate && window.Lunar) {
          lunarStr = Lunar.toLunar(o.orderDate);
          if (lunarStr) lunarStr = '（' + lunarStr + '）';
        }
        var html =
          '<div class="detail-row"><span class="detail-label">客户姓名</span><span class="detail-value">' + escapeHtml(o.customerName) + '</span></div>' +
          '<div class="detail-row"><span class="detail-label">手机号</span><span class="detail-value">' + escapeHtml(o.phone) + '</span></div>' +
          '<div class="detail-row"><span class="detail-label">订购日期</span><span class="detail-value">' + App.formatDate(o.orderDate) + ' <span style="color:#6C5CE7;">' + lunarStr + '</span></span></div>' +
          '<div class="detail-row"><span class="detail-label">价格</span><span class="detail-value">¥' + (o.price || 0) + '</span></div>' +
          '<div class="detail-row"><span class="detail-label">收货地址</span><span class="detail-value">' + escapeHtml(o.address || '') + '</span></div>' +
          '<div class="detail-row"><span class="detail-label">备注</span><span class="detail-value">' + escapeHtml(o.remark || '-') + '</span></div>' +
          '<div class="detail-row"><span class="detail-label">创建时间</span><span class="detail-value">' + App.formatDateTime(o.createdAt) + '</span></div>' +
          '<div class="detail-row"><span class="detail-label">更新时间</span><span class="detail-value">' + App.formatDateTime(o.updatedAt) + '</span></div>';
        document.getElementById('order-detail-content').innerHTML = html;
        App.navigateTo('order-detail');
      })
      .catch(function () {
        App.showToast('加载订单详情失败');
      });
  }

  function initDetailBack() {
    var backBtn = document.getElementById('order-detail-back');
    if (backBtn) {
      backBtn.addEventListener('click', function () {
        App.navigateTo('order-list');
      });
    }
  }

  /* ===== Delete Order ===== */

  function deleteOrder(id) {
    if (!confirm('确认删除该订单？')) return;
    App.api('DELETE', '/api/orders/' + id)
      .then(function () {
        App.showToast('删除成功');
        loadOrderList(currentPage, currentKeyword);
      })
      .catch(function () {
        App.showToast('删除失败');
      });
  }

  /* ===== Order Form ===== */

  function initOrderForm() {
    var form = document.getElementById('order-form');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      clearFormErrors(form);

      var data = {
        customerName: form.customerName.value.trim(),
        phone: form.phone.value.trim(),
        orderDate: form.orderDate.value,
        price: form.price.value ? parseFloat(form.price.value) : null,
        address: form.address.value.trim(),
        remark: form.remark.value.trim()
      };

      // Client-side validation
      var errors = validateOrder(data);
      if (errors.length > 0) {
        showFormErrors(form, errors);
        return;
      }

      App.api('POST', '/api/orders', data)
        .then(function () {
          App.showToast('订单创建成功');
          form.reset();
          App.navigateTo('order-list');
          loadOrderList(0, '');
        })
        .catch(function (err) {
          if (err && err.status === 400) {
            App.showToast(err.message || '请检查输入');
          } else {
            App.showToast('创建订单失败');
          }
        });
    });
  }

  function validateOrder(data) {
    var errors = [];
    if (!data.customerName) errors.push({ field: 'customerName', msg: '客户姓名不能为空' });
    if (!data.phone) {
      errors.push({ field: 'phone', msg: '手机号不能为空' });
    } else if (!/^1[3-9]\d{9}$/.test(data.phone)) {
      errors.push({ field: 'phone', msg: '手机号格式不正确' });
    }
    if (!data.cakeType) data.cakeType = '-';
    if (!data.orderDate) errors.push({ field: 'orderDate', msg: '订购日期不能为空' });
    if (data.price === null || data.price === undefined || data.price < 0.01) {
      errors.push({ field: 'price', msg: '价格必须大于0' });
    }
    return errors;
  }

  function showFormErrors(form, errors) {
    for (var i = 0; i < errors.length; i++) {
      var input = form.querySelector('[name="' + errors[i].field + '"]');
      if (input) {
        input.classList.add('error');
        var errEl = document.createElement('div');
        errEl.className = 'form-error';
        errEl.textContent = errors[i].msg;
        input.parentNode.appendChild(errEl);
      }
    }
  }

  function clearFormErrors(form) {
    var errEls = form.querySelectorAll('.form-error');
    for (var i = 0; i < errEls.length; i++) {
      errEls[i].parentNode.removeChild(errEls[i]);
    }
    var inputs = form.querySelectorAll('.error');
    for (var j = 0; j < inputs.length; j++) {
      inputs[j].classList.remove('error');
    }
  }

  /* ===== Utility ===== */

  function escapeHtml(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  /* ===== Init ===== */

  function init() {
    initSearch();
    initOrderForm();
    initDetailBack();
    // Load order list on first visit
    loadOrderList(0, '');
  }

  // Expose for external use
  window.OrderModule = {
    loadOrderList: loadOrderList,
    init: init
  };

  document.addEventListener('DOMContentLoaded', init);
})();
