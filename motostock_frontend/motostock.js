/* =========================================================
   MotoStock — navegacao + integracao com o backend
   Coloque este arquivo na RAIZ da pasta motostock_frontend
   e inclua em cada tela, antes de </body>:
       <script src="../motostock.js"></script>
   ========================================================= */
(function () {
  'use strict';

  /* ============ CONFIGURACAO (ajuste conforme seu backend) ============ */
  var CONFIG = {
    apiBase: 'http://localhost:3333/api',
    endpoints: {
      stockList:     '/stock',                // GET  -> lista de itens (overview)  [confirmado]
      stockSummary:  '/stock/summary',        // GET  -> KPIs do estoque            [confirmado]
      movementEntry: '/movements/entry',      // POST -> registrar entrada          [confirmado]
      movementExit:  '/movements/exit',       // POST -> registrar saida            [confirmado]
      movementAdjust:'/movements/adjustment'  // POST -> ajuste de inventario       [confirmado]
    },
    // ===== LOGIN (as rotas exigem token JWT; o token vem da tela login.html) =====
    auth: {
      loginPath: '/auth/login',        // endpoint usado pela tela de login
      tokenField: 'accessToken',       // onde o token vem na resposta do login
      tokenStorageKey: 'motostock_token',
      userStorageKey: 'motostock_user',
      loginPage: '../login.html'       // pagina de login (relativa as telas em subpastas)
    },
    // Se os nomes dos campos que a API devolve forem outros, mapeie aqui:
    fields: {
      id:          ['id'],
      sku:         ['sku'],
      name:        ['name'],
      category:    ['categoryName', 'category'],
      brand:       ['brand'],
      location:    ['location'],
      quantity:    ['currentStock', 'quantity', 'stock'],
      minQuantity: ['minStock', 'minQuantity'],
      unitCost:    ['costPrice', 'unitCost', 'cost'],
      image:       ['imageUrl', 'image']
    }
  };

  // Para onde cada item do menu lateral (data-path) deve navegar.
  // Caminhos relativos: cada tela fica em uma pasta motostock_* irma.
  var ROUTES = {
    dashboard:     '../motostock_dashboard/code.html',
    produtos:      '../motostock_produtos/code.html',
    estoque:       '../motostock_controle_de_estoque/code.html',
    movimentacoes: '../motostock_controle_de_estoque/code.html'
  };

  /* ============ autenticacao ============ */
  var _token = null;
  function getToken() {
    if (_token) return _token;
    try { _token = localStorage.getItem(CONFIG.auth.tokenStorageKey); } catch (e) {}
    return _token;
  }
  function setToken(t) {
    _token = t;
    try { localStorage.setItem(CONFIG.auth.tokenStorageKey, t); } catch (e) {}
  }
  function clearToken() {
    _token = null;
    try {
      localStorage.removeItem(CONFIG.auth.tokenStorageKey);
      localStorage.removeItem(CONFIG.auth.userStorageKey);
    } catch (e) {}
  }
  function currentUser() {
    try { return JSON.parse(localStorage.getItem(CONFIG.auth.userStorageKey) || 'null'); }
    catch (e) { return null; }
  }
  function redirectToLogin() {
    var next = encodeURIComponent(location.pathname + location.search);
    location.href = CONFIG.auth.loginPage + '?next=' + next;
  }
  // Portao de autenticacao: sem token, manda para a tela de login.
  function requireAuth() {
    if (getToken()) return true;
    redirectToLogin();
    return false;
  }
  window.motostockLogout = function () {
    clearToken();
    redirectToLogin();
  };
  function wireUser() {
    var u = currentUser();
    if (u) {
      document.querySelectorAll('[data-user-name]').forEach(function (n) { n.textContent = u.name || u.email || ''; });
      document.querySelectorAll('[data-user-email]').forEach(function (n) { n.textContent = u.email || ''; });
      document.querySelectorAll('[data-user-role]').forEach(function (n) { n.textContent = u.role || ''; });
    }
    document.querySelectorAll('[data-logout]').forEach(function (b) {
      b.addEventListener('click', function (e) { e.preventDefault(); window.motostockLogout(); });
    });
  }

  /* ============ utilitarios ============ */
  function api(path, options) {
    options = options || {};
    var headers = Object.assign({ 'Content-Type': 'application/json' }, options.headers || {});
    if (!options._noauth) {
      var tk = getToken();
      if (tk) headers['Authorization'] = 'Bearer ' + tk;
    }
    return fetch(CONFIG.apiBase + path, Object.assign({}, options, { headers: headers })).then(function (r) {
      if (r.status === 401 && !options._noauth) {
        clearToken();
        redirectToLogin();
        throw new Error('Sessao expirada. Faca login novamente.');
      }
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.status === 204 ? null : r.json();
    });
  }
  function toast(msg, isError) {
    if (typeof window.triggerToast === 'function') return window.triggerToast(msg, !!isError);
    (isError ? console.error : console.log)('[MotoStock] ' + msg);
  }
  function brl(n) {
    return 'R$ ' + Number(n || 0).toLocaleString('pt-BR',
      { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  function f(item, key) {
    if (!item) return undefined;
    var keys = CONFIG.fields[key];
    if (!keys) return item[key];
    for (var i = 0; i < keys.length; i++) {
      if (item[keys[i]] != null) return item[keys[i]];
    }
    // categoria pode vir aninhada como objeto { name }
    if (key === 'category' && item.category && typeof item.category === 'object') {
      return item.category.name;
    }
    return undefined;
  }

  // indices para converter SKU/nome -> productId (a API exige UUID nos movimentos)
  var _bySku = {}, _byName = {};
  function isUuid(v) {
    return typeof v === 'string' &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
  }
  function resolveProductId(v) {
    if (isUuid(v)) return v;
    if (v == null) return null;
    var key = String(v).trim();
    return _bySku[key] || _byName[key.toLowerCase()] || null;
  }
  function statusOf(qty, min) {
    if (qty <= 0) return 'Zerado';
    if (qty < min) return 'Baixo';
    return 'Normal';
  }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  /* ============ navegacao do menu lateral ============ */
  function initNav() {
    document.querySelectorAll('[data-path]').forEach(function (a) {
      var key = a.getAttribute('data-path');
      if (ROUTES[key]) {
        a.setAttribute('href', ROUTES[key]);
      } else {
        a.addEventListener('click', function (e) {
          e.preventDefault();
          toast('A tela "' + key + '" ainda nao foi criada.', true);
        });
      }
    });
  }

  /* ============ tela de ESTOQUE: montar a tabela ============ */
  function buildRow(item) {
    var sku = f(item, 'sku') || '';
    var name = f(item, 'name') || '';
    var category = f(item, 'category') || '';
    var brand = f(item, 'brand') || '';
    var location = f(item, 'location') || '';
    var qty = Number(f(item, 'quantity')) || 0;
    var min = Number(f(item, 'minQuantity')) || 0;
    var cost = Number(f(item, 'unitCost')) || 0;
    var img = f(item, 'image') || '';
    var st = statusOf(qty, min);
    var pct = min > 0 ? Math.min(100, Math.round((qty / (min * 3)) * 100)) : (qty > 0 ? 100 : 0);
    var barColor = st === 'Normal' ? 'bg-tertiary' : (st === 'Baixo' ? 'bg-surface-tint' : 'bg-error');
    var qtyColor = st === 'Normal' ? 'text-on-surface' : (st === 'Baixo' ? 'text-surface-tint' : 'text-error');

    var tr = el('tr', 'hover:bg-surface-container-low/50 transition-colors group' + (st === 'Zerado' ? ' bg-error-container/10' : ''));
    tr.setAttribute('data-category', category);
    tr.setAttribute('data-loc', location);
    tr.setAttribute('data-status', st);

    // 1) produto + sku
    var tdProd = el('td', 'py-3 px-space-md');
    var wrap = el('div', 'flex items-center gap-space-sm');
    var image = el('img', 'w-10 h-10 rounded object-cover bg-surface-container');
    if (img) image.src = img;
    var info = el('div', 'flex flex-col');
    info.appendChild(el('span', 'font-body-md text-body-md font-semibold text-on-surface', name));
    info.appendChild(el('span', 'font-code-sm text-code-sm text-secondary', 'SKU: ' + sku));
    wrap.appendChild(image); wrap.appendChild(info); tdProd.appendChild(wrap);

    // 2) categoria / marca
    var tdCat = el('td', 'py-3 px-space-md');
    var cw = el('div', 'flex flex-col');
    cw.appendChild(el('span', 'font-body-sm text-body-sm font-medium text-on-surface', category));
    cw.appendChild(el('span', 'font-label-sm text-label-sm text-secondary', brand));
    tdCat.appendChild(cw);

    // 3) localizacao
    var tdLoc = el('td', 'py-3 px-space-md');
    tdLoc.appendChild(el('span', 'inline-flex items-center gap-1 font-code-sm text-code-sm px-2.5 py-1 rounded bg-surface-container text-on-surface font-medium', location));

    // 4) nivel fisico vs minimo
    var tdLvl = el('td', 'py-3 px-space-md min-w-[150px]');
    var lw = el('div', 'flex flex-col gap-1');
    var lrow = el('div', 'flex justify-between items-center font-code-sm text-code-sm');
    lrow.appendChild(el('span', 'font-bold ' + qtyColor, qty + ' un.'));
    lrow.appendChild(el('span', 'text-secondary', 'Min: ' + min + ' un.'));
    var bar = el('div', 'w-full bg-surface-container rounded-full h-1.5 overflow-hidden');
    var fill = el('div', barColor + ' h-1.5 rounded-full');
    fill.style.width = pct + '%';
    bar.appendChild(fill); lw.appendChild(lrow); lw.appendChild(bar); tdLvl.appendChild(lw);

    // 5) custo unit / total
    var tdCost = el('td', 'py-3 px-space-md text-right font-code-sm text-code-sm');
    tdCost.appendChild(el('span', 'font-semibold text-on-surface block', brl(cost)));
    tdCost.appendChild(el('span', 'text-secondary text-body-sm', brl(cost * qty)));

    // 6) status
    var tdSt = el('td', 'py-3 px-space-md text-center');
    var badgeCls = st === 'Normal'
      ? 'bg-on-tertiary-container/40 text-tertiary'
      : (st === 'Baixo' ? 'bg-error-container/80 text-primary-container' : 'bg-error text-on-error');
    tdSt.appendChild(el('span', 'inline-flex items-center gap-1 font-label-sm text-label-sm px-2.5 py-1 rounded-full font-bold ' + badgeCls,
      st === 'Normal' ? 'Em Estoque' : (st === 'Baixo' ? 'Estoque Baixo' : 'Ruptura (0)')));

    // 7) acoes
    var tdAct = el('td', 'py-3 px-space-md text-right');
    var aw = el('div', 'flex items-center justify-end gap-1');
    var bIn = el('button', 'h-7 px-2 bg-tertiary/10 text-tertiary hover:bg-tertiary hover:text-on-tertiary rounded text-label-sm font-label-sm font-semibold transition-colors', '+ Entrada');
    bIn.type = 'button';
    bIn.addEventListener('click', function () { if (window.quickEntry) window.quickEntry(sku, name, cost); });
    var bOut = el('button', 'h-7 px-2 bg-error-container/60 text-error hover:bg-primary-container hover:text-on-primary-container rounded text-label-sm font-label-sm font-semibold transition-colors', '- Baixa');
    bOut.type = 'button';
    if (qty <= 0) { bOut.disabled = true; bOut.className = 'h-7 px-2 bg-surface-container text-secondary opacity-40 rounded text-label-sm font-label-sm cursor-not-allowed'; }
    else bOut.addEventListener('click', function () { if (window.quickExit) window.quickExit(sku, name, qty); });
    var bH = el('button', 'h-7 w-7 flex items-center justify-center text-secondary hover:text-on-surface rounded hover:bg-surface-container');
    bH.type = 'button';
    bH.appendChild(el('span', 'material-symbols-outlined text-sm', 'history'));
    bH.addEventListener('click', function () { if (window.openHistory) window.openHistory(sku); });
    aw.appendChild(bIn); aw.appendChild(bOut); aw.appendChild(bH); tdAct.appendChild(aw);

    tr.appendChild(tdProd); tr.appendChild(tdCat); tr.appendChild(tdLoc);
    tr.appendChild(tdLvl); tr.appendChild(tdCost); tr.appendChild(tdSt); tr.appendChild(tdAct);
    return tr;
  }

  function renderStock(items) {
    var tbody = document.getElementById('stock-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';
    _bySku = {}; _byName = {};
    items.forEach(function (it) {
      var id = f(it, 'id'), sku = f(it, 'sku'), nm = f(it, 'name');
      if (id && sku) _bySku[String(sku).trim()] = id;
      if (id && nm) _byName[String(nm).trim().toLowerCase()] = id;
      tbody.appendChild(buildRow(it));
    });
    var count = document.getElementById('table-row-count');
    if (count) count.innerText = items.length + ' itens listados';
    if (typeof window.filterStockTable === 'function') window.filterStockTable();
  }

  function loadStock() {
    var tbody = document.getElementById('stock-table-body');
    if (!tbody) return; // nao estamos na tela de estoque
    api(CONFIG.endpoints.stockList)
      .then(function (data) {
        var items = Array.isArray(data) ? data : (data && (data.items || data.data)) || [];
        if (items.length) {
          renderStock(items);
          toast('Estoque carregado do servidor (' + items.length + ' itens).');
        } else {
          toast('A API respondeu sem itens; mantendo dados de exemplo.', true);
        }
      })
      .catch(function (err) {
        console.warn('[MotoStock] Falha ao buscar estoque:', err);
        toast('Sem conexao com o backend; exibindo dados de exemplo.', true);
      });
  }

  /* ============ modais -> gravar no backend ============ */
  function wireModals() {
    var origEntry = window.confirmStockEntry;
    var origExit = window.confirmStockExit;
    var origAdjust = window.confirmStockAdjustment;

    var EXIT_REASONS = {
      'venda': 'VENDA', 'perda': 'PERDA', 'avaria': 'AVARIA',
      'uso interno': 'USO_INTERNO', 'uso_interno': 'USO_INTERNO', 'outro': 'OUTRO'
    };
    function normReason(v) {
      if (!v) return 'OUTRO';
      var k = String(v).trim().toLowerCase();
      if (EXIT_REASONS[k]) return EXIT_REASONS[k];
      var up = String(v).trim().toUpperCase();
      return ['VENDA', 'PERDA', 'AVARIA', 'USO_INTERNO', 'OUTRO'].indexOf(up) >= 0 ? up : 'OUTRO';
    }

    // ENTRADA -> POST /movements/entry  { items:[{productId,quantity,unitCost?}], invoiceNumber? }
    window.confirmStockEntry = function () {
      var rows = Array.prototype.slice.call(document.querySelectorAll('#entry-items-body tr'));
      var items = [], missing = [];
      rows.forEach(function (row) {
        var cells = row.querySelectorAll('td');
        var sku = cells[1] ? cells[1].innerText.trim() : '';
        var qty = parseFloat((row.querySelector('.entry-qty') || {}).value) || 0;
        var cost = parseFloat((row.querySelector('.entry-cost') || {}).value);
        if (!sku || qty <= 0) return;
        var pid = resolveProductId(sku);
        if (!pid) { missing.push(sku); return; }
        var it = { productId: pid, quantity: Math.round(qty) };
        if (!isNaN(cost)) it.unitCost = cost;
        items.push(it);
      });
      if (missing.length) { toast('Produto(s) fora do estoque carregado: ' + missing.join(', '), true); return; }
      if (!items.length) { toast('Nenhum item valido para registrar.', true); return; }
      var body = { items: items };
      var inv = (document.getElementById('entry-invoice') || {}).value;
      if (inv && inv.trim()) body.invoiceNumber = inv.trim();
      api(CONFIG.endpoints.movementEntry, { method: 'POST', body: JSON.stringify(body) })
        .then(function () { if (origEntry) origEntry(); else toast('Entrada registrada!'); loadStock(); })
        .catch(function (e) { console.error(e); toast('Erro ao registrar a entrada no servidor.', true); });
    };

    // SAIDA -> POST /movements/exit  { reason, items:[{productId,quantity}] }
    window.confirmStockExit = function () {
      var sel = document.getElementById('modal-exit-product');
      var reasonEl = document.getElementById('modal-exit-reason');
      var pid = resolveProductId(sel ? sel.value : '');
      var qty = parseInt((document.getElementById('modal-exit-qty') || {}).value, 10) || 0;
      if (!pid) { toast('Produto nao encontrado no estoque carregado.', true); return; }
      if (qty <= 0) { toast('Informe uma quantidade valida.', true); return; }
      var body = { reason: normReason(reasonEl ? reasonEl.value : ''), items: [{ productId: pid, quantity: qty }] };
      api(CONFIG.endpoints.movementExit, { method: 'POST', body: JSON.stringify(body) })
        .then(function () { if (origExit) origExit(); else toast('Saida registrada!'); loadStock(); })
        .catch(function (e) { console.error(e); toast('Erro ao registrar a saida no servidor.', true); });
    };

    // AJUSTE -> POST /movements/adjustment  { items:[{productId,newStock}], observation? }
    window.confirmStockAdjustment = function () {
      var sel = document.getElementById('modal-adjust-product');
      var notes = (document.getElementById('adjust-notes') || {}).value;
      var real = parseInt((document.getElementById('adjust-real-count') || {}).value, 10);
      var pid = resolveProductId(sel ? sel.value : '');
      if (!pid) { toast('Produto nao encontrado no estoque carregado.', true); return; }
      if (isNaN(real) || real < 0) { toast('Informe a contagem real (>= 0).', true); return; }
      var body = { items: [{ productId: pid, newStock: real }] };
      if (notes && notes.trim()) body.observation = notes.trim();
      api(CONFIG.endpoints.movementAdjust, { method: 'POST', body: JSON.stringify(body) })
        .then(function () { if (origAdjust) origAdjust(); else toast('Ajuste salvo!'); loadStock(); })
        .catch(function (e) { console.error(e); toast('Erro ao salvar o ajuste no servidor.', true); });
    };
  }


  document.addEventListener('DOMContentLoaded', function () {
    if (!requireAuth()) return;   // sem token -> vai para a tela de login
    wireUser();
    initNav();
    wireModals();
    loadStock();
  });
})();
