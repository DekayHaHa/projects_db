const express = require('express');
const app = express();
const cors = require('cors')
const environment = process.env.NODE_ENV || 'development';
const configuration = require('./knexfile')[environment];
const database = require('knex')(configuration);

var corsOpt = {
  origin: 'http://localhost:3001',
  successStatus: 200
}

app.use(cors(corsOpt))
app.use(express.json())

//custom api end point **

app.get('/api/projects', (req, res) => {
  database('projects').select()
    .then(projects => {
      res.status(200).json(projects)
    })
    .catch(err => res.status(500).json(err))
})

app.get('/api/palettes', (req, res) => {
  database('palettes').select()
    .then(palettes => {
      res.status(200).json(palettes)
    })
    .catch(err => res.status(500).json(err))
})

app.get('/api/projects/:id', (req, res) => {
  const id = req.params.id
  const errMsg = { error: `No Project with ID of ${id} found` }
  database('projects').where('id', id).select()
    .then(project => {
      if (project.length === 0) return res.status(404).json(errMsg)
      res.status(200).json(project[0])
    })
    .catch(err => res.status(500).json(err))
})

app.get('/api/projects/palettes/:id', (req, res) => {
  const id = req.params.id
  const errMsg = { error: `No Palette with ID of ${id} found` }
  database('palettes').where('id', id).select()
    .then(palette => {
      if (palette.length === 0) return res.status(404).json(errMsg)
      res.status(200).json(palette[0])
    })
    .catch(err => res.status(500).json(err))
})

app.post('/api/projects', (req, res) => {
  const project = req.body

  for (let requiredParam of ['name']) {
    if (!project[requiredParam]) {
      const errMsg = { error: `Expected format of request: { name: <String> }.` }
      return res.status(422).json(errMsg)
    }
  }

  database('projects').insert(project, 'id')
    .then(projectId => {
      res.status(201).json({ id: projectId[0] })
    })
    .catch(err => res.status(500).json(err))
})

app.post('/api/projects/palettes/:project_id', (req, res) => { // foreign id
  const project_id = req.params.project_id
  const palette = { ...req.body, project_id };
  const required = ['name', 'color1', 'color2', 'color3', 'color4', 'color5'];
  for (let requiredParam of required) {
    if (!palette[requiredParam]) {
      const errMsg = {
        error: `Expected format: 
        { name: <String>,
          color1: <String>,
          color2: <String>,
          color3: <String>,
          color4: <String>,
          color5: <String> }. You're missing a "${requiredParam}" property.`
      }
      return res.status(422).json(errMsg)
    }
  }

  database('palettes').insert(palette, 'id')
    .then(paletteId => {
      res.status(201).json({ id: paletteId[0] })
    })
    .catch(err => res.status(500).json(err))
})

app.patch('/api/projects/:id', (req, res) => {
  const id = req.params.id
  const project = req.body

  for (let requiredParam of ['name', 'desc']) {
    if (!project[requiredParam]) {
      const errMsg = { error: `Expected format: { name: <String>, desc: <String> }. You're missing a "${requiredParam}" property.` }
      return res.status(422).json(errMsg)
    }
  }

  database('projects').where('id', id).update(project, 'id')
    .then(projectId => {
      res.status(200).json({ id: projectId[0] })
    })
    .catch(err => res.status(500).json(err))
})

app.patch('/api/projects/palettes/:id', (req, res) => {
  const id = req.params.id
  const palette = req.body

  const required = ['name', 'color1', 'color2', 'color3', 'color4', 'color5'];
  for (let requiredParam of required) {
    if (!palette[requiredParam]) {
      const errMsg = {
        error: `Expected format: 
        { name: <String>,
          color1: <String>,
          color2: <String>,
          color3: <String>,
          color4: <String>,
          color5: <String> }. You're missing a "${requiredParam}" property.`
      }
      return res.status(422).json(errMsg)
    }
  }

  database('palettes').where('id', id).update(palette, 'id')
    .then(paletteId => {
      res.status(200).json(`palette Id: ${paletteId} updated.`)
    })
    .catch(err => res.status(500).json(err))
})

app.delete('/api/projects/:id', (req, res) => {
  const id = req.params.id

  database('palettes').where('project_id', id).del()
    .then(numOfPalettes => {
      database('projects').where('id', id).del()
        .then(numOfProjects => {
          const notFound = `No Projects with an ID of ${id} Found`
          if (numOfProjects === 0) return res.status(404).json(notFound)
          res.status(200).json(`deleted ${numOfPalettes} palettes and ${numOfProjects} project`)
        })
        .catch(err => res.status(500).json(err))
    })
    .catch(err => res.status(500).json(err));
})

app.delete('/api/projects/palettes/:id', (req, res) => {
  const id = req.params.id

  database('palettes').where('id', id).del()
    .then(numOfPalettes => {
      const notFound = `No palettes with an ID of ${id} found`
      if (numOfPalettes === 0) return res.status(404).json(notFound)
      res.status(200).json(`Deleted ${numOfPalettes} palettes`)
    })
    .catch(err => res.status(500).json(err))
})

module.exports = app;