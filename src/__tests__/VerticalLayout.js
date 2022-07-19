/**
 * @jest-environment jsdom
 */

import { screen } from "@testing-library/dom";
import VerticalLayout from "../views/VerticalLayout";
import { localStorageMock } from "../__mocks__/localStorage.js";

describe("Étant donné que je suis connecté en tant qu'employé", () => {
  test("Ensuite, les icônes doivent être rendues", () => {
    Object.defineProperty(window, "localStorage", { value: localStorageMock });
    const user = JSON.stringify({
      type: "Employee",
    });
    window.localStorage.setItem("user", user);
    const html = VerticalLayout(120);
    document.body.innerHTML = html;
    expect(screen.getByTestId("icon-window")).toBeTruthy();
    expect(screen.getByTestId("icon-mail")).toBeTruthy();
  });
});
