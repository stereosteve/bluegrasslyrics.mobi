import { Link, Router } from '@reach/router'
import React, { useState } from 'react'
import allSongs from './songs.json'

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

  return (
    <div>
      <div className="search-bar">
        <input
          type="search"
          placeholder="Search"
          value={q}
          onChange={e => setQ(e.target.value)}
        />
        <button onClick={() => setStarFilter(!starFilter)}>
          {starFilter ? '****' : '*'}
        </button>
      </div>
      <div className="SongList">
        {songs.map(song => {
          return (
            <div className="item" key={song.slug}>
              <Link to={`/song/${song.slug}`}>{song.title}</Link>
              {stars[song.slug] ? '*' : ''}
            </div>
          )
        })}
      </div>
      {children}
    </div>
  )
}

function SongDetail({ slug, stars, toggleStar }) {
  const song = allSongs.find(s => s.slug === slug)

  return (
    <div className="SongDetail">
      <div className="inner">
        <Link to="/">close</Link>
        <button onClick={() => toggleStar(song)}>
          {stars[song.slug] ? 'Unstar' : 'Star'}
        </button>
        <h1>{song.title}</h1>
        <div dangerouslySetInnerHTML={{ __html: song.content }} />
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
    <div>
      <Router primary={false}>
        <SongList path="/" stars={stars}>
          <SongDetail path="song/:slug" stars={stars} toggleStar={toggleStar} />
        </SongList>
      </Router>
    </div>
  )
}
