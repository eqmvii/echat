import rootReducer from './rootReducer.js';
import * as types from '../constants/actionTypes.js';
import initialState from './initialState.js';


describe('todos reducer', () => {

    it('should return the initial state for an unknown action', () => {
        expect(rootReducer(undefined, {})).toEqual(initialState)
    })

    it('should handle faster refresh', () => {
        expect(rootReducer(undefined, { type: types.FASTER_REFRESH }).refresh_rate).toEqual(initialState.refresh_rate - 100)
    })

    it('should handle slower refresh', () => {
        expect(rootReducer(undefined, { type: types.SLOWER_REFRESH }).refresh_rate).toEqual(initialState.refresh_rate + 100)
    })

    it('should handle HTTP toggle from DDOS to long polling', () => {
        expect(rootReducer({refresh_mode: 0 }, { type: types.HTTP_TOGGLE }).refresh_mode).toEqual(1)
    })

    it('should handle HTTP toggle from long polling to DDOS', () => {
        expect(rootReducer({refresh_mode: 1 }, { type: types.HTTP_TOGGLE }).refresh_mode).toEqual(0)
    })

    // TODO: Add more reducer testing

})