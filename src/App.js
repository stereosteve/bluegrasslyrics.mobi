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

  const [height, setHeight] = useState(window.innerHeight)
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

  const showAllSongs = () => {
    setQ('')
    navigate('/', { replace: true })
  }

  const updateQ = e => {
    setQ(e.target.value)
    navigate(`/?q=${encodeURIComponent(e.target.value)}`, { replace: true })
    listRef.current.scrollTo(0)
  }

  // when running in PWA mode the 'resize' event will report the old size if you do
  // portrait -> landscape -> portrait on ios
  // so use a ticker to poll the innerHeight
  useEffect(() => {
    const ticker = setInterval(() => {
      setHeight(window.innerHeight)
    }, 500)

    return () => {
      clearInterval(ticker)
    }
  }, [])

  const Row = ({ index, style }) => {
    const song = songs[index]
    const isStarred = stars[song.slug]
    return (
      <div
        className="p-3 flex border-b border-gray-400 font-bold"
        style={style}
      >
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
    <div className="flex flex-col" style={{ height }}>
      <div className="flex p-2 border-b border-gray-600 bg-gray-300">
        <input
          className="flex-grow border border-gray-500 rounded-none p-1 bg-gray-100 rounded focus:bg-white"
          type="text"
          placeholder="Search"
          value={q}
          onChange={updateQ}
        />
      </div>

      <div className="flex flex-grow">
        <AutoSizer>
          {({ width, height }) => (
            <List
              ref={listRef}
              itemCount={songs.length}
              itemSize={50}
              width={width}
              height={height}
              initialScrollOffset={scrollHack}
              onScroll={e => (scrollHack = e.scrollOffset)}
            >
              {Row}
            </List>
          )}
        </AutoSizer>
      </div>
      <div className="flex bg-gray-300 border-t border-gray-600">
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

const TabItem = ({ name, isActive, ...rest }) => (
  <button
    className={`flex-1 p-4 text-center ${isActive ? 'bg-orange-300' : ''}`}
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
