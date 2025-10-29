# CSV Instance Generator - Figma Plugin

A Figma plugin that generates component instances from CSV data, automatically replacing text layer content with data from each CSV row.

## Features

- 📦 Select any component, component set, or instance
- 📄 Upload CSV files with your data
- 🔄 Automatically creates instances for each CSV row
- 🏷️ Maps CSV columns to text layers by matching names
- 📐 Arranges instances vertically with proper spacing
- 👀 Preview CSV data before generating

## How to Install

1. Open Figma Desktop App
2. Go to **Plugins** → **Development** → **Import plugin from manifest**
3. Select the `manifest.json` file from this plugin directory
4. The plugin will appear in your **Plugins** → **Development** menu

## How to Use

### Step 1: Prepare Your Component

Create a component in Figma with:
- **Component text properties** (exposed in the properties panel), OR
- **Text layers** named to match your CSV columns

**Example:**
- CSV headers: `Name`, `Email`, `Role`
- Component text properties: Create text properties named `Name`, `Email`, `Role` (case-insensitive)
- OR text layers: Name them `Name`, `Email`, `Role`

**The plugin matches by name**, so your CSV column headers should match either:
1. Component text property names, OR
2. Text layer names in the component

### Step 2: Prepare Your CSV File

Create a CSV file with headers in the first row:

```csv
Name,Email,Role
John Doe,john@example.com,Designer
Jane Smith,jane@example.com,Developer
Bob Johnson,bob@example.com,Manager
```

### Step 3: Run the Plugin

1. Select your component (or an instance of it)
2. Run the plugin: **Plugins** → **Development** → **CSV Instance Generator**
3. Click **"Select Component"** to confirm your selection
4. Upload your CSV file
5. Preview the data
6. Click **"Generate Instances"**

The plugin will:
- Create one instance per CSV row
- Replace text layer content with corresponding CSV data
- Arrange instances vertically with spacing
- Select all created instances

## CSV Format

- First row must contain column headers
- CSV column headers should match component text property names or text layer names (case-insensitive)
- Supports quoted values with commas: `"Last, First"`
- Empty cells are supported

## Tips

- **Recommended:** Use component text properties for easier instance customization
- Name your text properties/layers to match CSV headers exactly (case-insensitive matching)
- The plugin preserves text formatting from the original component
- Instances are created on the current page
- You can undo the operation with Cmd/Ctrl + Z

## Technical Details

- **API Version:** Figma Plugin API 1.0.0
- **No network access required** - all processing is local
- Supports components, component sets, and instances
- Handles font loading automatically
- Maps CSV columns to:
  1. Component text properties (by property name)
  2. Text layer names (by layer name)

## Troubleshooting

**"Please select a component first"**
- Make sure you have a component, component set, or instance selected before clicking "Select Component"

**Text not updating**
- Check that component text property names or text layer names match CSV column headers (case-insensitive)
- Ensure the CSV file has proper headers in the first row
- Verify your component has text properties exposed or text layers with matching names

**Font errors**
- The plugin attempts to load fonts automatically, but some custom fonts may cause issues

## License

MIT License - Feel free to modify and distribute

## Version

1.0.0 - Initial release
