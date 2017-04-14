import axios from 'axios'

import {generateGetters} from 'utils'

const RESET_SONG_LIST = 'RESET_SONG_LIST'
const INIT_AUDIO = 'INIT_AUDIO'
const TOGGLE_PLAY = 'TOGGLE_PLAY'
const DELETE_SONG = 'DELETE_SONG'
const TOGGLE_SONG = 'TOGGLE_SONG'
const DURATION_CHANGE = 'DURATION_CHANGE'
const TIME_UPDATE = 'TIME_UPDATE'
const TOGGLE_SEARCH = 'TOGGLE_SEARCH'
const SET_SONG_SRC = 'SET_SONG_SRC'

const state = {
  audio: null,
  playing: false,
  currentTime: 0,
  songSrc: null,
  singerName: null,
  songName: null,
  albumImg: null,
  songIndex: 0,
  songDuration: 0,
  songList: [],
  songs: [],
  searched: false
}

const getters = generateGetters(Object.keys(state))

const actions = {
  async checkSongLit({dispatch, state}, index) {
    const {songs} = state

    let cache = songs[index]

    if (!cache) {
      cache = songs[index] = (await axios.get(`/${index ? 'all' : 'new'}-songs`)).data
    }

    dispatch('restSongList', cache)
  },
  restSongList({commit}, songList) {
    commit(RESET_SONG_LIST, songList)
    commit(TOGGLE_SONG, 0)
  },
  initAudio({commit}, audio) {
    commit(INIT_AUDIO, audio)
  },
  togglePlay({commit}, force) {
    commit(TOGGLE_PLAY, force)
  },
  deleteSong({commit}, index) {
    commit(DELETE_SONG, index)
  },
  toggleSong({commit}, {index, play}) {
    state.songIndex === index || commit(TOGGLE_SONG, index)
    play && setTimeout(() => commit(TOGGLE_PLAY, true), 0)
  },
  durationChange({commit}) {
    commit(DURATION_CHANGE)
  },
  timeUpdate({commit}, currentTime) {
    isNaN(currentTime) || (state.audio.currentTime = currentTime)
    commit(TIME_UPDATE)
  },
  playEnded({dispatch, state}) {
    const songLength = state.songList.length
    const songIndex = state.songIndex + 1
    dispatch('toggleSong', {
      index: songIndex < songLength ? songIndex : 0,
      play: true
    })
  },
  toggleSearch({commit}, payload) {
    commit(TOGGLE_SEARCH, payload)
  },
  setSongSrc({commit}, songSrc) {
    commit(SET_SONG_SRC, songSrc)
  }
}

const mutations = {
  [RESET_SONG_LIST](state, songList) {
    state.songList = (songList || [])
  },
  [INIT_AUDIO](state, audio) {
    state.audio = audio
  },
  [TOGGLE_PLAY](state, force) {
    if (!state.songSrc) return
    state.audio[(state.playing = force || !state.playing) ? 'play' : 'pause']()
  },
  [DELETE_SONG](state, index) {
    state.songList.splice(index, 1)
  },
  [TOGGLE_SONG](state, index) {
    const song = state.songList[index]
    song && Object.assign(state, {
      currentTime: 0,
      songSrc: song.wait ? null : `http://ws.stream.qqmusic.qq.com/${song.id}.m4a?fromtag=46`,
      singerName: song.singerName,
      songName: song.songName,
      // eslint-disable-next-line max-len
      albumImg: song.albumImg || `//imgcache.qq.com/music/photo/album_300/${song.albumId % 100}/300_albumpic_${song.albumId}_0.jpg`,
      songIndex: index,
      songDuration: 0,
      playing: false
    })
  },
  [DURATION_CHANGE](state) {
    state.songDuration = state.audio.duration
  },
  [TIME_UPDATE](state) {
    state.currentTime = state.audio.currentTime
  },
  [TOGGLE_SEARCH](state, payload) {
    state.searched = payload
  },
  [SET_SONG_SRC](state, songSrc) {
    state.songSrc = songSrc
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
