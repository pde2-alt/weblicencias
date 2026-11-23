class License {
  constructor({ id, software, version, price, key, featured, discount }) {
    Object.assign(this, { id, software, version, price, key, featured, discount });
  }

  render(parent) {
    const product = document.createElement("article");
    const title = document.createElement("h3");
    title.textContent = `${this.software} ${this.version}`;
    const price = document.createElement("p");
    const finalPrice = this.price * (1 - this.discount / 100);
    price.textContent = this.discount
      ? `${finalPrice.toFixed(2)} € (${this.discount}% de descuento; precio original: ${this.price.toFixed(2)} €)`
      : `${this.price.toFixed(2)} €`;
    const button = document.createElement("button");
    button.textContent = "Comprar";
    button.addEventListener("click", () => this.buy());
    product.append(title, price, button);
    parent.appendChild(product);
  }

  buy() {
    const purchased = JSON.parse(localStorage.getItem("purchasedLicenses") || "[]");
    if (!purchased.some(license => license.id === this.id)) {
      purchased.push({ id: this.id, software: this.software, version: this.version, key: this.key });
      localStorage.setItem("purchasedLicenses", JSON.stringify(purchased));
      window.dispatchEvent(new Event("licenses-changed"));
    }
    alert(`Clave de demostración de ${this.software} ${this.version}: ${this.key}`);
  }
}
