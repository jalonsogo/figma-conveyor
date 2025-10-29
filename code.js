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
              const componentName = cellValue;
              console.log(`  → Swapping to component: "${componentName}"`);
              
              try {
                // For INSTANCE_SWAP, we can pass the component name/key directly as a string
                // Figma will resolve it (works with library components too!)
                node.setProperties({ [propKey]: componentName });
                console.log(`✓ Updated: "${propName}" swapped to "${componentName}"`);
              } catch (error) {
                console.error(`✗ Error swapping "${propName}" to "${componentName}":`, error);
                
                // Fallback: try to find the component in the document
                console.log(`  → Attempting to find component in document...`);
                const targetComponent = await findComponentByName(componentName);
                
                if (targetComponent) {
                  try {
                    node.setProperties({ [propKey]: targetComponent });
                    console.log(`✓ Updated: "${propName}" swapped to "${targetComponent.name}" (via document search)`);
                  } catch (fallbackError) {
                    console.error(`✗ Fallback also failed:`, fallbackError);
                  }
                } else {
                  console.log(`✗ Component "${componentName}" not found in document`);
                }
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
async function findComponentByName(componentName) {
  // Search in the current page first
  const findInNode = (node) => {
    if ((node.type === 'COMPONENT' || node.type === 'COMPONENT_SET') && 
        node.name.toLowerCase() === componentName.toLowerCase()) {
      return node;
    }
    
    if ('children' in node) {
      for (const child of node.children) {
        const found = findInNode(child);
        if (found) return found;
      }
    }
    
    return null;
  };
  
  // Search current page
  let component = findInNode(figma.currentPage);
  if (component) return component;
  
  // Search all pages if not found in current page
  for (const page of figma.root.children) {
    component = findInNode(page);
    if (component) return component;
  }
  
  return null;
}
