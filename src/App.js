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
  const listRef = React.createRef()

  let songs = allSongs
  const filterQ = q.trim().toLowerCase()
  if (filterQ) {
    songs = songs.filter(s => s.title.toLowerCase().indexOf(filterQ) > -1)
  }

  useEffect(() => {
    listRef.current && listRef.current.scrollTo(0)
  }, [listRef, location])

  const updateQ = e => {
    setQ(e.target.value)
    navigate(`/?q=${encodeURIComponent(e.target.value)}`, { replace: true })
  }

  return (
    <div className="">
      <div className="fixed top-0 left-0 w-full z-1 p-2 bg-gray-900">
        <input
          className="w-full rounded p-2 bg-gray-700 rounded text-white"
          type="text"
          placeholder="Search"
          value={q}
          onChange={updateQ}
        />
      </div>

      <div className="fixed w-full" style={{ bottom: 60, top: 57 }}>
        <FancyList songs={songs} stars={stars} ref={listRef} />
      </div>

      <TabBar active="songs" />
    </div>
  )
}

const Favorites = ({ stars }) => {
  const songs = allSongs.filter(s => stars[s.slug])

  return (
    <div>
      <h1 className="text-3xl font-bold p-2">Favorites</h1>
      <div>
        {songs.map(song => (
          <SongListItem
            key={song.slug}
            song={song}
            isStarred={stars[song.slug]}
          />
        ))}
      </div>
      <TabBar active="stars" />
    </div>
  )
}

const SongListItem = ({ song, isStarred, style = {} }) => (
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

const FancyList = React.forwardRef(({ songs, stars }, ref) => {
  const Row = ({ index, style }) => {
    const song = songs[index]
    const isStarred = stars[song.slug]
    return <SongListItem song={song} isStarred={isStarred} style={style} />
  }

  return (
    <AutoSizer>
      {({ width, height }) => (
        <List
          overscanCount={4}
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

const TabBar = ({ location, active }) => (
  <div className="h-16">
    <div className="fixed bottom-0 left-0 w-full z-1 flex bg-gray-900 border-t border-black">
      <TabItem
        name="All Songs"
        onClick={() => navigate('/')}
        isActive={active === 'songs'}
      />
      <TabItem
        name="Favorites"
        onClick={() => navigate('/stars')}
        isActive={active === 'stars'}
      />
      <TabItem
        name="About"
        isActive={active === 'about'}
        onClick={() => navigate('/about')}
      />
    </div>
  </div>
)

const TabItem = ({ name, isActive, ...rest }) => (
  <button
    className={`flex-1 p-4 text-center text-white font-bold ${
      isActive ? 'bg-blue-900' : ''
    }`}
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
      <div className="flex p-2 bg-gray-900 text-white justify-between">
        <button
          onClick={() => window.history.back()}
          className="p-2 w-32 text-center bg-gray-800 rounded text-center"
        >
          Back
        </button>
        <button
          onClick={() => toggleStar(song)}
          className={`p-2 w-32 right rounded float-right text-center ${
            isStarred ? 'bg-blue-700' : 'bg-gray-800'
          }`}
        >
          <Star on={isStarred} />
          {isStarred ? 'Starred' : 'Star'}
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

const About = () => (
  <div className="p-4 pb-64">
    <h1 className="my-2 text-xl font-bold">Bluegrass Lyrics Mobile</h1>
    <p className="my-2 leading-relaxed">
      All the songs of{' '}
      <a href="https://bluegrasslyrics.com">bluegrasslyrics.com</a> made
      available offline.
    </p>
    <p className="my-2 leading-relaxed">
      You can use the Add to Homescreen button to get an app icon and fullscreen
      experience try it.
    </p>

    <div className="mt-8 py-4 border-t font-bold">
      Danger Zone: <br />
      <button
        className="p-2 px-4 bg-red-900 text-white rounded shadow"
        onClick={() => window.location.reload()}
      >
        Reload
      </button>
    </div>

    <TabBar active="about" />
  </div>
)

export default function App() {
  const [stars, setStars] = useState(initialStars)

  const toggleStar = song => {
    stars[song.slug] = !stars[song.slug]
    localStorage.setItem('stars', JSON.stringify(stars))
    setStars({ ...stars })
  }

  return (
    <Router primary={false}>
      <SongList path="/" stars={stars} />
      <Favorites path="/stars" stars={stars} />
      <SongDetail path="song/:slug" stars={stars} toggleStar={toggleStar} />
      <About path="/about" />
    </Router>
  )
}
