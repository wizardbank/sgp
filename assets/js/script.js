// script.js

// Navbar burger toggle
document.addEventListener("DOMContentLoaded", () => {
  const burger = document.querySelector(".navbar-burger");
  const menu = document.getElementById(burger.dataset.target);

  burger.addEventListener("click", () => {
    burger.classList.toggle("is-active");
    menu.classList.toggle("is-active");
  });
});

// Load Projects
fetch("data/projects.json")
  .then((res) => (res.ok ? res.json() : Promise.reject(res)))
  .then((data) => {
    const container = document.getElementById("project-list");
    container.innerHTML = "";
    data.forEach((project) => {
      const column = document.createElement("div");
      column.className = "column is-4";

      const card = document.createElement("div");
      card.className = "card";

      // Card Header
      const cardHeader = document.createElement("header");
      cardHeader.className = "card-header";
      cardHeader.innerHTML = `
        <p class="card-header-title">${project.title}</p>
      `;
      card.appendChild(cardHeader);

      // Card Content
      const cardContent = document.createElement("div");
      cardContent.className = "card-content";
      const content = document.createElement("div");
      content.className = "content";
      content.innerHTML = `
        <p><span class="tag is-info">${project.status}</span></p>
        <p>${project.description}</p>
      `;
      cardContent.appendChild(content);
      card.appendChild(cardContent);

      // Card Footer (Horizontal MangaDex + Cubari)
      if (project.mangadex || project.cubari) {
        const cardFooter = document.createElement("footer");
        cardFooter.className = "card-footer";

        if (project.mangadex) {
          const mangadexLink = document.createElement("a");
          mangadexLink.className = "card-footer-item";
          mangadexLink.href = project.mangadex;
          mangadexLink.target = "_blank";
          mangadexLink.innerHTML = "MangaDex";
          cardFooter.appendChild(mangadexLink);
        }

        if (project.cubari) {
          const cubariLink = document.createElement("a");
          cubariLink.className = "card-footer-item";
          cubariLink.href = project.cubari;
          cubariLink.target = "_blank";
          cubariLink.innerHTML = "Cubari";
          cardFooter.appendChild(cubariLink);
        }

        card.appendChild(cardFooter);
      }

      column.appendChild(card);
      container.appendChild(column);
    });
  })
  .catch(() => {
    document.getElementById("project-list").innerHTML =
      '<p class="has-text-danger"><i class="icon-warning-solid"></i> Failed to load projects.</p>';
  });

// Load News
fetch("data/news.json")
  .then((res) => (res.ok ? res.json() : Promise.reject(res)))
  .then((data) => {
    const container = document.getElementById("news-container");
    container.innerHTML = "";
    data.forEach((news) => {
      const column = document.createElement("div");
      column.className = "column is-4";

      const card = document.createElement("div");
      card.className = "card";

      // Card Header
      const cardHeader = document.createElement("header");
      cardHeader.className = "card-header";
      cardHeader.innerHTML = `
        <p class="card-header-title">${news.title}</p>
      `;
      card.appendChild(cardHeader);

      // Card Content
      const cardContent = document.createElement("div");
      cardContent.className = "card-content";
      const content = document.createElement("div");
      content.className = "content";
      const date = new Date(news.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      content.innerHTML = `
        <p class="is-size-7"><i>${date}</i></p>
        <p>${news.content}</p>
      `;
      cardContent.appendChild(content);
      card.appendChild(cardContent);

      // Optional Footer
if (news.link) {
  const cardFooter = document.createElement("footer");
  cardFooter.className = "card-footer";

  const link = document.createElement("a");
  link.href = news.link;
  link.className = "card-footer-item";
  link.target = "_blank";
  link.textContent = news.linkText || "Read More"; // fallback to "Read More" if not provided

  cardFooter.appendChild(link);
  card.appendChild(cardFooter);
}


      column.appendChild(card);
      container.appendChild(column);
    });
  })
  .catch(() => {
    document.getElementById("news-container").innerHTML =
      '<p class="has-text-danger">⚠️ Failed to load news.</p>';
  });
