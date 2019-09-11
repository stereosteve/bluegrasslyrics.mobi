import { Link, Router, navigate } from '@reach/router'
import React, { useState, useEffect } from 'react'
import allSongs from './songs.json'
import { FixedSizeList as List } from 'react-window'
import AutoSizer from 'react-virtualized-auto-sizer'

// on boot load existing stars from localstorage
const initialStars = JSON.parse(localStorage.getItem('stars') || '{}')

let scrollHack = 0

function SongList({ location, stars }) {
  const urlParams = new URLSearchParams(location.search)

  const [q, setQ] = useState(urlParams.get('q') || '')
  const starFilter = urlParams.get('stars') === '1'
  const listRef = React.createRef()

  let songs = allSongs
  const filterQ = q.trim().toLowerCase()
  if (filterQ) {
    songs = songs.filter(s => s.title.toLowerCase().indexOf(filterQ) > -1)
  }
  if (starFilter) {
    songs = songs.filter(s => stars[s.slug])
  }

  const toggleStarFilter = () => {
    const p = starFilter ? '/' : '/?stars=1'
    setQ('')
    navigate(p, { replace: true })
  }

  useEffect(() => {
    listRef.current && listRef.current.scrollTo(0)
  }, [listRef, location])

  const showAllSongs = () => {
    setQ('')
    navigate('/', { replace: true })
  }

  const updateQ = e => {
    setQ(e.target.value)
    navigate(`/?q=${encodeURIComponent(e.target.value)}`, { replace: true })
  }

  return (
    <div className="">
      {starFilter ? (
        <h1 className="p-3 text-xl font-bold border-b">Favorites</h1>
      ) : (
        <div className="fixed top-0 left-0 w-full z-1 p-2 bg-blue-300">
          <input
            className="w-full rounded p-2 py-1 bg-gray-300 rounded focus:bg-white border-b"
            type="text"
            placeholder="Search"
            value={q}
            onChange={updateQ}
          />
        </div>
      )}

      <div className="fixed w-full" style={{ bottom: 60, top: 55 }}>
        <Listy songs={songs} stars={stars} ref={listRef} />
      </div>
      <div className="fixed bottom-0 left-0 w-full z-1 flex bg-blue-300 border-t border-blue-400">
        <TabItem
          name="All Songs"
          onClick={showAllSongs}
          isActive={!starFilter}
        />
        <TabItem
          name="Favorites"
          onClick={toggleStarFilter}
          isActive={starFilter}
        />
        <TabItem name="Reload" onClick={() => window.location.reload()} />
      </div>
    </div>
  )
}

const Listy = React.forwardRef(({ songs, stars }, ref) => {
  const Row = ({ index, style }) => {
    const song = songs[index]
    const isStarred = stars[song.slug]
    return (
      <div className="p-2 flex border-b" style={style}>
        <Link to={`/song/${song.slug}`} className="flex-grow truncate">
          {song.title}
        </Link>
        {isStarred && (
          <span className="">
            <Star />
          </span>
        )}
      </div>
    )
  }

  return (
    <AutoSizer>
      {({ width, height }) => (
        <List
          ref={ref}
          itemCount={songs.length}
          itemSize={42}
          width={width}
          height={height}
          initialScrollOffset={scrollHack}
          onScroll={e => (scrollHack = e.scrollOffset)}
        >
          {Row}
        </List>
      )}
    </AutoSizer>
  )
})

const TabItem = ({ name, isActive, ...rest }) => (
  <button
    className={`flex-1 p-4 text-center ${isActive ? 'bg-blue-500' : ''}`}
    {...rest}
  >
    {name}
  </button>
)

const Star = ({ on = false }) => <span>{on ? '🌟' : '⭐'}</span>

function SongDetail({ slug, stars, toggleStar }) {
  const song = allSongs.find(s => s.slug === slug)
  const isStarred = stars[song.slug]

  return (
    <div className="bg-white">
      <div className="flex p-2 bg-gray-200">
        <button
          onClick={() => window.history.back()}
          className="flex p-2 w-32 text-center bg-gray-100"
        >
          Back
        </button>
        <button
          onClick={() => toggleStar(song)}
          className={`flex ml-2 p-2 w-32 focus:outline-none ${
            isStarred ? 'bg-green-300' : 'bg-gray-100'
          }`}
        >
          <Star on={isStarred} />
          {isStarred ? 'Unstar' : 'Star'}
        </button>
      </div>

      <div className="p-2">
        <h1 className="text-xl font-bold mb-4">{song.title}</h1>
        <div
          className="content"
          dangerouslySetInnerHTML={{ __html: song.content }}
        />
      </div>
    </div>
  )
}

export default function App() {
  const [stars, setStars] = useState(initialStars)

  const toggleStar = song => {
    stars[song.slug] = !stars[song.slug]
    localStorage.setItem('stars', JSON.stringify(stars))
    setStars({ ...stars })
  }

  return (
    <Router>
      <SongList path="/" stars={stars} />
      <SongDetail path="song/:slug" stars={stars} toggleStar={toggleStar} />
    </Router>
  )
}
