import { Link, Router } from '@reach/router'
import React, { useState } from 'react'
import allSongs from './songs.json'

const cx = {}
cx.button = ``
cx.button_on = ``

// on boot load existing stars from localstorage
const initialStars = JSON.parse(localStorage.getItem('stars') || '{}')

function SongList({ children, stars }) {
  const [q, setQ] = useState('')
  const [starFilter, setStarFilter] = useState(false)

  let songs = allSongs
  const filterQ = q.trim().toLowerCase()
  if (filterQ) {
    songs = songs.filter(s => s.title.toLowerCase().indexOf(filterQ) > -1)
  }
  if (starFilter) {
    songs = songs.filter(s => stars[s.slug])
  }

  const toggleStarFilter = () => {
    setStarFilter(!starFilter)
    setQ('')
  }

  const updateQ = e => {
    setStarFilter(false)
    setQ(e.target.value)
  }

  return (
    <div>
      <div className="flex p-2 border-b-2 border-red-900 bg-red-800 fixed w-full top-0">
        <input
          className="flex-grow border border-gray-500 rounded-none p-3 focus:outline-none focus:bg-yellow-100"
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
      </div>
      <div className="pb-12">&nbsp;</div>
      <div className="SongList">
        {songs.map(song => (
          <SongListItem
            song={song}
            isStarred={stars[song.slug]}
            key={song.slug}
          />
        ))}
      </div>
      {children}
    </div>
  )
}

const Star = ({ on = false }) => <span>{on ? '🌟' : '⭐'}</span>

const SongListItem = ({ song, isStarred }) => {
  return (
    <div className="p-3 border-b border-gray-400 font-bold">
      <Link to={`/song/${song.slug}`}>{song.title}</Link>
      {isStarred && (
        <span className="float-right">
          <Star />
        </span>
      )}
    </div>
  )
}

function SongDetail({ slug, stars, toggleStar }) {
  const song = allSongs.find(s => s.slug === slug)
  const isStarred = stars[song.slug]

  return (
    <div className="fixed top-0 w-full h-full bg-white overflow-auto z-10">
      <div className="flex p-2 bg-gray-200">
        <Link to="/" className="flex p-2 w-32 text-center bg-gray-100">
          ❌ Close
        </Link>
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
    <div className="antialiased font-serif">
      <Router primary={false}>
        <SongList path="/" stars={stars}>
          <SongDetail path="song/:slug" stars={stars} toggleStar={toggleStar} />
        </SongList>
      </Router>
    </div>
  )
}
