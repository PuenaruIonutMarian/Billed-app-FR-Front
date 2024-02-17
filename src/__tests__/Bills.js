/**
 * @jest-environment jsdom
 */

import mockStore from '../__mocks__/store';
import mockedBills from '../__mocks__/store.js';
import { localStorageMock } from '../__mocks__/localStorage.js';
import { screen, waitFor, fireEvent, wait } from '@testing-library/dom';
import BillsUI from '../views/BillsUI.js';
import { bills } from '../fixtures/bills.js';
import { ROUTES_PATH } from '../constants/routes.js';
import router from '../app/Router.js';
import Bills from '../containers/Bills.js';
import { formatDate, formatStatus } from '../app/format.js';



describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //TODO nr.1
      //checking whether the windowIcon element has a CSS class active-icon
      expect(windowIcon.classList.contains('active-icon')).toBe(true);

    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })
})


//////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////  TODO Nr.2 CONTAINER / BILLS ///////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////


//TODO Nr2 - UNITARY TESTS



// Jest mock for format.js
jest.mock('../app/format.js', () => ({
  formatDate: jest.fn(),
  formatStatus: jest.fn(),
}));

// Jest mock for store
jest.mock('../app/store', () => mockStore);



// Test suite for interactions on the Bills Page
describe('Given I am connected as an employee', () => {
  let myBillsInstance; // Reusable instance

  beforeEach(() => {
    // Mock the instance of Bills
    const onNavigate = jest.fn();
    myBillsInstance = new Bills({
      document,
      onNavigate,
      store: mockedBills,
      localStorage: window.localStorage,
    });
  });

  afterEach(() => {
    myBillsInstance = null;
  });

  // Test cases for interactions with buttons and icons
  describe('Interaction with "New Bill" button', () => {
    it('should have an event listener for click', () => {
      // Mock handleClickNewBill function
      myBillsInstance.handleClickNewBill = jest.fn();
      const buttonNewBill = document.querySelector(`button[data-testid="btn-new-bill"]`);
      expect(buttonNewBill).toBeDefined();
      buttonNewBill.click();
      expect(myBillsInstance.onNavigate).toHaveBeenCalledWith(ROUTES_PATH['NewBill']);
    });
  });

  describe('Interaction with "eye" icons', () => {
    it('should have an event listener for click', () => {
      // Mock handleClickIconEye function
      jQuery.fn.modal = () => {}; // Mock jQuery's modal function
      const iconEye = document.querySelectorAll(`div[data-testid="icon-eye"]`);
      expect(iconEye).toBeDefined();
      myBillsInstance.handleClickIconEye = jest.fn();
      iconEye[0].click();
      expect(myBillsInstance.handleClickIconEye).toHaveBeenCalled();
    });
  });

  // Test suite for getBills function
  describe('When I call getBills', () => {
    test('Then it should fetch bills from the store', async () => {
      // Mock the store's list function to resolve with predefined bills
      const listMock = jest.fn().mockResolvedValue(bills);
      const storeMock = {
        bills: () => ({
          list: listMock,
        }),
      };

      // Instantiate Bills class with mock objects
      const myBillsInstance = new Bills({
        document,
        onNavigate: jest.fn(),
        store: storeMock,
        localStorage: localStorageMock,
      });

      // Call getBills method and wait for it to finish
      await myBillsInstance.getBills();

      // Expect the mock list function to have been called
      expect(listMock).toHaveBeenCalled();
    });

    // Test case for handling corrupted data
    test('Then it should handle the error and return unformatted date', async () => {
      // Mock formatDate to simulate an error when formatting the date
      formatDate.mockImplementation(() => {
        throw new Error('Error formatting date');
      });

      // Create a corrupted bill
      const corruptedBill = {
        id: 'corruptedBillId',
        date: 'corruptedDate',
        status: 'corruptedStatus',
      };

      // Mock store.bills().list to return a corrupted bill
      const listMock = jest.fn().mockResolvedValue([corruptedBill]);
      const storeMock = {
        bills: () => ({
          list: listMock,
        }),
      };

      // Instantiate Bills class with necessary mocks
      const myBillsInstance = new Bills({
        document: window.document,
        onNavigate: jest.fn(),
        store: storeMock,
        localStorage: localStorageMock,
      });

      // Execute getBills and capture the result
      const result = await myBillsInstance.getBills();

      // Check that the corrupted bill is returned with the unformatted date
      expect(result[0].date).toBe(corruptedBill.date);
      expect(result[0].status).toBe(formatStatus(corruptedBill.status));

      // Restore original implementations of mocked functions
      formatDate.mockRestore();
      formatStatus.mockRestore();
    });
  });



//TODO Nr.2 - Integration TEST
// Helper function to set up the test environment
const setupTestEnvironment = () => {
  // Set up the environment
  localStorage.setItem('user', JSON.stringify({ type: 'Employee', email: 'a@a' }));
  const root = document.createElement('div');
  root.setAttribute('id', 'root');
  document.body.appendChild(root);
  router();
};









});
