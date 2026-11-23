class LicenseController {
  constructor(data) {
    this.licenses = data.map(item => new License(item));
  }

  renderAll(count, parent, filter = "all", maxPrice = "", query = "", sort = "random") {
    const normalize = text =>
      text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

    // Find the latest version of each software.
    const latest = new Map();

    for (const license of this.licenses) {
      const previous = latest.get(license.software);

      if (
        !previous ||
        license.version.localeCompare(previous.version, undefined, {
          numeric: true
        }) > 0
      ) {
        latest.set(license.software, license);
      }
    }

    // Apply the selected filters.
    const matching = this.licenses.filter(license => {
      const finalPrice = license.price * (1 - license.discount / 100);
      const text = `${license.software} ${license.version}`;

      if (filter === "featured" && !license.featured) return false;
      if (filter === "offers" && license.discount <= 0) return false;
      if (filter === "latest" && latest.get(license.software) !== license) {
        return false;
      }
      if (maxPrice !== "" && finalPrice > Number(maxPrice)) return false;
      if (!normalize(text).includes(normalize(query.trim()))) return false;

      return true;
    });

    const names = [...new Set(matching.map(license => license.software))];
    const versionsOf = name =>
      matching.filter(license => license.software === name);

    if (sort === "name") {
      names.sort((a, b) => a.localeCompare(b, "es"));
    } else if (sort === "price") {
      const cheapest = name => Math.min(
        ...versionsOf(name).map(license =>
          license.price * (1 - license.discount / 100)
        )
      );

      names.sort((a, b) => cheapest(a) - cheapest(b));
    } else if (sort === "version") {
      const newest = name => versionsOf(name)
        .map(license => license.version)
        .sort((a, b) =>
          b.localeCompare(a, undefined, { numeric: true })
        )[0];

      names.sort((a, b) =>
        newest(b).localeCompare(newest(a), undefined, { numeric: true })
      );
    } else {
      // Random order.
      for (let i = names.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [names[i], names[j]] = [names[j], names[i]];
      }
    }

    parent.replaceChildren();

    if (!names.length) {
      parent.textContent = "No se encontraron licencias.";
      return;
    }

    names.slice(0, count).forEach(name => {
      this.renderSoftware(versionsOf(name), parent);
    });
  }

  renderSoftware(versions, parent) {
    const card = document.createElement("article");
    const title = document.createElement("h3");
    const label = document.createElement("label");
    const select = document.createElement("select");
    const price = document.createElement("p");
    const button = document.createElement("button");

    title.textContent = versions[0].software;
    label.textContent = "Versión: ";

    versions.forEach((license, index) => {
      const option = document.createElement("option");
      option.value = index;
      option.textContent = license.version;
      select.appendChild(option);
    });

    const updatePrice = () => {
      const selected = versions[Number(select.value)];
      const finalPrice = selected.price * (1 - selected.discount / 100);

      price.textContent = selected.discount
        ? `${finalPrice.toFixed(2)} € (${selected.discount}% de descuento)`
        : `${finalPrice.toFixed(2)} €`;
    };

    select.addEventListener("change", updatePrice);

    button.textContent = "Comprar";
    button.addEventListener("click", () => {
      const selected = versions[Number(select.value)];
      selected.buy();
    });

    label.appendChild(select);
    card.append(title, label, price, button);
    parent.appendChild(card);

    updatePrice();
  }
}