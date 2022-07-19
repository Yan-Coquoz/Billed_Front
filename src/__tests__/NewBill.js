/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom";
import { screen, getByTestId, fireEvent } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store.js";
import { ROUTES_PATH } from "../constants/routes.js";
import router from "../app/Router.js";
import userEvent from "@testing-library/user-event";

beforeEach(() => {
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
  // je place le DOM
  document.body.innerHTML = NewBillUI();
  //j'utilise la route de la bonne page
  window.onNavigate(ROUTES_PATH.NewBill);
});
afterEach(() => {
  document.body.innerHTML = "";
});

describe("Étant donné que je suis connecté en tant qu'employé", () => {
  describe("Quand je suis sur la page NewBill", () => {
    it("l'icone de e-mail de la barre verticale doit être en surbrillance", async () => {
      const emailIcon = screen.getByTestId("icon-mail");
      expect(emailIcon.classList.contains("active-icon")).toBe(true);
    });
  });

  describe("Lors d'une erreur sur l'API", () => {
    it("doit rendre une erreur 500", async () => {
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });
      // simulation de l'erreur
      jest.spyOn(mockStore, "bills");
      console.error = jest.fn();
      mockStore.bills.mockImplementationOnce(() => {
        return {
          update: () => {
            return Promise.reject(new Error("Erreur 500"));
          },
        };
      });

      const formulaire = screen.getByTestId("form-new-bill");
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
      formulaire.addEventListener("submit", handleSubmit);
      fireEvent.submit(formulaire);

      await new Promise(process.nextTick);
      expect(console.error).toBeCalled();
    });
  });

  describe("Je test la soumission du formulaire", () => {
    it("Si le formulaire est bien rempli", () => {
      // Comme on fait appel à une classe avec des parametres, on fait appel à cette classe.
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });
      // les elements du DOM
      const formulaire = screen.getByTestId("form-new-bill");
      const inputSelect = screen.getByTestId("expense-type");
      const inputName = screen.getByTestId("expense-name");
      const inputDate = screen.getByTestId("datepicker");
      const inputAmount = screen.getByTestId("amount");
      const inputVAT = screen.getByTestId("vat");
      const inputPCT = screen.getByTestId("pct");
      const inputCom = screen.getByTestId("commentary");
      const inputFile = screen.getByTestId("file");

      const file = new File(["img"], "bill.jpg", { type: "image/jpg" });

      // le format attendu du formulaire
      const formValues = {
        type: "IT et électronique",
        name: "salon MongoDB",
        date: "2022-10-18",
        amount: "50",
        vat: 18,
        pct: 10,
        commentary: "bla bla",
        file: file,
      };
      // https://testing-library.com/docs/dom-testing-library/api-events/#fireeventeventname
      fireEvent.change(inputSelect, { target: { value: formValues.type } });
      fireEvent.change(inputName, { target: { value: formValues.name } });
      fireEvent.change(inputDate, { target: { value: formValues.date } });
      fireEvent.change(inputAmount, { target: { value: formValues.amount } });
      fireEvent.change(inputVAT, { target: { value: formValues.vat } });
      fireEvent.change(inputPCT, { target: { value: formValues.pct } });
      fireEvent.change(inputCom, { target: { value: formValues.commentary } });
      userEvent.upload(inputFile, formValues.file);

      // simulation de la fonction + ecouteur + submit
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
      formulaire.addEventListener("submit", handleSubmit);
      fireEvent.submit(formulaire);

      expect(handleSubmit).toHaveBeenCalled();
      expect(inputSelect.validity.valid).toBeTruthy();
      expect(inputName.validity.valid).toBeTruthy();
      expect(inputDate.validity.valid).toBeTruthy();
      expect(inputVAT.validity.valid).toBeTruthy();
      expect(inputPCT.validity.valid).toBeTruthy();
      expect(inputCom.validity.valid).toBeTruthy();
      expect(inputFile.files[0]).toBeDefined();
    });

    it("Si les champs sont vide, on reste sur la page de login", () => {
      // Comme on fait appel à une classe avec des parametres, on fait appel à cette classe.
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });
      // test des inputs vide
      expect(screen.getByTestId("expense-name").value).toBe("");
      expect(screen.getByTestId("datepicker").value).toBe("");
      expect(screen.getByTestId("amount").value).toBe("");
      expect(screen.getByTestId("vat").value).toBe("");
      expect(screen.getByTestId("pct").value).toBe("");
      expect(screen.getByTestId("commentary").value).toBe("");
      expect(screen.getByTestId("file").value).toBe("");

      // test de l'envois du form
      //on capte le form
      const form = getByTestId(document.body, "form-new-bill");
      // on simule un fonction d'appel
      const handleFormSubmit = jest.fn((evt) => newBill.handleSubmit(evt));
      // je capte l'event
      form.addEventListener("submit", handleFormSubmit);
      // je soumet le formulaire
      fireEvent.submit(form);

      expect(handleFormSubmit).toHaveBeenCalled();
      expect(form).toBeTruthy();
    });

    it("Je test le bon format du fichier uploader (jpeg|jpg|png)", () => {
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      // le fichier importer
      // recupe du fichier
      const inputValue = screen.getByTestId("file");
      // https://developer.mozilla.org/en-US/docs/Web/API/File/File#examples
      const file = new File(["img"], "bill.jpg", { type: "image/jpg" });
      // Je simule la fonction
      const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e));
      const spanError = screen.getByTestId("error-span");
      const extension = /([a-z 0-9])+(.jpg|.jpeg|.png)/gi;

      inputValue.addEventListener("change", handleChangeFile);
      //! https://testing-library.com/docs/ecosystem-user-event/
      // je capte l'event
      userEvent.upload(inputValue, file);

      expect(handleChangeFile).toHaveBeenCalled();
      expect(inputValue.files[0]).toStrictEqual(file);
      expect(inputValue.files[0].name).toMatch(extension);
      expect(spanError.classList).toContain("hidden");
    });

    it("Je test le mauvais format du fichier uploader", () => {
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      const inputValue = screen.getByTestId("file");
      const spanError = screen.getByTestId("error-span");
      const file = new File(["img"], "bill.pdf", { type: "text/png" });
      const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e));

      const extension = /([a-z 0-9])+(.jpg|.jpeg|.png)/gi;

      inputValue.addEventListener("change", handleChangeFile);
      userEvent.upload(inputValue, file);

      expect(handleChangeFile).toHaveBeenCalled();
      expect(inputValue.files[0]).toStrictEqual(file);
      expect(inputValue.files[0].name).not.toMatch(extension);
      expect(spanError.classList).not.toContain("hidden");
    });
  });
});
