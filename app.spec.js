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

      expect(response.status).toBe(201)
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


      const response = await request(app).post(`/api/projects/palettes/${project.id - 1}`).send(mockpalette)

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
    it.skip('Should update project and return status 200', async () => {

    })
    it.skip('Should return error msg and status 422 if incorrect request', async () => {

    })
  })
  describe('PATCH /projects/palettes/:id', () => {
    it.skip('Should update palettes and return status 200', async () => {

    })
    it.skip('Should return error msg and status 422 if incorrect request', async () => {

    })
  })
  describe('DELETE /projects/:id', () => {
    it.skip('Should remove project and return status 200', async () => {

    })
    it.skip('Should return error msg and status 404 if project not found', async () => {

    })
  })
  describe('DELETE /projects/palettes/:id', () => {
    it.skip('Should remove palette and return status 200', async () => {

    })
    it.skip('Should return error msg and status 404 if palette not found', async () => {

    })
  })
})