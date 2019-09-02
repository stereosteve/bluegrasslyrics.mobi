import { Link, Router } from '@reach/router'
import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import * as serviceWorker from './serviceWorker'
import songs from './songs.json'

function SongList({ children }) {
  return (
    <div>
      <div className="SongList">
        {songs.map(song => {
          return (
            <div className="item" key={song.slug}>
              <Link to={`/song/${song.slug}`}>{song.title}</Link>
            </div>
          )
        })}
      </div>
      {children}
    </div>
  )
}

function SongDetail({ id }) {
  const song = songs.find(s => s.slug === id)
  return (
    <div className="SongDetail">
      <div className="inner">
        <Link to="/">close</Link>
        <h1>{song.title}</h1>
        <div dangerouslySetInnerHTML={{ __html: song.content }} />
      </div>
    </div>
  )
}

ReactDOM.render(
  <div>
    <Router primary={false}>
      <SongList path="/">
        <SongDetail path="song/:id" />
      </SongList>
    </Router>
  </div>,
  document.getElementById('root')
)

serviceWorker.register()
