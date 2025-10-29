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
    
    console.log(`Processing instance: ${node.name}`);
    console.log('Component properties:', Object.keys(componentProps));
    
    if (mainComponent) {
      // Get property definitions - need to handle variants properly
      let propDefs = null;
      
      try {
        // Check if this is a variant (child of a component set)
        if (mainComponent.parent && mainComponent.parent.type === 'COMPONENT_SET') {
          // For variants, get definitions from the parent component set
          propDefs = mainComponent.parent.componentPropertyDefinitions;
          console.log('Getting definitions from component set');
        } else if (mainComponent.type === 'COMPONENT') {
          // For regular components, get definitions directly
          propDefs = mainComponent.componentPropertyDefinitions;
          console.log('Getting definitions from component');
        }
      } catch (error) {
        console.error('Error accessing component property definitions:', error);
      }
      
      if (propDefs) {
        console.log('Property definitions:', Object.keys(propDefs).map(key => {
          const def = propDefs[key];
          return `${def.name} (${def.type})`;
        }));
        
        // Iterate through component properties
        for (const [propKey, propValue] of Object.entries(componentProps)) {
          if (!propValue || typeof propValue !== 'object' || !('type' in propValue)) continue;
          
          const propDef = propDefs[propKey];
          if (!propDef) continue;
          
          const propName = propDef.name;
          console.log(`Checking property: ${propName} (type: ${propDef.type})`);
          
          // Find matching CSV column (case-insensitive)
          const headerIndex = headers.findIndex(header => 
            header && propName && header.toLowerCase().trim() === propName.toLowerCase().trim()
          );
          
          if (headerIndex === -1) {
            console.log(`  No CSV column match for "${propName}"`);
            continue;
          }
          
          if (rowData[headerIndex] === undefined || rowData[headerIndex] === null) {
            console.log(`  CSV column "${headers[headerIndex]}" has no value`);
            continue;
          }
          
          const cellValue = String(rowData[headerIndex]).trim();
          console.log(`  Matched! CSV column "${headers[headerIndex]}" = "${cellValue}"`);
          
          try {
            // Handle TEXT properties
            if (propValue.type === 'TEXT' && propDef.type === 'TEXT') {
              console.log(`  Setting TEXT property to: ${cellValue}`);
              node.setProperties({
                [propKey]: cellValue
              });
            }
            // Handle BOOLEAN properties
            else if (propValue.type === 'BOOLEAN' && propDef.type === 'BOOLEAN') {
              // Convert string to boolean
              const boolValue = parseBooleanValue(cellValue);
              console.log(`  Setting BOOLEAN property to: ${boolValue}`);
              node.setProperties({
                [propKey]: boolValue
              });
            }
            // Handle VARIANT properties
            else if (propValue.type === 'VARIANT' && propDef.type === 'VARIANT') {
              // For variants, the value should match one of the variant options
              // We'll use the CSV value as-is, but can also support boolean-style conversion
              let variantValue = cellValue;
              
              console.log(`  VARIANT property detected. Options: ${propDef.variantOptions?.join(', ')}`);
              
              // Optional: Try to convert boolean-style values to yes/no for common use cases
              const lowerValue = cellValue.toLowerCase();
              if (propDef.variantOptions) {
                // Check if the variant has 'yes'/'no' options
                const hasYesNo = propDef.variantOptions.includes('yes') || propDef.variantOptions.includes('no');
                
                if (hasYesNo) {
                  console.log('  Variant has yes/no options, attempting conversion');
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
              
              console.log(`  Setting VARIANT property to: "${variantValue}"`);
              node.setProperties({
                [propKey]: variantValue
              });
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
