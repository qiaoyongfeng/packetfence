/**
 * "$_users" store module
 */
import Vue from 'vue'
import api from '../_api'

const STORAGE_SEARCH_LIMIT_KEY = 'users-search-limit'

// Default values
const state = {
  status: '',
  items: [], // search results
  users: {}, // users details
  searchQuery: null,
  searchSortBy: 'pid',
  searchSortDesc: false,
  searchMaxPageNumber: 1,
  searchPageSize: localStorage.getItem(STORAGE_SEARCH_LIMIT_KEY) || 10
}

const getters = {
  isLoading: state => state.status === 'loading'
}

const actions = {
  setSearchQuery: ({commit}, query) => {
    commit('SEARCH_QUERY_UPDATED', query)
    commit('SEARCH_MAX_PAGE_NUMBER_UPDATED', 1) // reset page count
  },
  setSearchPageSize: ({commit}, limit) => {
    localStorage.setItem(STORAGE_SEARCH_LIMIT_KEY, limit)
    commit('SEARCH_LIMIT_UPDATED', limit)
    commit('SEARCH_MAX_PAGE_NUMBER_UPDATED', 1) // reset page count
  },
  setSearchSorting: ({commit}, params) => {
    commit('SEARCH_SORT_BY_UPDATED', params.sortBy)
    commit('SEARCH_SORT_DESC_UPDATED', params.sortDesc)
    commit('SEARCH_MAX_PAGE_NUMBER_UPDATED', 1) // reset page count
  },
  search: ({state, getters, commit, dispatch}, page) => {
    let sort = [state.searchSortDesc ? `${state.searchSortBy} DESC` : state.searchSortBy]
    let body = {
      cursor: state.searchPageSize * (page - 1),
      limit: state.searchPageSize,
      sort
    }
    let apiPromise = state.searchQuery ? api.search(Object.assign(body, {query: state.searchQuery})) : api.all(body)
    return new Promise((resolve, reject) => {
      commit('SEARCH_REQUEST')
      apiPromise.then(response => {
        commit('SEARCH_SUCCESS', response)
        resolve(response)
      }).catch(err => {
        commit('SEARCH_ERROR', err.response)
        reject(err)
      })
    })
  },
  getUser: ({commit, state}, pid) => {
    return api.user(pid).then(data => {
      commit('USER_REPLACED', data)
      return state.users[pid]
    })
  },
  updateUser: ({commit}, data) => {
    delete data.access_duration
    delete data.access_level
    return api.updateUser(data).then(response => {
      commit('USER_REPLACED', data)
      return response
    })
  }
}

const mutations = {
  SEARCH_QUERY_UPDATED: (state, query) => {
    state.searchQuery = query
  },
  SEARCH_SORT_BY_UPDATED: (state, field) => {
    state.searchSortBy = field
  },
  SEARCH_SORT_DESC_UPDATED: (state, desc) => {
    state.searchSortDesc = desc
  },
  SEARCH_MAX_PAGE_NUMBER_UPDATED: (state, page) => {
    state.searchMaxPageNumber = page
  },
  SEARCH_LIMIT_UPDATED: (state, limit) => {
    state.searchPageSize = limit
  },
  SEARCH_REQUEST: (state) => {
    state.status = 'loading'
  },
  SEARCH_SUCCESS: (state, response) => {
    state.status = 'success'
    state.items = response.items
    let nextPage = Math.floor(response.nextCursor / state.searchPageSize) + 1
    if (nextPage > state.searchMaxPageNumber) {
      state.searchMaxPageNumber = nextPage
    }
  },
  SEARCH_ERROR: (state, response) => {
    state.status = 'error'
    if (response && response.data) {
      state.message = response.data.message
    }
  },
  USER_REPLACED: (state, data) => {
    Vue.set(state.users, data.pid, data)
    // TODO: update items if found in it
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
