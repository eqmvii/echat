/*
let nextTodoId = 0
export const addTodo = text => {
  return {
    type: 'ADD_TODO',
    id: nextTodoId++,
    text
  }
}

export const setVisibilityFilter = filter => {
  return {
    type: 'SET_VISIBILITY_FILTER',
    filter
  }
}

export const toggleTodo = id => {
  return {
    type: 'TOGGLE_TODO',
    id
  }
}
*/

export const TEST_COUNTER_UP = 'TEST_COUNTER_UP';
export const TEST_COUNTER_DOWN = 'TEST_COUNTER_DOWN';
export const FASTER_REFRESH = 'FASTER_REFRESH';
export const SLOWER_REFRESH = 'SLOWER_REFRESH';
export const HTTP_TOGGLE = 'HTTP_TOGGLE';
export const UPDATE_USER_LIST = 'UPDATE_USER_LIST';
export const FETCH_USERS = 'FETCH_USERS';
export const TOGGLE_DEBUG_MODE = 'TOGGLE_DEBUG_MODE';
export const LOGIN = 'LOGIN';
export const LOGOUT = 'LOGOUT';
export const REFRESH = 'REFRESH';

export const testCounterUp = () => {
  return {
    type: TEST_COUNTER_UP
  }
}

export const testCounterDown = () => {
  return {
    type: TEST_COUNTER_DOWN
  }
}

export const fasterRefresh = () => {
  return {
    type: FASTER_REFRESH
  }
}

export const slowerRefresh = () => {
  return {
    type: SLOWER_REFRESH
  }
}

export const toggleMode = () => {
  return {
    type: HTTP_TOGGLE
  }
}

export const updateUsers = (userList, error, error_message) => {
  return {
    type: UPDATE_USER_LIST,
    error: error,
    error_message: error_message,
    payload: userList
  }
}

export const fetchUsers = () => {
  return {
    type: FETCH_USERS
  }
}

export const toggleDebug = () => {
  return {
    type: TOGGLE_DEBUG_MODE
  }
}

export const loginUser = (username) => {
  return {
    type: LOGIN,
    status: "Attempting...",
    username: username,
    error: false,
    done: false
  }
}

export const loginComplete = (username) => {
  return {
    type: LOGIN,
    status: "Success!",
    username: username,
    error: false,
    done: true
  }
}

export const loginFail = (username) => {
  return {
    type: LOGIN,
    status: `Username ${username} already taken!`,
    username: username,
    error: true, 
    done: true
  }
}

export const logoutUser = (username) => {
  return {
    type: LOGOUT,
    username: username,
  }
}

export const refreshMessages = (messages, max_id) => {
  return {
    type: REFRESH,
    messages: messages,
    max_id: max_id
  }
}