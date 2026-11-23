class App {
  async start() {
    const button = document.getElementById("my-licenses-button");
    const section = document.getElementById("my-licenses");
    const list = document.getElementById("purchased-list");
    const sort = document.getElementById("sort");

    const renderPurchased = () => {
      const purchased = JSON.parse(
        localStorage.getItem("purchasedLicenses") || "[]"
      );

      list.replaceChildren();

      if (!purchased.length) {
        list.textContent = "Todavía no has comprado ninguna licencia.";
      }

      purchased.forEach(license => {
        const item = document.createElement("p");
        item.textContent = `${license.software} ${license.version} — Clave: ${license.key}`;
        list.appendChild(item);
      });
    };

    button.addEventListener("click", () => {
      section.hidden = !section.hidden;
      button.setAttribute("aria-expanded", String(!section.hidden));

      if (!section.hidden) renderPurchased();
    });

    window.addEventListener("licenses-changed", renderPurchased);

    try {
      const response = await fetch("data/licenses.json");

      if (!response.ok) {
        throw new Error("No se pudieron cargar las licencias.");
      }

      const controller = new LicenseController(await response.json());

      const search = document.getElementById("search");
      const filter = document.getElementById("license-filter");
      const maxPrice = document.getElementById("max-price");
      const all = document.getElementById("all");

      const updateAll = () => {
        controller.renderAll(
          30,
          all,
          filter.value,
          maxPrice.value,
          search.value,
          sort.value
        );
      };

      search.addEventListener("input", updateAll);
      filter.addEventListener("change", updateAll);
      maxPrice.addEventListener("input", updateAll);
      sort.addEventListener("change", updateAll);

      updateAll();
    } catch (error) {
      document.querySelector("main").textContent =
        "No se pudieron cargar las licencias.";
      console.error(error);
    }
  }
}

new App().start();