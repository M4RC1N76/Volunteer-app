const airTable = require('../helpers/airTable');
const apiDefinition = require('../definitions/api_definition.json');
const stringsHelper = require('../helpers/strings');

function combineProjectsAndResources(projects, resources) {
  return resources.map((resource) => {
    const project = projects.filter((project) => project.it_key === resource.it_key)[0];

    return {
      ...resource,
      ...project,
    };
  });
}

/* Takes a project resource object (project and resource combined),
   with the fields as they have come from AirTable,
   and formats it correctly for the API to return it to the user */
function formatProjectResourceFromAirTable(projectResource) {
  const projectResourceFieldDefinitions = apiDefinition.components.schemas.project.items.properties;

  const projectResourceFormatted = airTable.addEmptyFields({
    ...projectResource,
  }, projectResourceFieldDefinitions);

  for (const [fieldName, fieldProperties] of Object.entries(projectResourceFieldDefinitions)) {
    // Certain fields need to be formatted
    switch (fieldName) {
      case 'required':
        projectResourceFormatted[fieldName] =
          projectResource[fieldName] === 1 ? '1 person' : `${projectResource[fieldName]} people`;
        break;
      case 'skills':
        // For now, assumption based on available data is that skills are in separate paragraphs in a text field
        projectResourceFormatted[fieldName] = projectResource[fieldName]
          ? stringsHelper.splitByLineBreak(stringsHelper.removeBlankLines(projectResource[fieldName]))
          : [];
        break;
    } 
  }

  return projectResourceFormatted;
}

module.exports = {
  combineProjectsAndResources,
  formatProjectResourceFromAirTable,
};
