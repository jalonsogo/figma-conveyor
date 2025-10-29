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
          console.log(`✓ Updated: "${n.name}" = "${rowData[headerIndex]}"`);
        } catch (error) {
          console.error(`✗ Error updating "${n.name}":`, error);
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
    
    if (mainComponent) {
      // Get property definitions - need to handle variants properly
      let propDefs = null;
      
      try {
        // Check if this is a variant (child of a component set)
        if (mainComponent.parent && mainComponent.parent.type === 'COMPONENT_SET') {
          // For variants, get definitions from the parent component set
          propDefs = mainComponent.parent.componentPropertyDefinitions;
        } else if (mainComponent.type === 'COMPONENT') {
          // For regular components, get definitions directly
          propDefs = mainComponent.componentPropertyDefinitions;
        }
      } catch (error) {
        console.error('Error accessing component property definitions:', error);
      }
      
      if (propDefs) {
        console.log('\n=== Processing instance:', node.name, '===');
        console.log('All component properties:', Object.keys(componentProps));
        
        // Iterate through component properties
        for (const [propKey, propValue] of Object.entries(componentProps)) {
          if (!propValue || typeof propValue !== 'object' || !('type' in propValue)) continue;
          
          const propDef = propDefs[propKey];
          if (!propDef) continue;
          
          // For component sets, the property name might not be in propDef.name
          // For regular components, propKey has format "PropertyName#nodeId:index"
          // Extract just the property name part (before the #)
          let propName = propDef.name;
          if (!propName) {
            propName = propKey.split('#')[0];
          }
          
          console.log(`Property: "${propName}" | propValue.type: ${propValue.type} | propDef.type: ${propDef.type}`);
          
          // Find matching CSV column (case-insensitive)
          const headerIndex = headers.findIndex(header => 
            header && propName && header.toLowerCase().trim() === propName.toLowerCase().trim()
          );
          
          if (headerIndex === -1) {
            console.log(`  → No CSV match (available: ${headers.join(', ')})`);
            continue;
          }
          
          console.log(`  → Matched with CSV column "${headers[headerIndex]}"`);
          
          if (rowData[headerIndex] === undefined || rowData[headerIndex] === null) {
            continue;
          }
          
          const cellValue = String(rowData[headerIndex]).trim();
          
          try {
            // Handle TEXT properties
            if (propValue.type === 'TEXT' && propDef.type === 'TEXT') {
              node.setProperties({ [propKey]: cellValue });
              console.log(`✓ Updated: "${propName}" = "${cellValue}"`);
            }
            // Handle BOOLEAN properties
            else if (propValue.type === 'BOOLEAN' && propDef.type === 'BOOLEAN') {
              const boolValue = parseBooleanValue(cellValue);
              node.setProperties({ [propKey]: boolValue });
              console.log(`✓ Updated: "${propName}" = ${boolValue}`);
            }
            // Handle VARIANT properties
            else if (propValue.type === 'VARIANT' && propDef.type === 'VARIANT') {
              let variantValue = cellValue;
              
              // Optional: Try to convert boolean-style values to yes/no for common use cases
              const lowerValue = cellValue.toLowerCase();
              if (propDef.variantOptions) {
                const hasYesNo = propDef.variantOptions && (propDef.variantOptions.includes('yes') || propDef.variantOptions.includes('no'));
                
                if (hasYesNo) {
                  // Convert boolean-style values to yes/no
                  if (lowerValue === 'true' || lowerValue === '1' || lowerValue === 'on' || 
                      lowerValue === 'enabled' || lowerValue === 'active' || lowerValue === 'yes') {
                    variantValue = 'yes';
                  } else if (lowerValue === 'false' || lowerValue === '0' || lowerValue === 'off' || 
                             lowerValue === 'disabled' || lowerValue === 'inactive' || lowerValue === 'no') {
                    variantValue = 'no';
                  }
                }
              }
              
              node.setProperties({ [propKey]: variantValue });
              console.log(`✓ Updated: "${propName}" = "${variantValue}"`);
            }
            // Handle INSTANCE_SWAP properties
            else if (propValue.type === 'INSTANCE_SWAP' && propDef.type === 'INSTANCE_SWAP') {
              const componentNameOrKey = cellValue;
              console.log(`  → Swapping to: "${componentNameOrKey}"`);
              
              // Strategy 1: Try to find the component in the document
              console.log(`  → Strategy 1: Searching document...`);
              let targetComponent = await findComponentByName(componentNameOrKey);
              
              if (!targetComponent) {
                // Strategy 2: Search through all instances in the document
                console.log(`  → Strategy 1 failed, trying Strategy 2...`);
                console.log(`  → Searching all instances for component "${componentNameOrKey}"...`);
                targetComponent = await findComponentFromAnyInstance(componentNameOrKey);
              }
              
              if (targetComponent) {
                console.log(`  → Found component:`, targetComponent.name);
                console.log(`  → Component id: ${targetComponent.id}`);
                
                try {
                  // For INSTANCE_SWAP, we need to pass the component's ID as a string
                  // The current value format is "12:9" (node ID), not a component key
                  node.setProperties({ [propKey]: targetComponent.id });
                  console.log(`✓ Updated: "${propName}" swapped to "${targetComponent.name}"`);
                } catch (error) {
                  console.error(`✗ Error swapping "${propName}":`, error.message);
                }
              } else {
                console.log(`✗ Component "${componentNameOrKey}" not found`);
              }
            }
          } catch (error) {
            console.error(`Error updating component property ${propName}:`, error);
          }
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

// Find a component by name in the document
// This includes searching for instances of library components
async function findComponentByName(componentName) {
  const nameLower = componentName.toLowerCase();
  console.log(`  → findComponentByName: searching for "${componentName}"`);
  
  // Search in the current page first
  const findInNode = (node, depth = 0) => {
    const indent = '    '.repeat(depth);
    
    // Log EVERY node we're checking (not just top-level)
    console.log(`${indent}Checking: ${node.name} (type: ${node.type})`);
    
    // Check if it's a component or component set with matching name
    if ((node.type === 'COMPONENT' || node.type === 'COMPONENT_SET') && 
        node.name.toLowerCase() === nameLower) {
      console.log(`${indent}✓ Found COMPONENT: "${node.name}" (id: ${node.id})`);
      return node;
    }
    
    // Also check instances - if we find an instance with matching mainComponent name,
    // we can use its mainComponent (this handles library components!)
    if (node.type === 'INSTANCE' && node.mainComponent) {
      // Trim spaces from mainComponent name for comparison
      const mainComponentName = node.mainComponent.name.trim().toLowerCase();
      
      // Log what we're comparing
      if (mainComponentName.includes(nameLower.substring(0, 3))) {
        console.log(`${indent}  Checking instance: "${node.name}" with mainComponent: "${node.mainComponent.name}"`);
      }
      
      if (mainComponentName === nameLower) {
        console.log(`${indent}✓ Found INSTANCE with mainComponent: "${node.mainComponent.name}" (id: ${node.mainComponent.id})`);
        return node.mainComponent;
      }
    }
    
    if ('children' in node) {
      for (const child of node.children) {
        const found = findInNode(child, depth + 1);
        if (found) return found;
      }
    }
    
    return null;
  };
  
  // Search ALL pages (not just current page first)
  console.log(`  → Searching all pages...`);
  for (const page of figma.root.children) {
    console.log(`  → Searching page: "${page.name}"`);
    const component = findInNode(page);
    if (component) {
      console.log(`  → Found in page: "${page.name}"`);
      return component;
    }
  }
  
  console.log(`  → Component "${componentName}" not found anywhere`);
  return null;
}

// Find a component by searching through all instance swap properties in the document
// This finds library components that are used in ANY instance swap property
async function findComponentFromAnyInstance(componentName) {
  const nameLower = componentName.toLowerCase();
  
  const searchInNode = (node) => {
    // Check if this is an instance with component properties
    if (node.type === 'INSTANCE' && 'componentProperties' in node && node.mainComponent) {
      const componentProps = node.componentProperties;
      
      // Get property definitions
      let propDefs = null;
      try {
        if (node.mainComponent.parent && node.mainComponent.parent.type === 'COMPONENT_SET') {
          propDefs = node.mainComponent.parent.componentPropertyDefinitions;
        } else if (node.mainComponent.type === 'COMPONENT') {
          propDefs = node.mainComponent.componentPropertyDefinitions;
        }
      } catch (error) {
        // Ignore errors
      }
      
      if (propDefs) {
        // Check each INSTANCE_SWAP property
        for (const [propKey, propValue] of Object.entries(componentProps)) {
          if (!propValue || propValue.type !== 'INSTANCE_SWAP') continue;
          
          const propDef = propDefs[propKey];
          if (!propDef || propDef.type !== 'INSTANCE_SWAP') continue;
          
          // Check if this property's current value has a mainComponent with matching name
          if (propValue.value && typeof propValue.value === 'object') {
            // The value is an instance - get its mainComponent
            const currentInstance = figma.getNodeById(propValue.value);
            if (currentInstance && currentInstance.type === 'INSTANCE' && currentInstance.mainComponent) {
              if (currentInstance.mainComponent.name.toLowerCase() === nameLower) {
                return currentInstance.mainComponent;
              }
            }
          }
        }
      }
    }
    
    // Recursively search children
    if ('children' in node) {
      for (const child of node.children) {
        const found = searchInNode(child);
        if (found) return found;
      }
    }
    
    return null;
  };
  
  // Search current page
  let component = searchInNode(figma.currentPage);
  if (component) return component;
  
  // Search all pages
  for (const page of figma.root.children) {
    component = searchInNode(page);
    if (component) return component;
  }
  
  return null;
}
