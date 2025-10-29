# Conveyor - Figma CSV Instance Generator

**Version:** 1.1.0

Conveyor is a powerful Figma plugin that automates the creation of component instances from CSV data. Perfect for generating design variations, populating mockups with real data, or batch-creating elements with different content.

## 🚀 Features

### 📋 Generate Tab

- **Component Selection**: Works with components, component sets, variants, and instances
- **CSV Import**: Upload CSV files via click or drag & drop
- **Live Preview**: Preview your CSV data before generating instances
- **Automatic Mapping**: Matches CSV columns to component properties by name (case-insensitive)
- **Smart Layout**: Arranges instances vertically with proper spacing

### 📄 Data Tab

- **CSV Upload**: Click or drag & drop to upload CSV files
- **Data Preview**: Scrollable table view of all CSV data
- **Statistics**: View row and column counts
- **Format Validation**: Handles quoted values, commas in fields, and empty cells

### 💡 About Tab

- **Feature Documentation**: Complete guide to plugin capabilities
- **Usage Examples**: Real-world use cases and tips
- **Technical Details**: API information and supported features

## 🎯 Supported Property Types

Conveyor intelligently handles multiple property types:

### TEXT Properties
- Maps CSV text values to component text properties
- Updates text layers by name
- Preserves formatting from the component

### BOOLEAN Properties
- Converts string values to boolean automatically
- Accepted TRUE values: `true`, `yes`, `1`, `on`, `enabled`, `active`
- Accepted FALSE values: `false`, `no`, `0`, `off`, `disabled`, `inactive`
- Case-insensitive parsing

### VARIANT Properties
- Matches CSV values to variant option names
- Auto-converts boolean-style values to yes/no variants
- Example: `true` → `"yes"`, `false` → `"no"`

### INSTANCE_SWAP Properties
- Swaps components dynamically by name
- Perfect for icons, avatars, illustrations, badges
- Searches entire document for matching components
- Case-insensitive component name matching
- Handles trailing spaces in component names

### Nested Components
- Automatically updates properties in nested component instances
- Recursively traverses component hierarchy
- Supports all property types in nested components

## 🛠️ How to Use

1. **Prepare Your Component**: Create a component with properties named to match your CSV column headers
2. **Prepare Your CSV**: First row should contain column headers matching component property names
3. **Select Component**: Click "Select Component" and choose your component in Figma
4. **Upload CSV**: Switch to Data tab and upload your CSV file
5. **Generate**: Return to Generate tab and click "Generate Instances"

## 📊 Example CSV Format

```csv
Name,Email,Role,Active,Status,Icon
John Doe,john@example.com,Designer,true,online,shapes
Jane Smith,jane@example.com,Developer,yes,away,share
Bob Johnson,bob@example.com,Manager,false,offline,sheet
```

## 🎨 Use Cases

- **User Cards**: Generate profile cards with names, emails, avatars, and status indicators
- **Product Lists**: Create product cards with titles, descriptions, prices, and availability flags
- **Team Directories**: Build team member cards with roles, contact info, and online status
- **Icon Libraries**: Test different icon components in layouts
- **Status Indicators**: Control visibility of nested components (badges, indicators, etc.)
- **A/B Testing**: Create design variations with different boolean states
- **Data Mockups**: Populate designs with realistic data for presentations

## 🔧 Technical Details

- **API Version**: Figma Plugin API 1.0.0
- **No Network Access**: All processing is local
- **Supported Node Types**: Components, component sets, variants, instances
- **Supported Property Types**: TEXT, BOOLEAN, VARIANT, INSTANCE_SWAP
- **Font Handling**: Automatic font loading for text updates
- **CSV Parsing**: Handles quoted values, commas in fields, empty cells
- **UTF-8 Encoding**: Full Unicode support

## 💡 Tips

- Use component properties (exposed properties) for easier instance customization
- Column headers are case-insensitive (`"active"` matches `"Active"`)
- Boolean values are flexible: use `true`/`false`, `yes`/`no`, `1`/`0`, etc.
- Instance swap works with exact component names (case-insensitive)
- Nested component properties are automatically updated
- Test with small datasets first (2-3 rows) before processing large files
- You can undo with Cmd/Ctrl + Z

## 📝 License

MIT License - Free to use and modify
