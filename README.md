# Machine Learning + Generative Art

## Requirements
- Node Latest Stable (6.x at time of writing)
- Yarn
- Browser that Supports WebGL (Chrome is the go-to)
- Device that Supports WebGL (no dedicated GPU will probably prevent you from enjoying this)

## Setup
- Clone the repo.
- Run `yarn install`
- BAM! You're done.

## Usage
#### `yarn run build`
Build a production version of `bundle.js` into `dist/`.

#### `yarn run dev`
Run a development server at `http://localhost:8080/`. This also will watch & recompile on file changes. This is neccessary for the BE component (saving brain.json files to bootstrap new sessions).

#### `yarn run watch`
Watch files in `src/` for changes, recompile on change.

#### `yarn run deploy`
This will deploy the master branch to the remote server (generative-artist.smashginboxes.com). You must have the proper SSH key added to your `ssh-agent` in order to deploy. Do this with care, it affects the production instance.
