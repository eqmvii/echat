import * as types from '../constants/actionTypes.js';

export const testCounterUp = () => {
  return {
    type: types.TEST_COUNTER_UP
  }
}

export const testCounterDown = () => {
  return {
    type: types.TEST_COUNTER_DOWN
  }
}

export const fasterRefresh = () => {
  return {
    type: types.FASTER_REFRESH
  }
}

export const slowerRefresh = () => {
  return {
    type: types.SLOWER_REFRESH
  }
}

export const toggleMode = () => {
  return {
    type: types.HTTP_TOGGLE
  }
}

export const httpCounter = () => {
  return {
    type: types.HTTP_COUNTER_UP
  }
}

export const clearMessages = () => {
  return {
    type: types.CLEAR_MESSAGES
  }
}

export const updateUsers = (userList, error, error_message) => {
  return {
    type: types.UPDATE_USER_LIST,
    error: error,
    error_message: error_message,
    payload: userList
  }
}

export const fetchUsers = () => {
  return {
    type: types.FETCH_USERS
  }
}

export const toggleDebug = () => {
  return {
    type: types.TOGGLE_DEBUG_MODE
  }
}

export const loginUser = (username) => {
  return {
    type: types.LOGIN,
    status: "Attempting...",
    username: username,
    error: false,
    done: false
  }
}

export const loginComplete = (username) => {
  return {
    type: types.LOGIN,
    status: "Success!",
    username: username,
    error: false,
    done: true
  }
}

export const loginFail = (username, message) => {
  return {
    type: types.LOGIN,
    status: message,
    username: username,
    error: true, 
    done: true
  }
}

export const logoutUser = (username) => {
  return {
    type: types.LOGOUT,
    username: username,
  }
}

export const refreshMessages = (messages, max_id) => {
  return {
    type: types.REFRESH,
    messages: messages,
    max_id: max_id
  }
}

export const clearUsers = () => {
  return {
    type: types.CLEAR_USERS
  }
}