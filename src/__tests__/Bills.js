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



// Test suite for interactions on the Bills Page
describe('Given I am connected as an employee', () => {
  let myBillsInstance; // Reusable instance

  // Common setup function
  beforeEach(() => {
    const onNavigate = jest.fn();
    myBillsInstance = new Bills({
      document,
      onNavigate,
      store: mockedBills,
      localStorage: window.localStorage,
    });
  });

  // Describe block for 'New Bill' button interaction
  describe('Interaction with "New Bill" button', () => {
    // Test to verify if the 'New Bill' button has a click event listener
    it('should have an event listener for click', () => {
      myBillsInstance.handleClickNewBill = jest.fn();
      const buttonNewBill = document.querySelector(`button[data-testid="btn-new-bill"]`);
      expect(buttonNewBill).toBeDefined();
      buttonNewBill.click();
      expect(myBillsInstance.onNavigate).toHaveBeenCalledWith(ROUTES_PATH['NewBill']);
    });
  });

  // Describe block for 'eye' icon interaction
  describe('Interaction with "eye" icons', () => {
    // Test to verify if each 'eye' icon has a click event listener
    it('should have an event listener for click', () => {
      jQuery.fn.modal = () => {}; // Mock jQuery's modal function
      const iconEye = document.querySelectorAll(`div[data-testid="icon-eye"]`);
      expect(iconEye).toBeDefined();
      myBillsInstance.handleClickIconEye = jest.fn();
      iconEye[0].click();
      expect(myBillsInstance.handleClickIconEye).toHaveBeenCalled();
    });
  });


//  GET Bills test case for the getBills function.
  describe('GET Bills', () => {
    it('should return an array of bills', async () => {
      const bills = await myBillsInstance.getBills();
      expect(bills).toEqual(bills);
    });
    it('should handle corrupted data and return unformatted date', async () => {
    // Mocking store to return corrupted data
    const mockedCorruptedData = [{ date: 'corrupted_date', status: 'pending' }];
    myBillsInstance.store = {
      bills: () => ({
        list: () => Promise.resolve(mockedCorruptedData),
      }),
    };

    // Mocking console.log to capture the logged error
    console.log = jest.fn();

    // Calling getBills
    const bills = await myBillsInstance.getBills();

    // Expectations
    expect(console.log).toHaveBeenCalled(); // Verify if console.log was called
    expect(bills.length).toBe(1); // Verify if bills array is returned
    expect(bills[0].date).toBe('corrupted_date'); // Verify if unformatted date is returned
    expect(bills[0].status).toBe('En attente'); // Verify if status is returned as expected
  });
  })



    afterEach(() => {
    myBillsInstance = null;
  });



});