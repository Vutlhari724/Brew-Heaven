/* =========================================================
   Brew Haven Coffee Shop — script.Js
   Shared behaviour for every page of the site
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  setupMobileNav();
  highlightActiveNavLink();
  setupGalleryLightbox();
  setupContactFormValidation();
  setupBackToTop();
  setupCurrentYear();
});


/* ---------- 1. Mobile navigation toggle ---------- */
/* Adds a hamburger button before .site-nav on small screens and
   toggles a class that the CSS uses to show or hide the menu. */
function setupMobileNav() {
  var header = document.querySelector(".site-header");
  var nav = document.querySelector(".site-nav");
  if (!header || !nav) return;

  var toggle = document.createElement("button");
  toggle.className = "nav-toggle";
  toggle.setAttribute("type", "button");
  toggle.setAttribute("aria-label", "Toggle navigation menu");
  toggle.setAttribute("aria-expanded", "false");
  toggle.innerHTML = "<span></span><span></span><span></span>";

  header.insertBefore(toggle, nav);

  toggle.addEventListener("click", function () {
    var isOpen = nav.classList.toggle("nav-open");
    toggle.classList.toggle("is-active", isOpen);
    toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  /* Close the menu automatically once a link is tapped */
  nav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      nav.classList.remove("nav-open");
      toggle.classList.remove("is-active");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
}


/* ---------- 2. Active nav link highlighting ---------- */
/* Works from the current file name so the "active" class never
   has to be hard-coded by hand on every page. */
function highlightActiveNavLink() {
  var links = document.querySelectorAll(".site-nav a");
  if (!links.length) return;

  var current = window.location.pathname.split("/").pop() || "indexPage.html";

  links.forEach(function (link) {
    var href = link.getAttribute("href");
    if (href === current) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
}


/* ---------- 3. Gallery lightbox ---------- */
/* Clicking any gallery image opens it full-size in an overlay.
   Built once per page load and reused for every image found. */
function setupGalleryLightbox() {
  var images = document.querySelectorAll(".gallery-grid img");
  if (!images.length) return;

  var overlay = document.createElement("div");
  overlay.className = "lightbox";
  overlay.innerHTML =
    '<button type="button" class="lightbox-close" aria-label="Close image">&times;</button>' +
    '<img class="lightbox-img" alt="">' +
    '<p class="lightbox-caption"></p>';
  document.body.appendChild(overlay);

  var imgEl = overlay.querySelector(".lightbox-img");
  var captionEl = overlay.querySelector(".lightbox-caption");
  var closeBtn = overlay.querySelector(".lightbox-close");

  function openLightbox(src, caption) {
    imgEl.src = src;
    imgEl.alt = caption;
    captionEl.textContent = caption;
    overlay.classList.add("is-visible");
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    overlay.classList.remove("is-visible");
    document.body.style.overflow = "";
  }

  images.forEach(function (img) {
    img.style.cursor = "zoom-in";
    img.addEventListener("click", function () {
      var figcaption = img.closest("figure");
      var caption = figcaption ? figcaption.querySelector("figcaption") : null;
      openLightbox(img.src, caption ? caption.textContent : img.alt);
    });
  });

  closeBtn.addEventListener("click", closeLightbox);
  overlay.addEventListener("click", function (event) {
    if (event.target === overlay) closeLightbox();
  });
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") closeLightbox();
  });
}


/* ---------- 4. Contact form validation ---------- */
/* Checks required fields and email format before allowing the
   form to submit, and shows a friendly confirmation message
   instead of actually posting anywhere (there is no back end). */
function setupContactFormValidation() {
  var form = document.querySelector(".contact-form");
  if (!form) return;

  var fields = form.querySelectorAll("input[required], select[required], textarea[required]");
  var emailField = form.querySelector("#email");
  var phoneField = form.querySelector("#phone");

  function showError(field, message) {
    clearError(field);
    var error = document.createElement("span");
    error.className = "field-error";
    error.textContent = message;
    field.insertAdjacentElement("afterend", error);
    field.classList.add("is-invalid");
  }

  function clearError(field) {
    field.classList.remove("is-invalid");
    var next = field.nextElementSibling;
    if (next && next.classList.contains("field-error")) {
      next.remove();
    }
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function isValidPhone(value) {
    /* South African style numbers: digits, spaces, dashes, optional + */
    return value === "" || /^[+\d][\d\s-]{6,}$/.test(value);
  }

  fields.forEach(function (field) {
    field.addEventListener("blur", function () {
      if (!field.value.trim()) {
        showError(field, "This field is required.");
      } else {
        clearError(field);
      }
    });
  });

  if (emailField) {
    emailField.addEventListener("blur", function () {
      if (emailField.value.trim() && !isValidEmail(emailField.value.trim())) {
        showError(emailField, "Please enter a valid email address.");
      }
    });
  }

  if (phoneField) {
    phoneField.addEventListener("blur", function () {
      if (!isValidPhone(phoneField.value.trim())) {
        showError(phoneField, "Please enter a valid phone number.");
      }
    });
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var isFormValid = true;

    fields.forEach(function (field) {
      if (!field.value.trim()) {
        showError(field, "This field is required.");
        isFormValid = false;
      }
    });

    if (emailField && emailField.value.trim() && !isValidEmail(emailField.value.trim())) {
      showError(emailField, "Please enter a valid email address.");
      isFormValid = false;
    }

    if (phoneField && !isValidPhone(phoneField.value.trim())) {
      showError(phoneField, "Please enter a valid phone number.");
      isFormValid = false;
    }

    if (!isFormValid) {
      var firstInvalid = form.querySelector(".is-invalid");
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    showFormSuccess(form);
  });
}

function showFormSuccess(form) {
  var existing = form.parentNode.querySelector(".form-success");
  if (existing) existing.remove();

  var success = document.createElement("p");
  success.className = "form-success";
  success.textContent = "Thank you! Your message has been received. We will get back to you soon.";
  form.insertAdjacentElement("beforebegin", success);

  form.reset();
  success.scrollIntoView({ behavior: "smooth", block: "center" });

  setTimeout(function () {
    success.remove();
  }, 6000);
}


/* ---------- 5. Back-to-top button ---------- */
/* Appears once the visitor scrolls down the page and smoothly
   returns them to the top when clicked. */
function setupBackToTop() {
  var button = document.createElement("button");
  button.className = "back-to-top";
  button.setAttribute("type", "button");
  button.setAttribute("aria-label", "Back to top");
  button.textContent = "\u2191";
  document.body.appendChild(button);

  window.addEventListener("scroll", function () {
    button.classList.toggle("is-visible", window.scrollY > 400);
  });

  button.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}


/* ---------- 6. Footer year ---------- */
/* If a page includes an element with id="current-year", keep it
   up to date automatically instead of hard-coding a year. */
function setupCurrentYear() {
  var yearEl = document.getElementById("current-year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}
