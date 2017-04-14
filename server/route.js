import vm from 'vm'
import axios from 'axios'
import encoding from 'encoding'
import musicAPI from 'music-api'
import qs from 'qs'

const parseJsonp = data => vm.runInNewContext(`const JsonCallback = v => v; ${encoding.convert(data, 'utf8', 'gbk')}`)

const parseUrl = url => qs.parse(url.split('?')[1])

export default router => {
  router.get('/:type(all|new)-songs', async ctx => {
    const url = `https://music.qq.com/musicbox/shop/v3/data/hit/hit_${ctx.url.includes('all') ? 'all' : 'newsong'}.js`
    ctx.body = parseJsonp((await axios.get(url, {
      responseType: 'arraybuffer'
    })).data).songlist
  })

  router.get('/search-keyword', async ctx => {
    ctx.body = (await musicAPI.searchSong('netease', {
      key: parseUrl(ctx.url).key
    })).songList.map(({id, name: songName, album: {coverBig: albumImg}, artists}) => ({
      id,
      albumImg,
      singerName: artists[0].name,
      songName,
      wait: true
    }))
  })

  router.get('/get-song-src', async ctx => {
    ctx.body = (await musicAPI.getSong('netease', {
      id: parseUrl(ctx.url).id
    })).url
  })
}
