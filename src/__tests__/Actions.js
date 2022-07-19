/**
 * @jest-environment jsdom
 */

import { screen } from "@testing-library/dom";
import Actions from "../views/Actions.js";
import "@testing-library/jest-dom/extend-expect";

describe("Je suis connecter en tant qu'Employee", () => {
  describe("Lorsque je suis sur la page des Bills, il y a toutes les bills", () => {
    test("alors, il devrait rendre l'icon eye", () => {
      const html = Actions();
      document.body.innerHTML = html;
      expect(screen.getByTestId("icon-eye")).toBeTruthy();
    });
  });
  describe("Lorsque je suis sur la page Factures et qu'il y a des factures avec l'URL du fichier", () => {
    test("Ensuite, il doit enregistrer l'URL donnée dans l'attribut personnalisé data-bill-url", () => {
      const url = "/fake_url";
      const html = Actions(url);
      document.body.innerHTML = html;
      expect(screen.getByTestId("icon-eye")).toHaveAttribute(
        "data-bill-url",
        url,
      );
    });
  });
});
