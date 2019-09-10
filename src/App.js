import { Link, Router, navigate } from '@reach/router'
import React, { useState } from 'react'
import allSongs from './songs.json'
import { FixedSizeList as List } from 'react-window'
import AutoSizer from 'react-virtualized-auto-sizer'
import Div100vh from 'react-div-100vh'

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

  const updateQ = e => {
    setQ(e.target.value)
    navigate(`/?q=${encodeURIComponent(e.target.value)}`, { replace: true })
    listRef.current.scrollTo(0)
  }

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
    <Div100vh className="flex flex-col overflow-hidden">
      <div className="flex p-2 border-b-2 border-orange-600 bg-orange-300">
        <input
          className="flex-grow border border-gray-500 rounded-none p-3 bg-orange-100 focus:bg-white"
          type="text"
          placeholder="Search"
          value={q}
          onChange={updateQ}
        />
        <button
          onClick={toggleStarFilter}
          className={`flex p-3 border border-l-0 border-gray-500 focus:outline-none ${
            starFilter ? 'bg-red-500' : 'bg-green-100'
          }`}
        >
          <Star on={starFilter} />
        </button>
        <button
          className="p-2 bg-white border border-gray-500 border-l-0"
          onClick={() => window.location.reload()}
        >
          reload
        </button>
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
    </Div100vh>
  )
}

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
