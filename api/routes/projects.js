const express = require('express');
const router = express.Router();
// const data = require('../data.json');
const jiraProjectsApi = require('../jira-helpers/projects');

router.get('/', async (req, res) => {
    let data = await jiraProjectsApi.getAllProjects();
    res.json(data);
});

module.exports = router;