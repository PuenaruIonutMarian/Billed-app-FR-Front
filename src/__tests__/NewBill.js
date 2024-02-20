/**
 * @jest-environment jsdom
 */
// Import necessary functions and modules for testing
import {
  screen,
  fireEvent
} from "@testing-library/dom";
import {
  ROUTES_PATH
} from "../constants/routes.js";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import {
  localStorageMock
} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store.js";



// Describe block for testing the NewBill functionality when the user is connected as an employee
describe("Given I am connected as an employee", () => {
  // Describe block for testing the behavior when on the NewBill page
  describe("When I am on NewBill Page", () => {
    // Before each test, set up the necessary environment
    beforeEach(() => {
      // Mocking localStorage to simulate the user being logged in
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock
      });
      // Setting a user object in localStorage with type 'Employee'
      window.localStorage.setItem('user', JSON.stringify({ //Bassically is indicating that the user is logged in as an employee.
        type: 'Employee'
      }));
      // Rendering the NewBill UI and setting it as the inner HTML of the document body
      const html = NewBillUI()
      document.body.innerHTML = html
    })

    // After each test, clean up the environment
    afterEach(() => {
      document.body.innerHTML = '';
    });

    // Mocking the onNavigate function
    const onNavigate = jest.fn();

    // Test to check if the handleChangeFile() function is called when a file is added
    test("Then the handleChangeFile() function is called when a file is added", () => {
      // Creating a new instance of NewBill with necessary dependencies
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: {}
      });
      // Mocking the handleChange function to track if it's called
      const handleChange = jest.fn((e) => newBill.handleChangeFile(e));
      // Getting the file input element by its data-testid attribute
      const inputFile = screen.getByTestId('file');
      // Adding an event listener to the file input to trigger handleChange when a file is selected
      inputFile.addEventListener('change', handleChange);
      // Simulating a file being selected by firing a change event on the file input
      fireEvent.change(inputFile, {
        target: {
          //creates a mock file object (File) with the name 'test.png' and type 'image/png'.
          files: [new File(['test'], 'test.png', {
            type: 'image/png'
          })]
        }
      });
      // Expecting handleChange to have been called
      expect(handleChange).toHaveBeenCalled();
      // Expecting the name of the selected file to be 'test.png'
      expect(inputFile.files[0].name).toBe('test.png');
    });


    // Test to check if there is a message error when a wrong type of file is added      
    test("Then the handleChangeFile() function when a file with wrong extension is added", async () => {
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      // Mocking the setCustomValidity function
      const setCustomValidityMock = jest.fn();
      const inputFile = screen.getByTestId("file");
      inputFile.setCustomValidity = setCustomValidityMock;

      // Triggering the file change event with an invalid file type
      const handleChangeFile = jest.fn(newBill.handleChangeFile);

      inputFile.addEventListener("change", handleChangeFile);
      fireEvent.change(inputFile, {
        target: {
          files: [
            new File(
              ["test-invalid-extension.gif"],
              "test-invalid-extension.gif", {
                type: "image/gif"
              }
            ),
          ],
        },
      });

      // Asserting that handleChangeFile has been called
      expect(handleChangeFile).toHaveBeenCalled();

      // Asserting that setCustomValidity has been called with the correct error message
      expect(setCustomValidityMock).toHaveBeenCalledWith(
        "Invalid file format. Please upload a file with extension jpg, jpeg, or png."
      );

      // Asserting that the file input value has been cleared
      expect(inputFile.value).toBe("");
    });

    //Integration Test - POST
    // Test to check if a new bill is added and the user is redirected to the bills page upon form submission
    describe('When I am on NewBill Page, I fill the form and click submit', () => {
      test("Then the bill is added and I am redirected to the bills page", () => {
        // Creating a new instance of NewBill with necessary dependencies
        const newBill = new NewBill({
          document,
          onNavigate,
          store: mockStore,
          localStorage: {}
        });
        // Simulate the info inside the form
        const typeInput = screen.getByTestId('expense-type');
        const nameInput = screen.getByTestId('expense-name');
        const amountInput = screen.getByTestId('amount');
        const dateInput = screen.getByTestId('datepicker');
        const vatInput = screen.getByTestId('vat');
        const pctInput = screen.getByTestId('pct');
        const commentaryInput = screen.getByTestId('commentary');
        const file = screen.getByTestId("file");

        // Simulating user input for each form field
        fireEvent.change(typeInput, {
          target: {
            value: 'Transports'
          }
        });
        fireEvent.change(nameInput, {
          target: {
            value: 'Vol Paris Berlin'
          }
        });
        fireEvent.change(amountInput, {
          target: {
            value: '123'
          }
        });
        fireEvent.change(dateInput, {
          target: {
            value: '2023-12-20'
          }
        });
        fireEvent.change(vatInput, {
          target: {
            value: '70'
          }
        });
        fireEvent.change(pctInput, {
          target: {
            value: '20'
          }
        });
        fireEvent.change(commentaryInput, {
          target: {
            value: 'Test comment'
          }
        });
        fireEvent.change(file, {
          target: {
            files: [new File(["test"], "test.jpg", {
              type: "image/jpg"
            })]
          }
        });

        // Getting the form element and adding a submit event listener to trigger handleSubmit
        const newBillForm = screen.getByTestId("form-new-bill");
        const handleSubmit = jest.fn((e) => newBill.handleSubmit(e))
        newBillForm.addEventListener("submit", handleSubmit);
        // Simulating form submission
        fireEvent.submit(newBillForm);
        // Expecting that the handleSubmit function is called
        expect(handleSubmit).toHaveBeenCalled();
        // Expecting that the onNavigate function is called with the correct route for Bills page
        expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH.Bills);
      });
    });
  });
});
