/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom";
import { screen, waitFor } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import Bills from "../containers/Bills.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store.js";
import router from "../app/Router.js";
import userEvent from "@testing-library/user-event";

// structure AAA, Arrange(mise en place des données),Act (agir sur les données), Assert(faire les assertions)

jest.mock("../app/store", () => mockStore);

// tests unitaires
describe("Étant donné que je suis connecté en tant qu'employé", () => {
  describe("une erreur est survenue au chargement de la page", () => {
    it("un message d'erreur est rendu", () => {
      const html = BillsUI({ loading: false, error: true });
      document.body.innerHTML = html;

      const pageError = screen.getByTestId("error-message");
      expect(pageError).toBeTruthy();
    });
  });

  describe("Quand je suis sur la page Bills", () => {
    it("Elle doit être rendu", () => {
      const html = BillsUI({ loading: true });
      document.body.innerHTML = html;
      expect(screen.getByText("Loading...")).toBeTruthy();
    });

    // utilisation d'async / await
    it("L'icône Bills dans le menu verticale doit être mise en surbrillance", async () => {
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);

      router();
      window.onNavigate(ROUTES_PATH.Bills);

      // https://testing-library.com/docs/dom-testing-library/api-async/#waitfor
      const windowIcon = await waitFor(() => screen.getByTestId("icon-window"));

      expect(windowIcon.classList.contains("active-icon")).toBe(true);
    });

    it("Les bills doivent être placées du plus recent au plus ancien", () => {
      document.body.innerHTML = BillsUI({
        data: bills.sort((a, b) => new Date(b.date) - new Date(a.date)),
      });
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i,
        )
        .map((date) => date.innerHTML);

      const antiChrono = (a, b) => (a < b ? 1 : -1);

      const datesSorted = [...dates].sort(antiChrono);

      expect(dates).toEqual(datesSorted);
    });

    // tests de fonctionnels
    it("Ouverture de la page 'Nouvelle note de frais' lors du clique sur le bouton 'Nouvelle note de frais'", () => {
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

    it("Au clique sur l'icône eye une modale doit apparaître", () => {
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
      const handleClickIconEye = jest.fn((eyeBTN) => {
        // mock de la fn
        billPage.handleClickIconEye(eyeBTN);
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
  // fonction simulée, mais qui surveille la fonction "mockStore"
  jest.spyOn(mockStore, "bills");
  // permet de définir une nouvelle propriété ou de modifier une propriété existante
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
afterEach(() => {
  document.body.innerHTML = "";
});
describe("Je suis connecter en tant qu'employé", () => {
  it("doit récupérer le tableau de données 'bills' d'un employé", async () => {
    window.onNavigate(ROUTES_PATH.Bills);
    // tbody dépend du back
    const table = await waitFor(() => screen.getByTestId("tbody"));
    expect(screen.getByText("Mes notes de frais")).toBeTruthy();
    expect(table).toBeTruthy();
  });

  it("Doit retournée une erreur en cas de format de date non conforme", async () => {
    const mockBills = await mockStore.bills().list();
    const wrongBills = [{ ...mockBills[0] }];
    wrongBills[0].date = "21-13/2022";

    mockStore.bills.mockImplementationOnce(() => {
      return {
        list: () => {
          return Promise.resolve(wrongBills);
        },
      };
    });

    window.onNavigate(ROUTES_PATH.Bills);
    expect(await waitFor(() => screen.getByText("21-13/2022"))).toBeTruthy();
  });

  describe("Doit retourné une erreur API", () => {
    it("retourne une erreur 404(ressource non trouvée)", async () => {
      // mockImplementationOnce => retourne le résultat d'une fonction mokée.
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list: () => {
            return Promise.reject(new Error("Erreur 404"));
          },
        };
      });

      window.onNavigate(ROUTES_PATH.Bills);
      // process => fait partie de l'environnement de Node
      // nexTick => Lors de l'event loop, cette fonction permet de mettre dans la pile d'execution, la prochaine fonction a exécuter.
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
