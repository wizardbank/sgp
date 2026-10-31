"use strict";

/* ---------- Helpers ---------- */

/** Only allow http(s) (or relative) URLs coming from JSON data. */
function isSafeUrl(value) {
  if (typeof value !== "string" || !value) return false;
  try {
    const url = new URL(value, location.href);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/** Tiny DOM builder. Strings are inserted as text, never as HTML. */
function h(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value != null && value !== false) node.setAttribute(key, value);
  }
  node.append(...children.filter((child) => child != null && child !== ""));
  return node;
}

const SVG_NS = "http://www.w3.org/2000/svg";

/** Icon from the inline sprite in index.html (see <symbol id="icon-...">). */
function icon(name) {
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("class", "icon");
  svg.setAttribute("aria-hidden", "true");
  const use = document.createElementNS(SVG_NS, "use");
  use.setAttribute("href", `#icon-${name}`);
  svg.append(use);
  return svg;
}

function externalAttrs(href, extra = {}) {
  return { href, target: "_blank", rel: "noopener noreferrer", ...extra };
}

async function loadJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  return res.json();
}

async function loadSection({ url, containerId, render, transform, emptyText, errorText }) {
  const container = document.getElementById(containerId);
  if (!container) return;

  try {
    let data = await loadJson(url);
    if (!Array.isArray(data)) throw new Error(`${url}: expected an array`);
    if (transform) data = transform(data);

    container.replaceChildren(
      ...(data.length ? data.map(render) : [h("p", { class: "status" }, emptyText)])
    );
  } catch (err) {
    console.error(err);
    container.replaceChildren(
      h("p", { class: "status status--error", role: "alert" }, errorText)
    );
  }
}

/* ---------- Footer year ---------- */

function initYear() {
  const year = String(new Date().getFullYear());
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = year;
  });
}

/* ---------- Navbar ---------- */

function initNavbar() {
  const toggle = document.querySelector(".navbar__toggle");
  const menu = document.getElementById("site-menu");
  if (!toggle || !menu) return;

  const setOpen = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.classList.toggle("is-open", open);
    menu.classList.toggle("is-open", open);
  };

  toggle.addEventListener("click", () =>
    setOpen(toggle.getAttribute("aria-expanded") !== "true")
  );
  menu.addEventListener("click", (e) => {
    if (e.target.closest("a")) setOpen(false);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setOpen(false);
  });
}

/* ---------- Projects ---------- */
/* Fields: title, status, description, mangadex, cubari, cover (optional image URL/path) */

function linkButton(href, label) {
  return h("a", externalAttrs(href, { class: "btn btn--small btn--secondary" }), label, icon("arrow-right"));
}

function renderProject(project) {
  const links = [];
  if (isSafeUrl(project.mangadex)) links.push(linkButton(project.mangadex, "MangaDex"));
  if (isSafeUrl(project.cubari)) links.push(linkButton(project.cubari, "Cubari"));

  return h(
    "article",
    { class: "card" },
    isSafeUrl(project.cover)
      ? h("img", { class: "card__cover", src: project.cover, alt: `${project.title} cover`, loading: "lazy" })
      : null,
    h(
      "div",
      { class: "card__body" },
      project.status
        ? h("span", { class: "tag", "data-status": String(project.status).trim().toLowerCase() }, project.status)
        : null,
      h("h3", { class: "card__title" }, project.title),
      h("p", { class: "card__text" }, project.description)
    ),
    links.length ? h("div", { class: "card__links" }, ...links) : null
  );
}

/* ---------- News ---------- */
/* Fields: title, date (YYYY-MM-DD), content, link (optional), linkText (optional) */

const dateFormat = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "UTC", // "YYYY-MM-DD" is parsed as UTC; avoid off-by-one day
});

function renderNews(news) {
  const date = new Date(news.date);
  const hasDate = !Number.isNaN(date.getTime());

  return h(
    "article",
    { class: "news-item" },
    h(
      "div",
      { class: "news-item__meta" },
      hasDate ? h("time", { class: "tag", datetime: news.date }, dateFormat.format(date)) : null
    ),
    h(
      "div",
      { class: "news-item__body" },
      h("h3", { class: "news-item__title" }, news.title),
      h("p", { class: "news-item__text" }, news.content),
      isSafeUrl(news.link)
        ? h("a", externalAttrs(news.link, { class: "textlink" }), news.linkText || "Read More", icon("arrow-right"))
        : null
    )
  );
}

const newestFirst = (items) =>
  [...items].sort((a, b) => new Date(b.date) - new Date(a.date));

/* ---------- Init ---------- */

initNavbar();
initYear();

loadSection({
  url: "data/projects.json",
  containerId: "project-list",
  render: renderProject,
  emptyText: "No projects yet. Stay tuned!",
  errorText: "Failed to load projects.",
});

loadSection({
  url: "data/news.json",
  containerId: "news-container",
  render: renderNews,
  transform: newestFirst,
  emptyText: "No announcements yet.",
  errorText: "Failed to load news.",
});