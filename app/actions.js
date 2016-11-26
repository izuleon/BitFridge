/** Fridge **/
export const ADD_TO_FRIDGE = 'ADD_TO_FRIDGE'
export const DEL_FROM_FRIDGE = 'DEL_FROM_FRIDGE'

export const addToFridge = ingredient => ({
  type: ADD_TO_FRIDGE,
  ingredient
})

export const delFromFridge = ingredient => ({
  type: DEL_FROM_FRIDGE,
  ingredient
})

/** Recipes **/
export const REQUEST_RECIPES = 'REQUEST_RECIPES'
export const RECEIVE_RECIPES = 'RECEIVE_RECIPES'
export const MORE_RECIPES = 'MORE_RECIPES'
export const RETRY_RECIPES = 'RETRY_RECIPES'

export const requestRecipes = (timestamp) => ({
  type: REQUEST_RECIPES,
  timestamp
})

export const receiveRecipes = (recipes, timestamp) => ({
  type: RECEIVE_RECIPES,
  recipes,
  timestamp
})

export const moreRecipes = () => ({
  type: MORE_RECIPES
})

export const retryRecipes = () => ({
  type: RETRY_RECIPES
})

/** Fridge **/
export const ADD_TO_COOKING_TODAY = 'ADD_TO_COOKING_TODAY'
export const TOGGLE_COOKING_TODAY = 'TOGGLE_COOKING_TODAY'
export const CLEAR_COOKING_TODAY = 'CLEAR_COOKING_TODAY'
export const UPDATE_MISSING_COOKING_TODAY = 'UPDATE_MISSING_COOKING_TODAY'

export const addToCookingToday = recipe => ({
  type: ADD_TO_COOKING_TODAY,
  recipe
})

export const toggleCookingToday = index => ({
  type: TOGGLE_COOKING_TODAY,
  index
})

export const clearCookingToday = () => ({
  type: CLEAR_COOKING_TODAY
})

export const updateMissingCookingToday = (fridge) => ({
  type: UPDATE_MISSING_COOKING_TODAY,
  fridge
})

/** User data **/
export const REQUEST_USER_DATA = 'REQUEST_USER_DATA'
export const RECEIVE_USER_DATA = 'RECEIVE_USER_DATA'
export const SEND_SYNC = 'SEND_SYNC'
export const ACK_SYNC = 'ACK_SYNC'

export const requestUserData = timestamp => ({
  type: REQUEST_USER_DATA,
  timestamp
})

export const receiveUserData = (userData, timestamp) => ({
  type: RECEIVE_USER_DATA,
  userData,
  timestamp
})

export const sendSync = () => ({
  type: SEND_SYNC
})

export const ackSync = () => ({
  type: ACK_SYNC
})

/** Display, ready **/
export const SET_DISPLAY = 'SET_DISPLAY'
export const SET_READY = 'SET_READY'

export const setDisplay = pathname => ({
  type: SET_DISPLAY,
  pathname
})

export const setReady = () => ({
  type: SET_READY
})

/** Error handler **/
export const HANDLE_ERROR = 'HANDLE_ERROR'
export const CLEAR_ERROR = 'CLEAR_ERROR'

export const handleError = (error, component) => ({
  type: HANDLE_ERROR,
  error,
  component
})

export const clearError = (error, component) => ({
  type: HANDLE_ERROR,
  error,
  component
})

/**
 * Asynchronous thunks
 */

import { searchResults, fetchUser, syncUser } from './clientapi'

export const preFetchRecipes = () => {
  return (dispatch, getState) => {
    const state = getState()
    const ingredients = state.fridge.contents
    const page = state.recipes.page
    if (ingredients.length > 0) {
      const timestamp = (new Date()).getTime()
      dispatch(requestRecipes(timestamp))
      searchResults(ingredients, page)
        .then(
          recipes => dispatch(receiveRecipes(recipes, timestamp)),
          error => dispatch(handleError(error, 'recipes'))
        )
    }
  }
}

export const fetchMoreRecipes = () => {
  return dispatch => {
    dispatch(moreRecipes())
    dispatch(preFetchRecipes())
  }
}

export const refreshRecipes = () => {
  return (dispatch, getState) => {
    const lastPage = getState().recipes.page
    dispatch(retryRecipes())
    while (getState().recipes.page <= lastPage) {
      dispatch(fetchMoreRecipes())
    }
  }
}

export const fetchUserData = () => {
  return dispatch => {
    const timestamp = (new Date()).getTime()
    dispatch(requestUserData(timestamp))
    fetchUser()
      .then(
        userData => dispatch(receiveUserData(userData, timestamp)),
        error => dispatch(handleError(error, 'userData'))
      )
  }
}

export const mapStateToUserData = () => {
  return (dispatch, getState) => {
    const { fridge, cookingToday, userData } = getState()
    const newFridge = fridge.map(f => f.contents)
    const newCookingToday = cookingToday.map(c => c.contents)
    const newUser = {
      ...userData.user,
      fridge: newFridge,
      cookingToday: newCookingToday
    }
    dispatch(receiveUserData(newUser))
      .catch((error) => dispatch(handleError(error, 'userData')))
  }
}

export const syncUserData = userData => {
  return (dispatch, getState) => {
    dispatch(sendSync())
    dispatch(mapStateToUserData())
    const user = getState().userData.user
    syncUser(user)
      .then(
        () => dispatch(ackSync()),
        error => dispatch(handleError(error, 'userData'))
      )
  }
}
