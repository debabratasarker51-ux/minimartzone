/**
 * MiniMart Zone — data/products.json · WhatsApp & fees from js/config.js
 */
(function () {
  "use strict";

  var CFG = typeof window !== "undefined" && window.MiniMartConfig ? window.MiniMartConfig : {};
  var WHATSAPP_NUMBER = String(CFG.whatsappNumber || "8801733488751").replace(/\D/g, "");
  var DELIVERY_INSIDE = Number(CFG.deliveryFeeInsideBdt) || 60;
  var DELIVERY_OUTSIDE = Number(CFG.deliveryFeeOutsideBdt) || 120;
  var OUTSIDE_AREA_VALUE =
    String(CFG.outsideDeliveryAreaValue || "Other (Rajshahi — outside listed zones)").trim() ||
    "Other (Rajshahi — outside listed zones)";
  var INSIDE_AREAS =
    Array.isArray(CFG.insideDeliveryAreas) && CFG.insideDeliveryAreas.length
      ? CFG.insideDeliveryAreas.map(function (a) {
          return String(a).trim();
        })
      : ["Shaheb Bazar", "Laxmipur", "Kazla"];

  var PRODUCTS_URL = "data/products.json";

  var header = document.getElementById("siteHeader");
  var modal = document.getElementById("orderModal");
  var form = document.getElementById("orderForm");
  var productInput = document.getElementById("orderProduct");
  var unitPriceInput = document.getElementById("orderUnitPriceBdt");
  var quantityInput = document.getElementById("orderQuantity");
  var orderSummary = document.getElementById("orderSummary");
  var areaSelect = document.getElementById("orderArea");
  var searchInput = document.getElementById("productSearch");
  var productGrid = document.getElementById("productGrid");
  var emptyState = document.getElementById("shopEmpty");
  var filterWrap = document.getElementById("shopFilters");

  var activeCategory = "all";

  function deliveryFeeBdtForArea(area) {
    var a = String(area || "").trim();
    if (a === OUTSIDE_AREA_VALUE) return DELIVERY_OUTSIDE;
    if (INSIDE_AREAS.indexOf(a) !== -1) return DELIVERY_INSIDE;
    return DELIVERY_INSIDE;
  }

  function formatBdt(n) {
    var x = Math.round(Number(n) || 0);
    return "৳" + String(x).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  function parseBdtFromPriceField(priceStr) {
    var n = parseInt(String(priceStr || "").replace(/[^\d]/g, ""), 10);
    return isNaN(n) ? 0 : n;
  }

  function updateOrderSummary() {
    if (!orderSummary) return;
    var unit = unitPriceInput ? parseInt(String(unitPriceInput.value || "0"), 10) : 0;
    var qty = quantityInput ? parseInt(String(quantityInput.value || "1"), 10) : 1;
    if (isNaN(qty) || qty < 1) qty = 1;
    var area = areaSelect ? String(areaSelect.value || "").trim() : "";
    var delivery = area ? deliveryFeeBdtForArea(area) : null;
    var subtotal = unit > 0 ? unit * qty : 0;

    if (!unit) {
      orderSummary.innerHTML = "";
      orderSummary.hidden = true;
      return;
    }

    var parts = [
      "<div class=\"order-summary__row\"><span>Unit price</span><span>" + formatBdt(unit) + "</span></div>",
      "<div class=\"order-summary__row\"><span>Quantity</span><span>" + String(qty) + "</span></div>",
      "<div class=\"order-summary__row order-summary__row--strong\"><span>Item subtotal</span><span>" +
        formatBdt(subtotal) +
        "</span></div>",
    ];

    if (area && delivery != null) {
      parts.push(
        "<div class=\"order-summary__row\"><span>Delivery (by area)</span><span>" +
          formatBdt(delivery) +
          "</span></div>"
      );
      parts.push(
        "<div class=\"order-summary__row order-summary__row--total\"><span>Estimated total</span><span>" +
          formatBdt(subtotal + delivery) +
          "</span></div>"
      );
    } else {
      parts.push(
        "<p class=\"order-summary__foot\">Select your delivery area to include the delivery charge.</p>"
      );
    }

    orderSummary.innerHTML = parts.join("");
    orderSummary.hidden = false;
  }

  if (header) {
    function onScroll() {
      header.classList.toggle("is-scrolled", window.scrollY > 10);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  function openModal(productName, unitPriceBdt) {
    if (!modal || !form || !productInput) return;
    form.reset();
    clearFormErrors();
    productInput.value = productName || "";
    if (unitPriceInput) {
      unitPriceInput.value =
        unitPriceBdt != null && !isNaN(Number(unitPriceBdt)) ? String(Math.round(Number(unitPriceBdt))) : "";
    }
    if (quantityInput) {
      quantityInput.value = "1";
    }
    updateOrderSummary();
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    var firstEditable = form.querySelector("#orderCustomerName");
    if (firstEditable) {
      window.setTimeout(function () {
        firstEditable.focus();
      }, 120);
    }
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    if (form) {
      form.reset();
      clearFormErrors();
    }
    if (unitPriceInput) unitPriceInput.value = "";
    if (orderSummary) {
      orderSummary.innerHTML = "";
      orderSummary.hidden = true;
    }
    var submitBtn = form && form.querySelector('[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.classList.remove("is-loading");
    }
  }

  function clearFormErrors() {
    if (!form) return;
    var fields = form.querySelectorAll(".form-field");
    for (var i = 0; i < fields.length; i++) {
      fields[i].classList.remove("has-error");
    }
  }

  function setFieldError(fieldId, message) {
    var wrap = form && form.querySelector('[data-field-wrap="' + fieldId + '"]');
    if (!wrap) return;
    wrap.classList.add("has-error");
    var err = wrap.querySelector(".form-field__error");
    if (err) err.textContent = message;
  }

  function validateForm() {
    if (!form) return false;
    clearFormErrors();
    var ok = true;

    var name = form.querySelector("#orderCustomerName");
    var phone = form.querySelector("#orderPhone");
    var area = form.querySelector("#orderArea");
    var address = form.querySelector("#orderAddress");
    var product = form.querySelector("#orderProduct");
    var qtyEl = form.querySelector("#orderQuantity");

    if (!product || !String(product.value || "").trim()) {
      setFieldError("product", "Product is required.");
      ok = false;
    }
    var qty = qtyEl ? parseInt(String(qtyEl.value || "").trim(), 10) : NaN;
    if (!qtyEl || isNaN(qty) || qty < 1) {
      setFieldError("quantity", "Enter a quantity of at least 1.");
      ok = false;
    } else if (qty > 99) {
      setFieldError("quantity", "Maximum quantity per order is 99.");
      ok = false;
    }
    var unitParsed =
      unitPriceInput && String(unitPriceInput.value || "").trim()
        ? parseInt(String(unitPriceInput.value).trim(), 10)
        : NaN;
    if (!unitPriceInput || !String(unitPriceInput.value || "").trim() || isNaN(unitParsed) || unitParsed <= 0) {
      setFieldError("product", "Product price is missing — try ordering again from the product card.");
      ok = false;
    }
    if (!name || !String(name.value || "").trim()) {
      setFieldError("name", "Please enter your name.");
      ok = false;
    }
    if (!phone || !String(phone.value || "").trim()) {
      setFieldError("phone", "Please enter your phone number.");
      ok = false;
    } else if (String(phone.value).replace(/\D/g, "").length < 10) {
      setFieldError("phone", "Enter a valid phone number (at least 10 digits).");
      ok = false;
    }
    if (!area || !String(area.value || "").trim()) {
      setFieldError("area", "Please select your delivery area.");
      ok = false;
    }
    if (!address || !String(address.value || "").trim()) {
      setFieldError("address", "Please enter your full address.");
      ok = false;
    }

    return ok;
  }

  function buildWhatsAppMessage(d) {
    var unit = Math.round(Number(d.unitBdt) || 0);
    var qty = Math.round(Number(d.qty) || 0);
    var subtotal = unit * qty;
    var delivery = deliveryFeeBdtForArea(d.area);
    var total = subtotal + delivery;
    var lines = [
      "Order (MiniMart Zone)",
      "Product: " + d.product,
      "Qty: " + String(qty),
      "Unit price: " + formatBdt(unit),
      "Item subtotal: " + formatBdt(subtotal),
      "Delivery area: " + d.area,
      "Delivery charge: " + formatBdt(delivery),
      "Estimated total: " + formatBdt(total),
      "—",
      "Customer: " + d.name,
      "Phone: " + d.phone,
      "Address: " + d.address,
      "Payment: Cash on Delivery",
    ];
    return lines.join("\n");
  }

  function openWhatsApp(text) {
    if (!WHATSAPP_NUMBER || WHATSAPP_NUMBER.length < 10) {
      window.alert("WhatsApp number is not set. Edit js/config.js and set whatsappNumber (digits only).");
      return;
    }
    var url =
      "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(text);
    window.open(url, "_blank", "noopener,noreferrer");
  }

  if (productGrid) {
    productGrid.addEventListener("click", function (e) {
      var btn = e.target.closest(".js-open-order");
      if (!btn) return;
      var card = btn.closest(".product-card");
      var name = card ? card.getAttribute("data-product") : "";
      var unitBdt = card ? parseInt(card.getAttribute("data-unit-price-bdt") || "0", 10) : 0;
      openModal(name || "", unitBdt);
    });
  }

  if (modal) {
    modal.addEventListener("click", function (e) {
      if (e.target === modal) closeModal();
    });
  }

  ["orderModalClose", "orderModalCancel"].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener("click", closeModal);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modal && modal.classList.contains("is-open")) {
      closeModal();
    }
  });

  if (quantityInput) {
    quantityInput.addEventListener("input", updateOrderSummary);
  }
  if (areaSelect) {
    areaSelect.addEventListener("change", updateOrderSummary);
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validateForm()) return;

      var submitBtn = form.querySelector('[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.classList.add("is-loading");
      }

      var unitBdt = parseInt(String(unitPriceInput && unitPriceInput.value ? unitPriceInput.value : "0"), 10);
      var qty = parseInt(String(form.querySelector("#orderQuantity").value || "1"), 10);

      var data = {
        product: String(productInput.value || "").trim(),
        qty: qty,
        unitBdt: unitBdt,
        name: String(form.querySelector("#orderCustomerName").value || "").trim(),
        phone: String(form.querySelector("#orderPhone").value || "").trim(),
        area: String(form.querySelector("#orderArea").value || "").trim(),
        address: String(form.querySelector("#orderAddress").value || "").trim(),
      };

      window.setTimeout(function () {
        openWhatsApp(buildWhatsAppMessage(data));
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.classList.remove("is-loading");
        }
        closeModal();
      }, 900);
    });
  }

  function normalize(s) {
    return String(s || "")
      .toLowerCase()
      .trim();
  }

  function cardMatches(card) {
    var q = normalize(searchInput && searchInput.value);
    var name = normalize(card.getAttribute("data-product"));
    var cat = normalize(card.getAttribute("data-category"));

    if (activeCategory !== "all" && cat !== normalize(activeCategory)) {
      return false;
    }
    if (!q) return true;
    return name.indexOf(q) !== -1;
  }

  function applyFilters() {
    if (!productGrid) return;
    var cards = productGrid.querySelectorAll(".product-card");
    var visible = 0;
    for (var i = 0; i < cards.length; i++) {
      var show = cardMatches(cards[i]);
      cards[i].classList.toggle("is-hidden", !show);
      if (show) visible++;
    }
    if (emptyState) {
      emptyState.classList.toggle("is-visible", visible === 0 && cards.length > 0);
    }
  }

  if (searchInput) {
    searchInput.addEventListener("input", applyFilters);
  }

  if (filterWrap) {
    filterWrap.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-filter]");
      if (!btn) return;
      var f = btn.getAttribute("data-filter") || "all";
      activeCategory = f;
      var chips = filterWrap.querySelectorAll("[data-filter]");
      for (var k = 0; k < chips.length; k++) {
        chips[k].classList.toggle("is-active", chips[k] === btn);
      }
      applyFilters();
    });
  }

  function categoryLabel(id) {
    return String(id || "general")
      .split(/[\s_-]+/)
      .filter(Boolean)
      .map(function (w) {
        return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
      })
      .join(" ");
  }

  function renderFilters(products) {
    if (!filterWrap) return;
    filterWrap.replaceChildren();

    var seen = {};
    var cats = [];
    for (var i = 0; i < products.length; i++) {
      var c = String(products[i].category || "general").trim() || "general";
      if (!seen[c]) {
        seen[c] = true;
        cats.push(c);
      }
    }
    cats.sort();

    function addChip(id, label, isActive) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "filter-chip" + (isActive ? " is-active" : "");
      b.setAttribute("data-filter", id);
      b.textContent = label;
      filterWrap.appendChild(b);
    }

    addChip("all", "All", true);
    for (var j = 0; j < cats.length; j++) {
      var id = cats[j];
      addChip(id, categoryLabel(id), false);
    }
    activeCategory = "all";
  }

  function appendBadge(wrap, type) {
    var t = String(type).toLowerCase();
    var span = document.createElement("span");
    span.className = "product-badge";
    if (t === "new") {
      span.className += " product-badge--new";
      span.textContent = "New";
      wrap.appendChild(span);
    } else if (t === "popular") {
      span.className += " product-badge--popular";
      span.textContent = "Popular";
      wrap.appendChild(span);
    }
  }

  var PLACEHOLDER_IMG =
    "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&q=80";

  function renderProductCards(products) {
    if (!productGrid) return;
    productGrid.replaceChildren();

    if (emptyState) {
      emptyState.classList.remove("is-visible");
    }

    if (!products.length) {
      if (emptyState) {
        emptyState.textContent = "No products in catalog.";
        emptyState.classList.add("is-visible");
      }
      return;
    }

    if (emptyState) {
      emptyState.textContent = "No products match your search or filter.";
    }

    for (var i = 0; i < products.length; i++) {
      var p = products[i];
      var name = String(p.name || "").trim();
      if (!name) continue;

      var cat = String(p.category || "general").trim() || "general";
      var price = String(p.price != null ? p.price : "").trim();
      var unitBdt = parseBdtFromPriceField(price);
      var img = String(p.image || "").trim();
      var alt = String(p.alt || name).trim();
      var badges = p.badges;
      if (!Array.isArray(badges)) {
        badges = [];
      }

      var article = document.createElement("article");
      article.className = "product-card glass-panel";
      article.setAttribute("data-product", name);
      article.setAttribute("data-category", cat);
      article.setAttribute("data-unit-price-bdt", String(unitBdt));

      if (badges.length) {
        var badgesWrap = document.createElement("div");
        badgesWrap.className = "product-card__badges";
        for (var b = 0; b < badges.length; b++) {
          appendBadge(badgesWrap, badges[b]);
        }
        if (badgesWrap.childNodes.length) {
          article.appendChild(badgesWrap);
        }
      }

      var imgWrap = document.createElement("div");
      imgWrap.className = "product-card__image-wrap";
      var im = document.createElement("img");
      im.src = img || PLACEHOLDER_IMG;
      im.alt = alt;
      im.width = 600;
      im.height = 480;
      im.loading = "lazy";
      imgWrap.appendChild(im);
      article.appendChild(imgWrap);

      var body = document.createElement("div");
      body.className = "product-card__body";
      var h3 = document.createElement("h3");
      h3.className = "product-card__name";
      h3.textContent = name;
      body.appendChild(h3);

      var priceP = document.createElement("p");
      priceP.className = "product-card__price";
      var cur = document.createElement("span");
      cur.className = "currency";
      cur.textContent = "৳";
      priceP.appendChild(cur);
      priceP.appendChild(document.createTextNode(price));
      body.appendChild(priceP);

      var ord = document.createElement("button");
      ord.type = "button";
      ord.className = "btn btn--primary js-open-order";
      ord.textContent = "Order Now";
      body.appendChild(ord);

      article.appendChild(body);
      productGrid.appendChild(article);
    }
  }

  function normalizeProducts(data) {
    return data && Array.isArray(data.products) ? data.products : [];
  }

  function hideLoading() {
    var loading = document.getElementById("shopLoading");
    if (loading) {
      loading.classList.add("is-hidden");
    }
  }

  function showLoadError(message) {
    hideLoading();
    var el = document.getElementById("shopLoadError");
    if (el) {
      el.textContent = message;
      el.classList.remove("is-hidden");
    }
  }

  function hideShopLoadError() {
    var el = document.getElementById("shopLoadError");
    if (el) el.classList.add("is-hidden");
  }

  /** Inline copy for file:// — same shape as data/products.json. */
  function readEmbeddedCatalog() {
    var el = document.getElementById("shop-catalog-fallback");
    if (!el || !String(el.textContent || "").trim()) return null;
    try {
      return JSON.parse(el.textContent);
    } catch (e) {
      return null;
    }
  }

  function applyCatalogData(data) {
    hideLoading();
    hideShopLoadError();
    var products = normalizeProducts(data);
    renderFilters(products);
    renderProductCards(products);
    applyFilters();
  }

  function start() {
    fetch(PRODUCTS_URL)
      .then(function (res) {
        if (!res.ok) {
          throw new Error("HTTP " + res.status);
        }
        return res.json();
      })
      .then(function (data) {
        applyCatalogData(data);
      })
      .catch(function () {
        var embedded = readEmbeddedCatalog();
        var fromInline = normalizeProducts(embedded);
        if (fromInline.length) {
          applyCatalogData(embedded);
        } else {
          showLoadError(
            "Product list could not be loaded. Serve the folder over HTTP (e.g. VS Code Live Server) so data/products.json can load, or keep the embedded catalog block in minimart.html in sync with that file."
          );
        }
      });
  }

  start();
})();
