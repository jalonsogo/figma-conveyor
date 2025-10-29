// Show the plugin UI
figma.showUI(__html__, { width: 400, height: 500 });

let selectedComponent = null;

// Listen for messages from the UI
figma.ui.onmessage = async (msg) => {
  if (msg.type === 'select-component') {
    // Check if a component is selected
    const selection = figma.currentPage.selection;
    
    if (selection.length === 0) {
      figma.ui.postMessage({ 
        type: 'component-error', 
        message: 'Please select a component first' 
      });
      return;
    }

    const node = selection[0];
    
    // Check if it's a component or component set
    if (node.type === 'COMPONENT' || node.type === 'COMPONENT_SET') {
      selectedComponent = node;
      figma.ui.postMessage({ 
        type: 'component-selected', 
        name: node.name 
      });
    } else if (node.type === 'INSTANCE') {
      // If an instance is selected, get its main component
      selectedComponent = node.mainComponent;
      if (selectedComponent) {
        figma.ui.postMessage({ 
          type: 'component-selected', 
          name: selectedComponent.name 
        });
      } else {
        figma.ui.postMessage({ 
          type: 'component-error', 
          message: 'Could not find the main component' 
        });
      }
    } else {
      figma.ui.postMessage({ 
        type: 'component-error', 
        message: 'Please select a component, component set, or instance' 
      });
    }
  }

  if (msg.type === 'generate-instances') {
    if (!selectedComponent) {
      figma.ui.postMessage({ 
        type: 'generation-error', 
        message: 'No component selected' 
      });
      return;
    }

    try {
      const { csvData } = msg;
      await generateInstances(selectedComponent, csvData);
      figma.ui.postMessage({ 
        type: 'generation-complete', 
        count: csvData.length 
      });
    } catch (error) {
      figma.ui.postMessage({ 
        type: 'generation-error', 
        message: error.message 
      });
    }
  }

  if (msg.type === 'cancel') {
    figma.closePlugin();
  }
};

async function generateInstances(component, csvData) {
  const instances = [];
  const startX = 0;
  const startY = 0;
  const spacing = 20;
  
  // Get the component to use (handle component sets)
  let componentToUse = component;
  if (component.type === 'COMPONENT_SET') {
    // Use the first variant
    componentToUse = component.children[0];
  }

  // Get headers from the first row
  const headers = csvData[0];
  
  // Process each data row (skip header row)
  for (let i = 1; i < csvData.length; i++) {
    const rowData = csvData[i];
    
    // Create instance
    const instance = componentToUse.createInstance();
    
    // Position instances in a vertical list
    instance.x = startX;
    instance.y = startY + (i - 1) * (instance.height + spacing);
    
    // Map CSV data to text layers
    await updateTextLayers(instance, headers, rowData);
    
    instances.push(instance);
  }
  
  // Select all created instances
  figma.currentPage.selection = instances;
  figma.viewport.scrollAndZoomIntoView(instances);
}

async function updateTextLayers(node, headers, rowData) {
  // Update component properties (both top-level and nested instances)
  await updateInstanceProperties(node, headers, rowData);
  
  // Also update text layers by matching names with CSV headers
  const updateNode = async (n) => {
    if (n.type === 'TEXT') {
      // Try to match the text layer name with CSV headers
      const headerIndex = headers.findIndex(header => 
        header && n.name && header.toLowerCase().trim() === n.name.toLowerCase().trim()
      );
      
      if (headerIndex !== -1 && rowData[headerIndex] !== undefined && rowData[headerIndex] !== null) {
        try {
          // Load the font before changing text
          await figma.loadFontAsync(n.fontName);
          n.characters = String(rowData[headerIndex]);
        } catch (error) {
          console.error(`Error updating text layer ${n.name}:`, error);
        }
      }
    }
    
    // Recursively process children
    if ('children' in n) {
      for (const child of n.children) {
        await updateNode(child);
      }
    }
  };
  
  await updateNode(node);
}

// Update component properties for an instance and all nested instances
async function updateInstanceProperties(node, headers, rowData) {
  // Process current node if it's an instance
  if (node.type === 'INSTANCE' && 'componentProperties' in node) {
    const componentProps = node.componentProperties;
    const mainComponent = node.mainComponent;
    
    if (mainComponent && 'componentPropertyDefinitions' in mainComponent) {
      const propDefs = mainComponent.componentPropertyDefinitions;
      
      // Iterate through component properties
      for (const [propKey, propValue] of Object.entries(componentProps)) {
        if (!propValue || typeof propValue !== 'object' || !('type' in propValue)) continue;
        
        const propDef = propDefs[propKey];
        if (!propDef) continue;
        
        const propName = propDef.name;
        
        // Find matching CSV column (case-insensitive)
        const headerIndex = headers.findIndex(header => 
          header && propName && header.toLowerCase().trim() === propName.toLowerCase().trim()
        );
        
        if (headerIndex === -1 || rowData[headerIndex] === undefined || rowData[headerIndex] === null) continue;
        
        const cellValue = String(rowData[headerIndex]).trim();
        
        try {
          // Handle TEXT properties
          if (propValue.type === 'TEXT' && propDef.type === 'TEXT') {
            node.setProperties({
              [propKey]: cellValue
            });
          }
          // Handle BOOLEAN properties
          else if (propValue.type === 'BOOLEAN' && propDef.type === 'BOOLEAN') {
            // Convert string to boolean
            const boolValue = parseBooleanValue(cellValue);
            node.setProperties({
              [propKey]: boolValue
            });
          }
        } catch (error) {
          console.error(`Error updating component property ${propName}:`, error);
        }
      }
    }
  }
  
  // Recursively process children to find nested instances
  if ('children' in node) {
    for (const child of node.children) {
      await updateInstanceProperties(child, headers, rowData);
    }
  }
}

// Parse boolean values from CSV strings
function parseBooleanValue(value) {
  const lowerValue = value.toLowerCase();
  
  // True values
  if (lowerValue === 'true' || lowerValue === 'yes' || lowerValue === '1' || 
      lowerValue === 'on' || lowerValue === 'enabled' || lowerValue === 'active') {
    return true;
  }
  
  // False values
  if (lowerValue === 'false' || lowerValue === 'no' || lowerValue === '0' || 
      lowerValue === 'off' || lowerValue === 'disabled' || lowerValue === 'inactive') {
    return false;
  }
  
  // Default to false for unrecognized values
  return false;
}
