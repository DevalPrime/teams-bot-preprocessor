// Card routing system - uses tree config for navigation
const { getCardFile } = require('./treeConfig');

function getNextCard(selection, currentPath = []) {
  const cardFile = getCardFile(selection, currentPath);
  
  if (!cardFile) {
    return null; // No card file - this is a leaf
  }
  
  try {
    return require(`./cards/${cardFile}.json`);
  } catch (error) {
    console.error(`Card not found: ${cardFile}`, error);
    return null;
  }
}

module.exports = { getNextCard };
