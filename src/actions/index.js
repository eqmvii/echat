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