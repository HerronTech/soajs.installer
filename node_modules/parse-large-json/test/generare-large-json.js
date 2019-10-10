'use strict'

const coinflip = (a, b) => Math.random() > 0.5 ? a : b
const rnd = n => Math.floor(Math.random() * n)

const makeString = length => {
  let string = ''
  while (length--) {
    string += String.fromCharCode(Math.floor(Math.random() * 200))
  }
  return string
}

const primitives = [
  () => makeString(rnd(200)),
  () => 0.5 - Math.random(),
  () => null,
  () => coinflip(true, false)
]
const randomPrimitive = () => primitives[rnd(primitives.length)]

const populate = (n, obj) => {
  if (!obj) {
    obj = {}
  }
  for (let i = 0; i < n; i++) {
    obj[i] = randomPrimitive()()
  }
  return obj
}

const makeSeason = () => {
  const season = populate(5, {
    episodes: []
  })
  let ep = 12
  while (ep--) {
    season.episodes[ep] = populate(25)
  }
  return season
}

const makeShow = () => {
  const show = populate(10, {
    seasons: []
  })
  let se = 10
  while (se--) {
    show.seasons[se] = makeSeason()
  }
  return show
}

const makeShows = () => {
  const shows = populate(2, {
    items: []
  })
  let sh = 100
  while (sh--) {
    shows.items[sh] = makeShow()
  }
  return shows
}

const makeMovies = () => {
  const movies = []
  let mo = 250
  while (mo--) {
    movies[mo] = populate(20)
  }
  return movies
}

module.exports = {
  shows: makeShows(),
  movies: makeMovies()
}

console.log('made', module.exports)
