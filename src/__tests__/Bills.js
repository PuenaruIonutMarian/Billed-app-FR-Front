/**
 * @jest-environment jsdom
 */

import mockStore from '../__mocks__/store';
import { localStorageMock } from '../__mocks__/localStorage.js';
import { screen, waitFor} from '@testing-library/dom';
import BillsUI from '../views/BillsUI.js';
import { bills } from '../fixtures/bills.js';
import { ROUTES_PATH, ROUTES } from '../constants/routes.js';
import router from '../app/Router.js';
import Bills from '../containers/Bills.js';
import { formatDate, formatStatus } from '../app/format.js';
import '@testing-library/jest-dom';

// Reuse mocks for formatDate and formatStatus
jest.mock('../app/format.js', () => ({
  formatDate: jest.fn(),
  formatStatus: jest.fn(),
}));

// Jest mock for store
jest.mock('../app/store', () => mockStore);

// Helper function to set up the test environment
const setupTestEnvironment = () => {
  localStorage.setItem('user', JSON.stringify({ type: 'Employee', email: 'a@a' }));
  const root = document.createElement('div');
  root.setAttribute('id', 'root');
  document.body.appendChild(root);
  router();
};

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
      // Checking whether the windowIcon element has a CSS class active-icon
      expect(windowIcon.classList.contains('active-icon')).toBe(true);
      //OR
      //expect(windowIcon).toHaveClass('active-icon');
    })

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })



//TODO Nr.2 CONTAINER / BILLS 

  // Test suite for interactions on the Bills Page
  describe('Given I am connected as an employee', () => {
    let myBillsInstance; // Reusable instance

    beforeEach(() => {
      // Mock the instance of Bills
      // The purpose is to ensure that each test starts with a fresh instance of Bills
      const onNavigate = jest.fn();
      myBillsInstance = new Bills({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });
    });

    afterEach(() => {
      myBillsInstance = null;
    });

    // //TODO  UNITARY TESTS
    // FIXME the tests doesn't seem to apply for rows 13 to 33. The main problem seems to be the test for NewBill. But if I fix new bill the eye icons it's not ok, and after getBills it's not ok.
    //NOTE: I have tried spyON, fireEvent,wait, waitFor, await waitFor plus async, separate statements from main the structure. NOTHING worked

    //  Test cases for interactions with buttons and icons
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
        // Mocking jQuery's modal function
        jQuery.fn.modal = () => {};
        // Spy on the handleClickIconEye function
        const handleClickIconEyeSpy = jest.spyOn(myBillsInstance, 'handleClickIconEye');
        // Query the eye icon
        const iconEye = document.querySelectorAll(`div[data-testid="icon-eye"]`);
        expect(iconEye).toBeDefined();
        // Trigger click on the icon
        iconEye[0].click();
        // Expect the original function to be called
        expect(handleClickIconEyeSpy).toHaveBeenCalled();
      });
    });


    // Test suite for getBills function
    describe('When I call getBills', () => {
      it('should fetch bills from the store', async () => {
        // Spy on the store's list function
        const listMock = jest.spyOn(mockStore.bills(), 'list');
        // Instantiate Bills class with mock objects
        const myBillsInstance = new Bills({
          document,
          onNavigate: jest.fn(),
          store: mockStore,
          localStorage: localStorageMock,
        });
        // Call getBills method and wait for it to finish
        await myBillsInstance.getBills();
        // Expect the original list function to have been called
        expect(listMock).toHaveBeenCalled();
      });
      


      // Test case for handling corrupted data
      it('should handle errors and return unformatted date in case of formatting failure', async () => {
        // Mocking formatDate to simulate an error during date formatting
        formatDate.mockImplementation(() => {
          throw new Error('Error occurred while formatting the date');
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
          document: window.document,//global object used to access the Document object in the browser environment 
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

    //TODO  Integration TEST

    // Test suite for GET Bills API call
    describe('When I navigate to Bills', () => {

      // Test to verify if the bills are fetched from the API
      it('should fetch bills from mock API GET', async () => {
        setupTestEnvironment();
        window.onNavigate(ROUTES_PATH.Bills);
        await waitFor(() => screen.getByText('Mes notes de frais'));
        expect(screen.getByTestId('btn-new-bill')).toBeTruthy();
        expect(screen.getAllByTestId('icon-eye')).toBeTruthy();
        expect(screen.getAllByTestId('icon-window')).toBeTruthy();
      });

      // Test suite for GET Bills API call
      describe('When an error occurs on API', () => {
        beforeEach(() => {
          jest.spyOn(mockStore, 'bills');
          Object.defineProperty(window, 'localStorage', {
            value: localStorageMock,
          });
          window.localStorage.setItem(
            'user',
            JSON.stringify({
              type: 'Employee',
              email: 'a@a',
            })
          );
          const root = document.createElement('div');
          root.setAttribute('id', 'root');
          document.body.appendChild(root);
          router();
        });

        // Test for 404 error case
        it('fetches bills from an API and fails with 404 message error', async () => {
          mockStore.bills.mockImplementationOnce(() => {
            return {
              list: () => {
                return Promise.reject(new Error('Erreur 404'));
              },
            };
          });
          window.onNavigate(ROUTES_PATH.Bills);
          await new Promise(process.nextTick);
          const message = await screen.getByText(/Erreur 404/);
          expect(message).toBeTruthy();
        });

        // Test for 500 error case
        it('fetches bills from an API and fails with 500 message error', async () => {
          mockStore.bills.mockImplementationOnce(() => {
            return {
              list: () => {
                return Promise.reject(new Error('Erreur 500'));
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
  });
});
