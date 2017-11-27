import * as actions from './index.js';
import * as types from '../constants/actionTypes.js';

describe('actions', () => {

    it('should create an action to increment a test counter', () => {
        const expectedAction = {
            type: types.TEST_COUNTER_UP
        }
        expect(actions.testCounterUp()).toEqual(expectedAction)
    });

    it('should create an action to decrement a test counter', () => {
        const expectedAction = {
            type: types.TEST_COUNTER_DOWN
        }
        expect(actions.testCounterDown()).toEqual(expectedAction)
    })

    it('should create an action to make refresh faster', () => {
        const expectedAction = {
            type: types.FASTER_REFRESH
        }
        expect(actions.fasterRefresh()).toEqual(expectedAction)
    })

    it('should create an action to make refresh slower', () => {
        const expectedAction = {
            type: types.SLOWER_REFRESH
        }
        expect(actions.slowerRefresh()).toEqual(expectedAction)
    })

    it('should create an action to toggle DDOS/long polling', () => {
        const expectedAction = {
            type: types.HTTP_TOGGLE
        }
        expect(actions.toggleMode()).toEqual(expectedAction)
    })

    it('should create an action to increment the HTTP request counter', () => {
        const expectedAction = {
            type: types.HTTP_COUNTER_UP
        }
        expect(actions.httpCounter()).toEqual(expectedAction)
    })

    it('should create an action to clear all messages', () => {
        const expectedAction = {
            type: types.CLEAR_MESSAGES
        }
        expect(actions.clearMessages()).toEqual(expectedAction)
    })

    it('should create an action to update the user list', () => {
        const error_message = "this is a test";
        const expectedAction = {
            type: types.UPDATE_USER_LIST,
            error: false,
            error_message: error_message,
            payload: []
        }
        expect(actions.updateUsers([], false, error_message)).toEqual(expectedAction)
    })

    it('should create an action to get a user list from the server', () => {
        const expectedAction = {
            type: types.FETCH_USERS
        }
        expect(actions.fetchUsers()).toEqual(expectedAction)
    })

    it('should create an action to toggle debug mode on/off', () => {
        const expectedAction = {
            type: types.TOGGLE_DEBUG_MODE
        }
        expect(actions.toggleDebug()).toEqual(expectedAction)
    })

    it('should create an action to attempt a login', () => {
        const username = "test_user";
        const expectedAction = {
            type: types.LOGIN,
            username: username,
            status: "Attempting...",
            error: false,
            done: false
        }
        expect(actions.loginUser(username)).toEqual(expectedAction)
    })

    it('should create an action to complete a succesful login', () => {
        const username = "test_user";
        const expectedAction = {
            type: types.LOGIN,
            username: username,
            status: "Success!",
            error: false,
            done: true
        }
        expect(actions.loginComplete(username)).toEqual(expectedAction)
    })

    it('should create an action to update state for a failed login', () => {
        const username = "test_user";
        const message = "login error message";
        const expectedAction = {
            type: types.LOGIN,
            username: username,
            status: message,
            error: true,
            done: true
        }
        expect(actions.loginFail(username, message)).toEqual(expectedAction)
    })

    it('should create an action to logout the current user', () => {
        const username = "test_user";
        const expectedAction = {
            type: types.LOGOUT,
            username: username,
        }
        expect(actions.logoutUser(username)).toEqual(expectedAction)
    })

    it('should create an action to update the message list from the server', () => {
        const messages = [];
        const max_id = 10;
        const expectedAction = {
            type: types.REFRESH,
            messages: messages,
            max_id: max_id
        }
        expect(actions.refreshMessages(messages, max_id)).toEqual(expectedAction)
    })

    it('should create an action to logout all users', () => {
        const expectedAction = {
            type: types.CLEAR_USERS
        }
        expect(actions.clearUsers()).toEqual(expectedAction)
    })

})