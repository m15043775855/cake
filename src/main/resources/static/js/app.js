/**
 * 蛋糕OA系统 - 公共 JS 工具
 */
(function () {
  'use strict';

  /* ===== Loading Indicator ===== */
  const loading = {
    _el: null,
    _count: 0,
    _getEl() {
      if (!this._el) {
        this._el = document.getElementById('loading-overlay');
      }
      return this._el;
    },
    show() {
      this._count++;
      const el = this._getEl();
      if (el) el.classList.add('show');
    },
    hide() {
      this._count = Math.max(0, this._count - 1);
      if (this._count === 0) {
        const el = this._getEl();
        if (el) el.classList.remove('show');
      }
    }
  };

  /* ===== Toast ===== */
  let toastTimer = null;
  function showToast(msg, duration) {
    duration = duration || 2000;
    let el = document.getElementById('toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'toast';
      el.className = 'toast';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      el.classList.remove('show');
    }, duration);
  }

  /* ===== API Helper ===== */
  function api(method, url, body) {
    loading.show();
    var opts = {
      method: method,
      headers: { 'Content-Type': 'application/json' }
    };
    if (body !== undefined && body !== null) {
      opts.body = JSON.stringify(body);
    }
    return fetch(url, opts)
      .then(function (res) {
        loading.hide();
        if (res.status === 204) return null;
        return res.json().then(function (data) {
          if (!res.ok) {
            var errMsg = (data && data.message) ? data.message : '请求失败';
            throw { status: res.status, message: errMsg, data: data };
          }
          return data;
        });
      })
      .catch(function (err) {
        loading.hide();
        if (err && err.status) throw err;
        showToast('网络错误，请稍后重试');
        throw err;
      });
  }

  /* ===== Navigation / Router ===== */
  var currentView = '';

  function navigateTo(viewName) {
    // Hide all views
    var views = document.querySelectorAll('.view');
    for (var i = 0; i < views.length; i++) {
      views[i].classList.add('hidden');
    }
    // Show target view
    var target = document.getElementById('view-' + viewName);
    if (target) {
      target.classList.remove('hidden');
    }
    // Update tab bar active state
    var tabs = document.querySelectorAll('.tab-item');
    for (var j = 0; j < tabs.length; j++) {
      tabs[j].classList.remove('active');
      if (tabs[j].getAttribute('data-view') === viewName) {
        tabs[j].classList.add('active');
      }
    }
    currentView = viewName;
    window.location.hash = viewName;
  }

  function initRouter() {
    // Tab bar click handlers
    var tabs = document.querySelectorAll('.tab-item');
    for (var i = 0; i < tabs.length; i++) {
      tabs[i].addEventListener('click', function (e) {
        e.preventDefault();
        var view = this.getAttribute('data-view');
        if (view) navigateTo(view);
      });
    }
    // Handle hash on load
    var hash = window.location.hash.replace('#', '');
    var validViews = ['order-list', 'order-create', 'revisit-list'];
    if (validViews.indexOf(hash) !== -1) {
      navigateTo(hash);
    } else {
      navigateTo('order-list');
    }
  }

  /* ===== Date Formatting ===== */
  function formatDate(dateStr) {
    if (!dateStr) return '-';
    return dateStr.substring(0, 10);
  }

  function formatDateTime(dtStr) {
    if (!dtStr) return '-';
    if (dtStr.length >= 16) return dtStr.substring(0, 16).replace('T', ' ');
    return dtStr;
  }

  /* ===== Login ===== */
  var AUTH_KEY = 'cake_auth';

  function checkLogin() {
    return sessionStorage.getItem(AUTH_KEY) === 'ok';
  }

  function showApp() {
    var overlay = document.getElementById('login-overlay');
    if (overlay) {
      overlay.style.display = 'none';
    }
  }

  function initLogin() {
    if (checkLogin()) {
      showApp();
      return;
    }
    // Show login overlay
    var overlay = document.getElementById('login-overlay');
    if (overlay) overlay.style.display = 'flex';

    var form = document.getElementById('login-form');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var user = document.getElementById('login-user').value.trim();
      var pass = document.getElementById('login-pass').value;
      var errEl = document.getElementById('login-error');
      if (user === 'admin' && simpleHash(pass) === 'e36745') {
        sessionStorage.setItem(AUTH_KEY, 'ok');
        showApp();
      } else {
        errEl.style.display = 'block';
      }
    });
  }

  function simpleHash(str) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
      var c = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + c;
      hash |= 0;
    }
    return (hash >>> 0).toString(16).substring(0, 6);
  }

  /* ===== Expose Public API ===== */
  window.App = {
    loading: loading,
    showToast: showToast,
    api: api,
    navigateTo: navigateTo,
    initRouter: initRouter,
    initLogin: initLogin,
    formatDate: formatDate,
    formatDateTime: formatDateTime
  };
})();
