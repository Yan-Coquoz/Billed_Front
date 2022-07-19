/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom";
import { screen, waitFor } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store.js";
import router from "../app/Router.js";
import Bills from "../containers/Bills.js";
import userEvent from "@testing-library/user-event";

jest.mock("../app/store", () => mockStore);

describe("Étant donné que je suis connecté en tant qu'employé", () => {
  describe("Quand je suis sur la page Bills", () => {
    it("Ensuite, l'icône Bills dans la disposition verticale doit être mise en surbrillance", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        }),
      );

      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);

      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");

      expect(windowIcon.classList.contains("active-icon")).toBe(true);
    });
    it("Ensuite, les bills doivent être placées du plus recent au plus vieux", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i,
        )
        .map((a) => a.innerHTML);

      const datesSorted = [...dates].sort((a, b) => {
        if (a.date > b.date) {
          return 1;
        }
        if (a.date < b.date) {
          return -1;
        }
        return 0;
      });

      expect(dates).toEqual(datesSorted);
    });

    it("Ouverture de la page lors du clique sur le bouton 'Nouvelle note de frais'", () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      document.body.innerHTML = BillsUI({ data: bills });

      const billPage = new Bills({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      const btnCreateNewBill = screen.getByTestId("btn-new-bill");

      const handleClickNewBill = jest.fn(() => billPage.handleClickNewBill);
      btnCreateNewBill.addEventListener("click", handleClickNewBill);
      userEvent.click(btnCreateNewBill);

      expect(handleClickNewBill).toHaveBeenCalled();
      expect(btnCreateNewBill.textContent).toBe("Nouvelle note de frais");
    });

    it("Au clique sur l'icone eye une modale doit apparaitre", () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      document.body.innerHTML = BillsUI({ data: bills });
      const billPage = new Bills({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      $.fn.modal = jest.fn(); // fn jQuery
      const btnEye = screen.getAllByTestId("icon-eye"); // array
      const handleClickIconEye = jest.fn((btnEye) => {
        // mock de la fn
        billPage.handleClickIconEye(btnEye);
      });

      btnEye.forEach((elt) => {
        // evt sur chaque elt de l'array
        elt.addEventListener("click", () => handleClickIconEye(elt));
        userEvent.click(elt);
      });

      expect(handleClickIconEye).toHaveBeenCalled();
      expect(screen.getByText("Justificatif")).toBeTruthy();
    });
  });

  describe("la page des Bills et que ça charge", () => {
    it("Le loader doit être rendu", () => {
      document.body.innerHTML = BillsUI({ loading: true });
      expect(screen.getAllByText("Loading...")).toBeTruthy();
    });
  });
});

beforeEach(() => {
  jest.spyOn(mockStore, "bills");
  Object.defineProperty(window, "localStorage", {
    value: localStorageMock,
  });

  window.localStorage.setItem(
    "user",
    JSON.stringify({
      type: "Employee",
    }),
  );

  document.body.innerHTML = `<div id="root"></div>`;
  router();
});

describe("Je suis connecter en tant qu'employé", () => {
  it("doit recuperer le tableau de données 'bills' d'un employé", async () => {
    window.onNavigate(ROUTES_PATH.Bills);
    const table = await waitFor(() => screen.getByTestId("tbody"));
    expect(screen.getByText("Mes notes de frais")).toBeTruthy();
    expect(table).toBeTruthy();
  });

  describe("Doit retourné une erreur API", () => {
    it("retourne une erreur 404(ressource non trouvée)", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list: () => {
            return Promise.reject(new Error("Erreur 404"));
          },
        };
      });
      window.onNavigate(ROUTES_PATH.Bills);
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 404/);
      expect(message).toBeTruthy();
    });
    it("retourne une erreur 500(erreur interne du serveur)", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list: () => {
            return Promise.reject(new Error("Erreur 500"));
          },
        };
      });

      window.onNavigate(ROUTES_PATH.Bills);
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 500/);
      expect(message).toBeTruthy();
    });
  });
});
