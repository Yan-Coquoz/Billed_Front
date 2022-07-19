import { ROUTES_PATH } from "../constants/routes.js";
import { formatDate, formatStatus } from "../app/format.js";
import Logout from "./Logout.js";

export default class {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document;
    this.onNavigate = onNavigate;
    this.store = store;
    const buttonNewBill = document.querySelector(
      `button[data-testid="btn-new-bill"]`,
    );

    if (buttonNewBill)
      buttonNewBill.addEventListener("click", this.handleClickNewBill);
    const iconEye = document.querySelectorAll(`div[data-testid="icon-eye"]`);

    iconEye.forEach((icon) => {
      const getBillsURL = $(icon).attr("data-bill-url");

      icon.addEventListener("click", () => this.handleClickIconEye(icon));
    });

    new Logout({ document, localStorage, onNavigate });
  }

  handleClickNewBill = () => {
    this.onNavigate(ROUTES_PATH["NewBill"]);
  };

  /**
   * @param {HTMLElement} icon
   */
  handleClickIconEye = (icon) => {
    const billUrl = icon.getAttribute("data-bill-url");

    const imgWidth = Math.floor($("#modaleFile").width() * 0.5);
    if (!billUrl.includes("null")) {
      $("#modaleFile")
        .find(".modal-body")
        .html(
          `<div style='text-align: center;' class="bill-proof-container"><img width=${imgWidth} src=${billUrl} alt="Bill" /></div>`,
        );

      $("#modaleFile").modal("show");
    }
  };

  // NOTE ajout de la methode sort() pour les dates
  getBills = () => {
    if (this.store) {
      return this.store
        .bills()
        .list()
        .then((snapshot) => {
          return snapshot
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map((doc) => {
              try {
                return {
                  ...doc,
                  date: formatDate(doc.date),
                  status: formatStatus(doc.status),
                };
              } catch (e) {
                // log the error and return unformatted date in that case
                console.log("Une erreur dans le catch de getBills");
                console.log(e, "for", doc);
                return {
                  ...doc,
                  date: doc.date,
                  status: formatStatus(doc.status),
                };
              }
            });
        });
    }
  };
}
