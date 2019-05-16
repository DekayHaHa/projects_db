const app = require('./app')
const request = require('supertest')

const environment = process.env.NODE_ENV || 'development';
const configuration = require('./knexfile.js')[environment];
const database = require('knex')(configuration)
const projectData = require('./db/seeds/projectsData')

describe('/api', () => {
  beforeEach(async () => {
    await database.seed.run()
  })
  describe('GET all', () => {
    it('Should return all projects and status 200', async () => {
      const expectedLength = projectData.length

      const response = await request(app).get('/api/projects')
      const result = response.body

      expect(response.status).toBe(200)
      expect(result.length).toBe(expectedLength)
    })
    it('Should return all palettes and status 200', async () => {
      let expectedLength = 0;
      projectData.forEach(project => {
        expectedLength += project.palettes.length
      })

      const response = await request(app).get('/api/palettes')
      const result = response.body

      expect(response.status).toBe(200)
      expect(result.length).toBe(expectedLength)
    })
  })
  describe('GET /projects/:id', () => {
    it('Should return a specific project and status 200', async () => {
      const project = await database('projects').first()

      const response = await request(app).get(`/api/projects/${project.id}`)
      const result = response.body

      expect(response.status).toBe(200)
      expect(result.id).toBe(project.id)
    })
    it('Should return error msg and status 404 if none found', async () => {
      const project = await database('projects').first()
      const id = project.id - 1;


      const response = await request(app).get(`/api/projects/${id}`)
      const result = response.body
      expect(response.status).toBe(404)
      expect(result).toEqual({ error: `No Project with ID of ${id} found` })
    })
  })
  describe('GET /projects/palettes/:id', () => {
    it('Should a specific palette and status 200', async () => {
      const palette = await database('palettes').first()

      const response = await request(app).get(`/api/projects/palettes/${palette.id}`)
      const result = response.body
      expect(response.status).toBe(200)
      expect(result.id).toBe(palette.id)
    })
    it('Should return error msg and status 404 if none found', async () => {
      const palette = await database('palettes').first()
      const id = palette.id - 1

      const response = await request(app).get(`/api/projects/palettes/${id}`)
      const result = response.body
      expect(response.status).toBe(404)
      expect(result).toEqual({ error: `No Palette with ID of ${id} found` })
    })
  })
  describe('POST /projects', () => {
    it('Should add project and status 201', async () => {
      const mockProject = { name: 'Milkyway' }

      const response = await request(app).post('/api/projects').send(mockProject)
      const projects = await database('projects').where('id', response.body.id).select()

      const project = projects[0]

      expect(response.status).toBe(201)
      expect(project.name).toBe(mockProject.name)
    })
    it('Should return error msg and status 422 if incorrect request', async () => {
      const mockProject = { notName: 'Milkyway' }

      const response = await request(app).post('/api/projects').send(mockProject)

      const errMsg = { error: `Expected format of request: { name: <String> }.` }

      expect(response.status).toBe(422)
      expect(response.body).toEqual(errMsg)
    })
  })
  describe('POST /projects/palettes', () => {
    it('Should add palettes and status 201', async () => {
      const mockpalette = {
        name: 'Other Colors',
        color1: '#263734',
        color2: '#832923',
        color3: '#983470',
        color4: '#239473',
        color5: '#232224',
      }
      const project = await database('projects').first()

      const response = await request(app).post(`/api/projects/palettes/${project.id}`).send(mockpalette)
      const palettes = await database('palettes').where('id', response.body.id).select()

      const palette = palettes[0]

      expect(response.status).toBe(200)
      expect(palette.name).toBe(mockpalette.name)
    })
    it('Should return error msg and status 422 if incorrect request', async () => {
      const mockpalette = {
        name: 'Other Colors',
        color1: '#263734',
        color2: '#832923',
        color3: '#983470',
        color4: '#239473',
      }
      const missing = 'color5'
      const project = await database('projects').first()


      const response = await request(app).post(`/api/projects/palettes/${project.id}`).send(mockpalette)

      const errMsg = {
        error: `Expected format: 
        { name: <String>,
          color1: <String>,
          color2: <String>,
          color3: <String>,
          color4: <String>,
          color5: <String> }. You're missing a "${missing}" property.`
      }

      expect(response.status).toBe(422)
      expect(response.body).toEqual(errMsg)
    })
  })
  describe('PATCH /projects/:id', () => {
    it('Should update project and return status 200', async () => {
      const project = await database('projects').first()
      expect(project.name).toBe('Project 1')
      const projectNewName = { name: 'New Name' }
      const response = await request(app).patch(`/api/projects/${project.id}`).send(projectNewName)

      const updatedProject = await database('projects').where('name', 'New Name').select()

      expect(response.status).toBe(200)
      expect(updatedProject[0].name).toBe(projectNewName.name)
    })
    it('Should return error msg and status 422 if incorrect request', async () => {
      const projectNoName = {}
      const errMsg = { error: `Expected format of request: { name: <String> }.` }
      const project = await database('projects').first()

      const response = await request(app).patch(`/api/projects/${project.id}`).send(projectNoName)

      expect(response.status).toBe(422)
      expect(response.body).toEqual(errMsg)
    })
  })
  describe('PATCH /projects/palettes/:id', () => {
    it('Should update palettes and return status 200', async () => {
      const palette = await database('palettes').first()
      expect(palette.name).toBe('Warm Colors')
      const paletteNewName = {
        name: 'New Name',
        color1: '#111111',
        color2: '#222222',
        color3: '#333333',
        color4: '#444444',
        color5: '#555555',
      }
      const response = await request(app).patch(`/api/projects/palettes/${palette.id}`).send(paletteNewName)

      const updatedpalette = await database('palettes').where('id', response.body.id)
      expect(response.status).toBe(200)
      expect(updatedpalette[0].name).toBe(paletteNewName.name)
    })
    it('Should return error msg and status 422 if incorrect request', async () => {
      const paletteNoName = {
        color1: '#111111',
        color2: '#222222',
        color3: '#333333',
        color4: '#444444',
        color5: '#555555',
      }
      const missing = 'name'
      const errMsg = {
        error: `Expected format: 
        { name: <String>,
          color1: <String>,
          color2: <String>,
          color3: <String>,
          color4: <String>,
          color5: <String> }. You're missing a "${missing}" property.`
      }
      const palette = await database('palettes').first()

      const response = await request(app).patch(`/api/projects/palettes/${palette.id}`).send(paletteNoName)

      expect(response.status).toBe(422)
      expect(response.body).toEqual(errMsg)
    })
  })
  describe('DELETE /projects/:id', () => {
    it('Should remove project and return status 200', async () => {
      await database.seed.run()

      const projectToDelete = await database('projects').first()
      const id = projectToDelete.id

      const firstLengthCheck = await database('projects')
      expect(firstLengthCheck.length).toBe(2)

      const response = await request(app).delete(`/api/projects/${id}`)

      expect(response.status).toBe(200)

      const secondLengthCheck = await database('projects')

      expect(secondLengthCheck.length).toBe(1)
    })
    it('Should return error msg and status 404 if project not found', async () => {
      await database.seed.run()

      const projectToDelete = await database('projects').first()
      const id = projectToDelete.id - 1
      const notFound = `No Projects with an ID of ${id} Found`

      const response = await request(app).delete(`/api/projects/${id}`)

      expect(response.status).toBe(404)
      expect(response.body).toBe(notFound)
    })
  })
  describe('DELETE /projects/palettes/:id', () => {
    it('Should remove palette and return status 200', async () => {
      await database.seed.run()

      const paletteToDelete = await database('palettes').first()
      const id = paletteToDelete.id

      const firstLengthCheck = await database('palettes')
      expect(firstLengthCheck.length).toBe(4)

      const response = await request(app).delete(`/api/projects/palettes/${id}`)

      expect(response.status).toBe(200)

      const secondLengthCheck = await database('palettes')

      expect(secondLengthCheck.length).toBe(3)
    })
    it('Should return error msg and status 404 if palette not found', async () => {
      await database.seed.run()

      const paletteToDelete = await database('palettes').first()
      const id = paletteToDelete.id - 1
      const notFound = `No palettes with an ID of ${id} found`

      const response = await request(app).delete(`/api/projects/palettes/${id}`)

      expect(response.status).toBe(404)
      expect(response.body).toEqual(notFound)
    })
  })
})