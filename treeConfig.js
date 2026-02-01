// Centralized category tree configuration
// This is the single source of truth for all support categories
// Based on OpenCares Tech Support structure

const TREE = {
  'Salesforce': {
    cardFile: 'salesforce',
    children: {
      'Access / Login': {
        cardFile: 'salesforce-access',
        children: {
          'Cannot login': 'leaf',
          'Missing sections': 'leaf'
        }
      },
      'Errors': 'leaf',
      'Modifications': 'leaf',
      'Reports': 'leaf',
      'Flows': 'leaf',
      'Integrations': 'leaf'
    }
  },
  'Hardware': {
    cardFile: 'hardware',
    children: {
      'Printers': 'leaf',
      'Laptop/Desktop': {
        cardFile: 'hardware-laptop',
        children: {
          'Login': 'leaf',
          'Hardware': 'leaf'
        }
      }
    }
  },
  'Network / Internet': 'leaf',
  'Onboarding & Email': {
    cardFile: 'onboarding',
    children: {
      'New member signup': 'leaf',
      'Email access': 'leaf'
    }
  },
  'Office Software': {
    cardFile: 'office-software',
    children: {
      'OneDrive': 'leaf',
      'Word / Excel': 'leaf'
    }
  },
  'Telephone': {
    cardFile: 'telephone',
    children: {
      'New User': 'leaf',
      'Login': 'leaf',
      'Installation': {
        cardFile: 'telephone-installation',
        children: {
          'iOS': 'leaf',
          'Android': 'leaf',
          'Windows': 'leaf'
        }
      },
      'Connection': {
        cardFile: 'telephone-connection',
        children: {
          'Calls': 'leaf',
          'SMS': 'leaf'
        }
      }
    }
  },
  'Security': 'leaf',
  'Other': 'leaf'
};

// Helper functions to navigate the tree

function isLeaf(node) {
  return node === 'leaf';
}

function getNode(path) {
  let current = TREE;
  
  for (const step of path) {
    if (!current[step]) {
      return null;
    }
    current = current[step];
  }
  
  return current;
}

function getCardFile(selection, currentPath = []) {
  const newPath = [...currentPath, selection];
  const node = getNode(newPath);
  
  if (!node || isLeaf(node)) {
    return null; // Leaf node or not found
  }
  
  // If node has explicit cardFile, use it
  if (node.cardFile) {
    return node.cardFile;
  }
  
  // Otherwise, return null (will show text input)
  return null;
}

function checkIfLeaf(selection, currentPath = []) {
  const newPath = [...currentPath, selection];
  const node = getNode(newPath);
  
  return !node || isLeaf(node);
}

module.exports = {
  TREE,
  getCardFile,
  checkIfLeaf,
  isLeaf
};
