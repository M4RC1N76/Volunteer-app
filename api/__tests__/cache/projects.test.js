const airTable = require('../../helpers/airTable');
const axios = require('axios');
const arraysHelpers = require('../../helpers/arrays');
const cacheProjects = require('../../cache/projects');
const { faker } = require('@faker-js/faker');
const projectsTestData = require('../test-data/projects');

axios.defaults.adapter = require('axios/lib/adapters/http');

describe('Test the projects/resources cache', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test('addNewProjectsAndResources adds new records in chunks', async () => {
    // Set up fake test data
    const fakeProjectsCount = faker.datatype.number(30);
    const fakeProjectsChunkCount = Math.ceil(fakeProjectsCount / 10);
    const fakeProjects = projectsTestData.fakeProjectObjects(fakeProjectsCount);

    const fakeResourcesCount = faker.datatype.number({ min: 30, max: 50 });
    const fakeResourcesChunkCount = Math.ceil(fakeResourcesCount / 10);
    const fakeResources = projectsTestData.fakeResourceObjects(fakeResourcesCount);

    // Mock dependencies
    const arraysHelpersSpy = jest
      .spyOn(arraysHelpers, 'chunk')
      .mockImplementation((array) => faker.datatype.array(Math.ceil(array.length / 10)));
    const addNewRecordsSpy = jest.spyOn(cacheProjects, 'addNewRecords').mockImplementation(() => Promise.resolve());
    const consoleLogSpy = jest.spyOn(global.console, 'log').mockImplementation(() => {});

    // Run test
    await cacheProjects.addNewProjectsAndResources(fakeProjects, fakeResources);

    expect(arraysHelpersSpy).toHaveBeenCalledTimes(2);
    expect(addNewRecordsSpy).toHaveBeenCalledTimes(fakeProjectsChunkCount + fakeResourcesChunkCount);

    // Clean up
    arraysHelpersSpy.mockRestore();
    addNewRecordsSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });

  test('addNewRecords calls AirTable client', async () => {
    // Set up fake test data
    const fakeProjectsChunk = projectsTestData.fakeProjectObjects(10);

    // Mock dependencies
    const airTableClientCreateMock = jest.fn();
    const airTableClientTableSpy = jest
      .spyOn(airTable.client, 'table')
      .mockImplementation(() => ({ create: airTableClientCreateMock }));

    // Run test
    await cacheProjects.addNewRecords(faker.lorem.words(1), fakeProjectsChunk);

    expect(airTableClientTableSpy).toHaveBeenCalledTimes(1);
    expect(airTableClientCreateMock).toHaveBeenCalledTimes(1);

    // Clean up
    airTableClientTableSpy.mockRestore();
  });

  test('cacheProjectsAndResources is aborted if data is empty', async () => {
    // Mock dependencies
    const deleteExistingProjectsAndResourcesSpy = jest
      .spyOn(cacheProjects, 'deleteExistingProjectsAndResources')
      .mockImplementation(() => Promise.resolve());
    const addNewProjectsAndResourcesSpy = jest
      .spyOn(cacheProjects, 'addNewProjectsAndResources')
      .mockImplementation(() => Promise.resolve());
    const consoleErrorSpy = jest.spyOn(global.console, 'error').mockImplementation(() => {});

    // Run test
    await cacheProjects.cacheProjectsAndResources([], []);

    expect(deleteExistingProjectsAndResourcesSpy).toHaveBeenCalledTimes(0);
    expect(addNewProjectsAndResourcesSpy).toHaveBeenCalledTimes(0);
    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);

    // Clean up
    deleteExistingProjectsAndResourcesSpy.mockRestore();
    addNewProjectsAndResourcesSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  test('cacheProjectsAndResources deletes old data and adds new data', async () => {
    // Set up fake test data
    const fakeProjects = projectsTestData.fakeProjectObjects(faker.datatype.number(30));
    const fakeResources = projectsTestData.fakeResourceObjects(faker.datatype.number({ min: 30, max: 50 }));

    // Mock dependencies
    const deleteExistingProjectsAndResourcesSpy = jest
      .spyOn(cacheProjects, 'deleteExistingProjectsAndResources')
      .mockImplementation(() => Promise.resolve());
    const addNewProjectsAndResourcesSpy = jest
      .spyOn(cacheProjects, 'addNewProjectsAndResources')
      .mockImplementation(() => Promise.resolve());
    const consoleLogSpy = jest.spyOn(global.console, 'log').mockImplementation(() => {});

    // Run test
    await cacheProjects.cacheProjectsAndResources(fakeProjects, fakeResources);

    expect(deleteExistingProjectsAndResourcesSpy).toHaveBeenCalledTimes(1);
    expect(addNewProjectsAndResourcesSpy).toHaveBeenCalledTimes(1);
    expect(addNewProjectsAndResourcesSpy).toHaveBeenCalledWith(fakeProjects, fakeResources);

    // Clean up
    deleteExistingProjectsAndResourcesSpy.mockRestore();
    addNewProjectsAndResourcesSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });

  test('deleteAllRecords gets existing records from AirTable and chunks data to delete', async () => {
    // Set up fake test data
    const fakeTableName = faker.lorem.words(1);
    const fakeRecordsCount = 25;
    const fakeRecords = projectsTestData.fakeProjectAirTableRecords(fakeRecordsCount);

    // Mock dependencies
    const airTableClientAllMock = jest.fn(() => fakeRecords);
    const airTableClientSelectMock = jest.fn(() => ({ all: airTableClientAllMock }));
    const airTableClientTableSpy = jest
      .spyOn(airTable.client, 'table')
      .mockImplementation(() => ({ select: airTableClientSelectMock }));
    const arraysHelpersSpy = jest
      .spyOn(arraysHelpers, 'chunk')
      .mockImplementation(() => [fakeRecords.slice(0, 10), fakeRecords.slice(10, 20), fakeRecords.slice(20)]);
    const deleteRecordsSpy = jest.spyOn(cacheProjects, 'deleteRecords').mockImplementation(() => Promise.resolve());

    // Run test
    await cacheProjects.deleteAllRecords(fakeTableName);

    expect(airTableClientTableSpy).toHaveBeenCalledTimes(1);
    expect(airTableClientTableSpy).toHaveBeenCalledWith(fakeTableName);
    expect(airTableClientSelectMock).toHaveBeenCalledTimes(1);
    expect(airTableClientAllMock).toHaveBeenCalledTimes(1);
    expect(deleteRecordsSpy).toHaveBeenCalledTimes(Math.ceil(fakeRecordsCount / 10));

    // Clean up
    airTableClientTableSpy.mockRestore();
    arraysHelpersSpy.mockRestore();
    deleteRecordsSpy.mockRestore();
  });

  test('deleteRecords calls AirTable client', async () => {
    // Set up fake test data
    const fakeTableName = faker.lorem.words(1);
    const fakeRecordIds = faker.datatype.array(10);

    // Mock dependencies
    const airTableClientDestroyMock = jest.fn((recordIds, done) => done());
    const airTableClientTableSpy = jest
      .spyOn(airTable.client, 'table')
      .mockImplementation(() => ({ destroy: airTableClientDestroyMock }));

    // Run test
    await cacheProjects.deleteRecords(fakeTableName, fakeRecordIds);

    expect(airTableClientTableSpy).toHaveBeenCalledTimes(1);
    expect(airTableClientTableSpy).toHaveBeenCalledWith(fakeTableName);
    expect(airTableClientDestroyMock).toHaveBeenCalledTimes(1);
    expect(airTableClientDestroyMock).toHaveBeenCalledWith(fakeRecordIds, expect.anything());

    // Clean up
    airTableClientTableSpy.mockRestore();
  });

  test('filterProjectsConnectedWithResources correctly filters projects', () => {
    // Set up fake test data
    const fakeProjects = projectsTestData.fakeProjectObjects(4);
    const fakeResources = projectsTestData.fakeResourceObjects(8);
    fakeResources[0].it_key = fakeProjects[0].it_key;
    fakeResources[1].it_key = fakeProjects[0].it_key;
    fakeResources[2].it_key = fakeProjects[1].it_key;
    fakeResources[3].it_key = fakeProjects[1].it_key;
    fakeResources[4].it_key = fakeResources[5].it_key = fakeResources[6].it_key = fakeResources[7].it_key = 'IT-000';

    // Run test
    const filteredProjects = cacheProjects.filterProjectsConnectedWithResources(fakeProjects, fakeResources);

    expect(filteredProjects.length).toEqual(2);
  });

  test('filterResourcesConnectedWithProjects correctly filters resources', () => {
    // Set up fake test data
    const fakeProjects = projectsTestData.fakeProjectObjects(4);
    const fakeResources = projectsTestData.fakeResourceObjects(8);
    fakeResources[0].it_key = fakeProjects[0].it_key;
    fakeResources[1].it_key = fakeProjects[0].it_key;
    fakeResources[2].it_key = fakeProjects[1].it_key;
    fakeResources[3].it_key = fakeProjects[1].it_key;
    fakeResources[4].it_key = fakeResources[5].it_key = fakeResources[6].it_key = fakeResources[7].it_key = 'IT-000';

    // Run test
    const filteredResources = cacheProjects.filterResourcesConnectedWithProjects(fakeProjects, fakeResources);

    expect(filteredResources.length).toEqual(4);
  });

  test('formatProjects correctly gets project type from resource', () => {
    // Set up fake test data
    const fakeProjects = projectsTestData.fakeProjectObjects(4);
    fakeProjects[2].it_key = 'IT-000';
    fakeProjects[3].it_key = 'IT-001';
    const fakeResources = projectsTestData.fakeResourceObjects(8);
    fakeResources[0].it_key = fakeProjects[0].it_key;
    fakeResources[1].it_key = fakeProjects[0].it_key;
    fakeResources[2].it_key = fakeProjects[1].it_key;
    fakeResources[3].it_key = fakeProjects[1].it_key;
    fakeResources[4].it_key = fakeResources[5].it_key = fakeResources[6].it_key = fakeResources[7].it_key = 'IT-002';

    // Run test
    const formattedProjects = cacheProjects.formatProjects(fakeProjects, fakeResources);

    expect(formattedProjects).toEqual([
      {
        ...fakeProjects[0],
        type: fakeResources[0].projectType,
      },
      {
        ...fakeProjects[1],
        type: fakeResources[2].projectType,
      },
      {
        ...fakeProjects[2],
        type: '',
      },
      {
        ...fakeProjects[3],
        type: '',
      },
    ]);
  });

  test('getAllProjectsAndResourcesFromJira calls related functions', async () => {
    // Set up fake test data
    const fakeProjects = projectsTestData.fakeProjectObjects(15);
    const fakeResources = projectsTestData.fakeResourceObjects(25);

    // Mock dependencies
    const jiraItDataCallSpy = jest
      .spyOn(cacheProjects, 'jiraItDataCall')
      .mockImplementationOnce(() => Promise.resolve(fakeProjects));
    const jiraResourceDataCallSpy = jest
      .spyOn(cacheProjects, 'jiraResourceDataCall')
      .mockImplementationOnce(() => Promise.resolve(fakeResources));
    const filterProjectsConnectedWithResourcesSpy = jest
      .spyOn(cacheProjects, 'filterProjectsConnectedWithResources')
      .mockImplementation(() => []);
    const filterResourcesConnectedWithProjectsSpy = jest
      .spyOn(cacheProjects, 'filterResourcesConnectedWithProjects')
      .mockImplementation(() => []);
    const formatProjectsSpy = jest.spyOn(cacheProjects, 'formatProjects').mockImplementation(() => []);
    const consoleLogSpy = jest.spyOn(global.console, 'log').mockImplementation(() => {});

    // Run test
    await cacheProjects.getAllProjectsAndResourcesFromJira();

    expect(jiraItDataCallSpy).toHaveBeenCalledTimes(1);
    expect(jiraResourceDataCallSpy).toHaveBeenCalledTimes(1);
    expect(filterProjectsConnectedWithResourcesSpy).toHaveBeenCalledTimes(1);
    expect(filterProjectsConnectedWithResourcesSpy).toHaveBeenCalledWith(fakeProjects, fakeResources);
    expect(filterResourcesConnectedWithProjectsSpy).toHaveBeenCalledTimes(1);
    expect(filterResourcesConnectedWithProjectsSpy).toHaveBeenCalledWith(fakeProjects, fakeResources);
    expect(formatProjectsSpy).toHaveBeenCalledTimes(1);

    // Clean up
    jiraItDataCallSpy.mockRestore();
    jiraResourceDataCallSpy.mockRestore();
    filterProjectsConnectedWithResourcesSpy.mockRestore();
    filterResourcesConnectedWithProjectsSpy.mockRestore();
    formatProjectsSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });

  test('jiraItDataCall calls Jira API', async () => {
    // Set up fake test data
    const fakeProjectsCountMinimum = 10;
    const fakeProjectsCountMaximum = 50;
    const fakeProjectsCount = faker.datatype.number({ min: fakeProjectsCountMinimum, max: fakeProjectsCountMaximum });
    const fakeJiraItApiResults = projectsTestData.fakeJiraItApiResults(fakeProjectsCount);

    // Mock dependencies
    const axiosSpy = jest.spyOn(axios, 'get').mockImplementationOnce(() => Promise.resolve(fakeJiraItApiResults));

    // Run test
    const jiraItArray = await cacheProjects.jiraItDataCall(0, []);

    expect(axiosSpy).toHaveBeenCalledTimes(1);
    const randomItemIndex = faker.datatype.number({ min: fakeProjectsCountMinimum - 1, max: fakeProjectsCount - 1 });
    expect(jiraItArray[randomItemIndex]).toEqual({
      it_key: fakeJiraItApiResults.data.issues[randomItemIndex].key,
      name: fakeJiraItApiResults.data.issues[randomItemIndex].fields.summary,
      description: fakeJiraItApiResults.data.issues[randomItemIndex].fields.description,
      client: fakeJiraItApiResults.data.issues[randomItemIndex].fields.customfield_10027,
      video: fakeJiraItApiResults.data.issues[randomItemIndex].fields.customfield_10159,
    });

    // Clean up
    axiosSpy.mockRestore();
  });

  test('jiraResourceDataCall calls Jira API', async () => {
    // Set up fake test data
    const fakeResourcesCountMinimum = 30;
    const fakeResourcesCountMaximum = 80;
    const fakeResourcesCount = faker.datatype.number({
      min: fakeResourcesCountMinimum,
      max: fakeResourcesCountMaximum,
    });
    const fakeJiraResApiResults = projectsTestData.fakeJiraResApiResults(fakeResourcesCount);

    // Mock dependencies
    const axiosSpy = jest.spyOn(axios, 'get').mockImplementationOnce(() => Promise.resolve(fakeJiraResApiResults));

    // Run test
    const jiraResArray = await cacheProjects.jiraResourceDataCall(0, []);

    expect(axiosSpy).toHaveBeenCalledTimes(1);
    const randomItemIndex = faker.datatype.number({ min: fakeResourcesCountMinimum - 1, max: fakeResourcesCount - 1 });
    expect(jiraResArray[randomItemIndex]).toEqual({
      res_id: fakeJiraResApiResults.data.issues[randomItemIndex].id,
      it_key: fakeJiraResApiResults.data.issues[randomItemIndex].fields.customfield_10109,
      type: fakeJiraResApiResults.data.issues[randomItemIndex].fields.customfield_10112,
      role: fakeJiraResApiResults.data.issues[randomItemIndex].fields.customfield_10113,
      skills: fakeJiraResApiResults.data.issues[randomItemIndex].fields.customfield_10061,
      hours: fakeJiraResApiResults.data.issues[randomItemIndex].fields.customfield_10062,
      required: 1,
      buddying:
        fakeJiraResApiResults.data.issues[randomItemIndex].fields.customfield_10108.value === 'Yes' ? true : false,
    });

    // Clean up
    axiosSpy.mockRestore();
  });

  test('start gets all data from Jira API then attempts to cache it', async () => {
    // Set up fake test data
    const fakeProjects = projectsTestData.fakeProjectObjects(15);
    const fakeResources = projectsTestData.fakeResourceObjects(25);

    // Mock dependencies
    const getAllProjectsAndResourcesFromJiraSpy = jest
      .spyOn(cacheProjects, 'getAllProjectsAndResourcesFromJira')
      .mockImplementationOnce(() =>
        Promise.resolve({
          projects: fakeProjects,
          resources: fakeResources,
        }),
      );
    const cacheProjectsAndResourcesSpy = jest
      .spyOn(cacheProjects, 'cacheProjectsAndResources')
      .mockImplementationOnce(() => Promise.resolve());
    const consoleLogSpy = jest.spyOn(global.console, 'log').mockImplementation(() => {});

    // Run test
    await cacheProjects.start();

    expect(getAllProjectsAndResourcesFromJiraSpy).toHaveBeenCalledTimes(1);
    expect(cacheProjectsAndResourcesSpy).toHaveBeenCalledTimes(1);
    expect(cacheProjectsAndResourcesSpy).toHaveBeenCalledWith(fakeProjects, fakeResources);

    // Clean up
    getAllProjectsAndResourcesFromJiraSpy.mockRestore();
    cacheProjectsAndResourcesSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });
});

// start,
