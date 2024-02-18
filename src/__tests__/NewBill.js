/**
 * @jest-environment jsdom
 */

import { screen, fireEvent } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";



describe("Given I am connected as an employee", () => {
    describe("When I am on NewBill Page", () => {

        beforeEach(() => {
            // Mocking localStorage to simulate the user being logged in
            Object.defineProperty(window, 'localStorage', { value: localStorageMock });
            // Setting a user object in localStorage with type 'Employee'
            window.localStorage.setItem('user', JSON.stringify({ //Bassically is indicating that the user is logged in as an employee.
                type: 'Employee'
            }));
            // Rendering the NewBill UI and setting it as the inner HTML of the document body
            const html = NewBillUI()
            document.body.innerHTML = html
        })

        afterEach(() => {
            document.body.innerHTML = '';
        });

        // Test to check if the handleChangeFile() function is called when a file is added
        test("Then the handleChangeFile() function is called when a file is added", () => {
            // Creating a new instance of NewBill with necessary dependencies
            const newBill = new NewBill({ document, onNavigate: {}, store: mockStore, localStorage: {} });
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
                    files: [new File(['test'], 'test.png', { type: 'image/png' })] 
                }
            });
            // Expecting handleChange to have been called
            expect(handleChange).toHaveBeenCalled();
            // Expecting the name of the selected file to be 'test.png'
            expect(inputFile.files[0].name).toBe('test.png');
        });








    });
});