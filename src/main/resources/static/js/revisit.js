/**
 * 蛋糕OA系统 - 回访任务模块
 */
(function () {
  'use strict';

  var PAGE_SIZE = 10;
  var currentPage = 0;
  var currentStatus = '';
  var currentWithinDays = null;

  /* ===== Revisit List ===== */

  function loadRevisitList(page, status, withinDays) {
    if (page === undefined || page === null) page = 0;
    if (status === undefined) status = '';
    if (withinDays === undefined) withinDays = null;
    currentPage = page;
    currentStatus = status;
    currentWithinDays = withinDays;

    var url = '/api/revisits?page=' + page + '&size=' + PAGE_SIZE;
    if (status) {
      url += '&status=' + encodeURIComponent(status);
    }
    if (withinDays && withinDays > 0) {
      url += '&withinDays=' + withinDays;
    }

    App.api('GET', url)
      .then(function (res) {
        var pageData = res.data;
        var list = pageData.content || [];
        var container = document.getElementById('revisit-list-content');
        var emptyEl = document.getElementById('revisit-list-empty');
        var pagEl = document.getElementById('revisit-list-pagination');

        if (list.length === 0) {
          container.innerHTML = '';
          emptyEl.classList.remove('hidden');
          pagEl.classList.add('hidden');
          return;
        }

        emptyEl.classList.add('hidden');
        var html = '';
        for (var i = 0; i < list.length; i++) {
          html += renderRevisitCard(list[i]);
        }
        container.innerHTML = html;
        renderPagination(pagEl, pageData);
        bindCompleteButtons();
      })
      .catch(function () {
        App.showToast('加载回访任务列表失败');
      });
  }

  function renderRevisitCard(task) {
    var isPending = task.status === 'PENDING';
    var statusText = isPending ? '待处理' : '已完成';
    var statusClass = isPending ? 'status-pending' : 'status-completed';

    // 计算距回访日还有几天
    var daysLeft = '';
    if (task.revisitDate) {
      var today = new Date();
      today.setHours(0, 0, 0, 0);
      var rDate = new Date(task.revisitDate.substring(0, 10) + 'T00:00:00');
      var diff = Math.ceil((rDate - today) / 86400000);
      if (diff > 0) {
        daysLeft = '<span style="color:#fa8c16;font-weight:600;">⏳ 距回访日还有 ' + diff + ' 天</span>';
      } else if (diff === 0) {
        daysLeft = '<span style="color:#ee5a24;font-weight:600;">🔥 今天需要回访</span>';
      } else {
        daysLeft = '<span style="color:#ff4d4f;font-weight:600;">⚠️ 已超期 ' + Math.abs(diff) + ' 天</span>';
      }
    }

    // 原订购日期农历
    var orderLunarStr = '';
    if (task.originalOrderDate && window.Lunar) {
      orderLunarStr = Lunar.toLunar(task.originalOrderDate);
      if (orderLunarStr) orderLunarStr = '（' + orderLunarStr + '）';
    }

    // 回访日期农历
    var lunarStr = '';
    if (task.revisitDate && window.Lunar) {
      lunarStr = Lunar.toLunar(task.revisitDate);
      if (lunarStr) lunarStr = '（' + lunarStr + '）';
    }

    var html = '<div class="card">' +
      '<div class="card-title">' +
        escapeHtml(task.customerName) +
        ' <span class="status-badge ' + statusClass + '">' + statusText + '</span>' +
      '</div>' +
      '<div class="card-meta">' +
        '📱 ' + escapeHtml(task.phone) + '<br>' +
        '📅 原订购：' + App.formatDate(task.originalOrderDate) + ' <span style="color:#6C5CE7;">' + orderLunarStr + '</span><br>' +
        '🔔 回访日：' + App.formatDate(task.revisitDate) + ' <span style="color:#6C5CE7;">' + lunarStr + '</span><br>' +
        daysLeft +
      '</div>';

    if (isPending) {
      html += '<div class="card-actions">' +
        '<button class="btn btn-success btn-sm revisit-complete-btn" data-id="' + task.id + '" type="button">✓ 标记完成</button>' +
      '</div>';
    } else {
      html += '<div class="card-meta" style="margin-top:6px;">' +
        '✅ 完成时间：' + App.formatDateTime(task.completedAt) +
      '</div>';
    }

    html += '</div>';
    return html;
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
      '<button class="btn btn-secondary btn-sm" id="revisit-prev-btn"' + prevDisabled + ' type="button">← 上一页</button>' +
      '<span class="pagination-info">' + (curPage + 1) + ' / ' + totalPages + '</span>' +
      '<button class="btn btn-secondary btn-sm" id="revisit-next-btn"' + nextDisabled + ' type="button">下一页 →</button>';

    var prevBtn = document.getElementById('revisit-prev-btn');
    var nextBtn = document.getElementById('revisit-next-btn');
    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        if (curPage > 0) loadRevisitList(curPage - 1, currentStatus, currentWithinDays);
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        if (curPage < totalPages - 1) loadRevisitList(curPage + 1, currentStatus, currentWithinDays);
      });
    }
  }

  /* ===== Filter Tabs ===== */

  function initFilterTabs() {
    var tabs = document.querySelectorAll('.filter-tab');
    for (var i = 0; i < tabs.length; i++) {
      tabs[i].addEventListener('click', function () {
        var allTabs = document.querySelectorAll('.filter-tab');
        for (var j = 0; j < allTabs.length; j++) {
          allTabs[j].classList.remove('active');
        }
        this.classList.add('active');
        var status = this.getAttribute('data-status') || '';
        loadRevisitList(0, status, currentWithinDays);
      });
    }
  }

  /* ===== Days Filter ===== */

  function initDaysFilter() {
    var daysBtn = document.getElementById('revisit-days-btn');
    var daysClear = document.getElementById('revisit-days-clear');
    var daysInput = document.getElementById('revisit-days-input');

    if (daysBtn) {
      daysBtn.addEventListener('click', function () {
        var days = daysInput ? parseInt(daysInput.value, 10) : null;
        if (!days || days <= 0) {
          App.showToast('请输入有效天数');
          return;
        }
        loadRevisitList(0, currentStatus, days);
      });
    }

    if (daysClear) {
      daysClear.addEventListener('click', function () {
        if (daysInput) daysInput.value = '';
        currentWithinDays = null;
        loadRevisitList(0, currentStatus, null);
      });
    }

    if (daysInput) {
      daysInput.addEventListener('keyup', function (e) {
        if (e.keyCode === 13) {
          var days = parseInt(daysInput.value, 10);
          if (days && days > 0) {
            loadRevisitList(0, currentStatus, days);
          }
        }
      });
    }
  }

  /* ===== Mark Complete ===== */

  function bindCompleteButtons() {
    var btns = document.querySelectorAll('.revisit-complete-btn');
    for (var i = 0; i < btns.length; i++) {
      btns[i].addEventListener('click', function () {
        var id = this.getAttribute('data-id');
        completeTask(id);
      });
    }
  }

  function completeTask(id) {
    if (!confirm('确认标记该回访任务为已完成？')) return;
    App.api('PUT', '/api/revisits/' + id + '/complete')
      .then(function () {
        App.showToast('标记完成');
        loadRevisitList(currentPage, currentStatus, currentWithinDays);
      })
      .catch(function () {
        App.showToast('操作失败');
      });
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
    initFilterTabs();
    initDaysFilter();
    loadRevisitList(0, '');
  }

  window.RevisitModule = {
    loadRevisitList: loadRevisitList,
    init: init
  };

  document.addEventListener('DOMContentLoaded', init);
})();
