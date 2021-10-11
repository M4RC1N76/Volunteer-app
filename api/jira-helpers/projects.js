const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const dotenv = require('dotenv');
dotenv.config();
const apiKey = process.env.JIRA_API_KEY
const apiUser = process.env.JIRA_API_USER
const jiraBaseUrl = process.env.JIRA_API_BASE_URL

module.exports.getAllProjects = () => fetch(jiraBaseUrl + '/search?jql=project=RES&maxResults=1000', {
    method: 'GET',
    headers: {
      'Authorization': `Basic ${Buffer.from(
        `${apiUser}:${apiKey}`
      ).toString('base64')}`,
      'Accept': 'application/json'
    }
  })
  .then(response => {
    console.log(
      `Response: ${response.status} ${response.statusText}`
    );
    if(response.status >= 200 && response.status < 300){
      return response.json();
    }
    //Think this line below is no good. Unhandled promise rejections are deprecated.
    return Promise.reject(new Error(response.statusText));
  })
  .then(json => { 
    return json;
  })
  .catch(err => {
    return err;
  });