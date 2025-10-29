### Instance Swap Not Working
**Possible causes:**
- Component name in CSV doesn't match any component in Figma
- Check spelling and exact component name (case-insensitive but must match)
- Component might be in a different page - plugin searches all pages
- Ensure the property type is INSTANCE_SWAP (not TEXT or VARIANT)
- Check console logs to see what components are being searched

**Debug steps:**
1. Open console: Plugins → Development → Open Console
2. Look for "Looking for component with name" messages
3. Verify component exists with exact name in Figma
4. Try using the component name exactly as it appears in layers panel### Instance Swap Handling

The plugin supports instance swap properties for dynamic component replacement:

**How It Works:**
- CSV value contains the name of a component to swap to
- Plugin searches the entire Figma document for a component with that name
- Component name matching is case-insensitive
- Perfect for icons, avatars, illustrations, badges, etc.

**Example:**
```csv
Name,Icon,Avatar
John,shapes,profile-male
Jane,share,profile-female  
Bob,sheet,profile-default
```

**Requirements:**
- Components must exist in your Figma file (any page)
- Component names in CSV must match Figma component names
- Works with both regular components and component sets

**Common Use Cases:**
- **Icons** - Swap different icon components (shapes, share, settings, etc.)
- **Avatars** - Swap different avatar/profile images
- **Illustrations** - Change illustrations based on context
- **Badges** - Swap different badge/label designs
- **Status Indicators** - Different visual indicators per state### Variant Value Handling

The plugin intelligently handles variant properties:

**Direct Matching:**
- CSV value matches variant option name exactly (case-insensitive)
- Example: CSV "online" → Variant option "online"

**Boolean to Yes/No Conversion:**
- For variants with "yes"/"no" options, boolean-style values are auto-converted
- `true`, `1`, `on`, `enabled`, `active` → "yes"
- `false`, `0`, `off`, `disabled`, `inactive` → "no"
- Perfect for variants like "Active=yes/no", "Visible=yes/no", etc.

**Example:**
```csv
Name,Active,Status
John,true,online    # Active variant becomes "yes", Status becomes "online"
Jane,false,away     # Active variant becomes "no", Status becomes "away"
```### Nested Components

The plugin automatically traverses and updates nested component instances. If your main component contains other component instances, their properties will also be updated based on CSV column names.

**Example:**
- Main component has a nested "Badge" component with a boolean property "Visible"
- CSV column "Visible" with values `true`/`false` will control the badge visibility
- All matching property names across the component hierarchy are updated# Conveyor - Figma Plugin

A powerful Figma plugin that automates the creation of component instances from CSV data. Perfect for generating design variations, populating mockups with real data, or batch-creating elements with different content.

![Version](https://img.shields.io/badge/version-1.1.0-blue)
![Figma](https://img.shields.io/badge/Figma-Plugin-ff7262)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

- 📦 **Component Support** - Works with components, component sets, variants, and instances
- 📄 **CSV Import** - Upload CSV files via click or drag & drop
- 🔄 **Automatic Mapping** - Matches CSV columns to component text, boolean, variant, and instance swap properties by name
- 🔘 **Boolean Support** - Automatically converts CSV values to boolean properties (true/false, yes/no, 1/0, etc.)
- 🎭 **Variant Support** - Works with variant properties, auto-converts boolean values to yes/no variants
- 🔀 **Instance Swap Support** - Swap component instances by name (perfect for icons, avatars, etc.)
- 🎭 **Nested Components** - Updates properties in nested component instances automatically
- 🎨 **Smart Layout** - Arranges instances vertically with proper spacing
- 👀 **Live Preview** - Preview your CSV data before generating instances
- 🎯 **Three-Tab Interface** - Clean, organized UI for Generate, Data, and About
- 💾 **Local Processing** - All data processing happens locally, no network access required

## 🚀 Quick Start

### Installation

1. Download or clone this repository
2. Open **Figma Desktop App**
3. Go to **Plugins** → **Development** → **Import plugin from manifest**
4. Select the `manifest.json` file from this directory
5. The plugin appears in **Plugins** → **Development** → **Conveyor**

### Usage

#### 1. Prepare Your Component

Create a Figma component with text and/or boolean properties. Name them to match your CSV column headers.

**Example Component:**
- Text property: `Name`
- Text property: `Email`
- Text property: `Role`
- Boolean property: `Active`
- Variant property: `Status` (with options: "online", "offline", "away")
- Instance swap property: `Icon` (with preferred values: shapes, share, sheet, etc.)

> 💡 **Tip:** Component properties (exposed properties) are recommended for easier instance customization.

#### 2. Prepare Your CSV File

Create a CSV file with headers in the first row that match your component property names.

```csv
Name,Email,Role,Active,Status,Icon
John Doe,john@example.com,Designer,true,online,shapes
Jane Smith,jane@example.com,Developer,yes,away,share
Bob Johnson,bob@example.com,Manager,false,offline,sheet
```

**Boolean Values:**
The plugin accepts multiple formats for boolean properties:
- **TRUE:** `true`, `yes`, `1`, `on`, `enabled`, `active` (case-insensitive)
- **FALSE:** `false`, `no`, `0`, `off`, `disabled`, `inactive` (case-insensitive)

**Variant Values:**
For variant properties:
- Use the exact variant option name (e.g., "online", "offline", "away")
- For yes/no variants: Boolean-style values are automatically converted (true→yes, false→no)

**Instance Swap Values:**
For instance swap properties (e.g., Icon):
- Use the component name exactly as it appears in Figma (case-insensitive)
- The plugin searches the entire document for matching components
- Perfect for swapping icons, avatars, illustrations, etc.

See `example.csv` for a sample file.

#### 3. Generate Instances

1. Select your component (or an instance of it) in Figma
2. Run the plugin: **Plugins** → **Development** → **Conveyor**
3. In the **Generate** tab, click **"Select Component"**
4. Switch to the **Data** tab
5. Upload your CSV file (click or drag & drop)
6. Review the data preview
7. Return to the **Generate** tab and click **"Generate Instances"**

Done! 🎉 The plugin creates one instance per CSV row with all text content populated.

## 🎯 How It Works

The plugin uses intelligent name-based matching:

1. **Component Text Properties** - Text properties are matched with CSV column headers containing text values
2. **Component Boolean Properties** - Boolean properties are matched with CSV column headers containing boolean values
3. **Component Variant Properties** - Variant properties are matched with CSV column headers containing variant option names
4. **Component Instance Swap Properties** - Instance swap properties are matched with CSV column headers containing component names
5. **Nested Component Properties** - Properties in nested component instances are also matched and updated
6. **Text Layer Names** - Text layers in the component are matched with CSV column headers
7. **Case-Insensitive** - Matching works regardless of case (e.g., "active" matches "Active", "shapes" matches "Shapes")
8. **Column Order Independent** - Column order in CSV doesn't matter, only names need to match

### Boolean Value Parsing

The plugin automatically converts string values from CSV to boolean:

**Accepted TRUE values:** `true`, `yes`, `1`, `on`, `enabled`, `active`  
**Accepted FALSE values:** `false`, `no`, `0`, `off`, `disabled`, `inactive`

All values are case-insensitive, so `TRUE`, `True`, and `true` all work.

### Example Mapping

| CSV Column | Component Property | Type | CSV Value | Result |
|------------|-------------------|------|-----------|--------|
| Name | "Name" | TEXT | "John Doe" | ✅ Matched & Updated |
| email | "Email" | TEXT | "john@example.com" | ✅ Matched (case-insensitive) |
| Active | "Active" | BOOLEAN | "yes" | ✅ Converted to true |
| Status | "Status" | VARIANT | "online" | ✅ Matched to variant option |
| Active | "Active" (yes/no variant) | VARIANT | "true" | ✅ Converted to "yes" |
| Icon | "Icon" | INSTANCE_SWAP | "shapes" | ✅ Swapped to shapes component |
| Visible | "Visible" (nested) | BOOLEAN | "true" | ✅ Updated in nested instance |
| State | "Description" | TEXT | "Active" | ❌ Not matched (different names) |

## 📋 Plugin Interface

### Generate Tab
- Select your component
- Generate instances with one click
- View status messages and success feedback

### Data Tab
- Upload CSV files (click or drag & drop)
- Preview full CSV data in a scrollable table
- See row and column counts

### About Tab
- Plugin documentation
- Feature list and examples
- Tips and troubleshooting

## 🛠️ Technical Details

- **API Version:** Figma Plugin API 1.0.0
- **No Network Access** - All processing is local
- **Supported Node Types:** Components, component sets, variants, instances
- **Supported Property Types:** TEXT, BOOLEAN, VARIANT, INSTANCE_SWAP
- **Nested Component Support** - Recursively updates all nested instances
- **Variant Support** - Properly handles component sets and variant property definitions
- **Boolean to Variant Conversion** - Auto-converts boolean values to yes/no for variants
- **Instance Swap Support** - Find and swap components by name across entire document
- **Font Handling:** Automatic font loading for text updates
- **CSV Parsing:** Handles quoted values, commas in fields, empty cells
- **Boolean Parsing:** Flexible parsing with multiple accepted formats

## 📝 CSV Format Requirements

- First row must contain column headers
- Headers should match component property names (case-insensitive)
- Supports quoted values with commas: `"Last, First"`
- Empty cells are supported and will be skipped
- UTF-8 encoding recommended
- Boolean columns can use any accepted format (see Boolean Value Parsing above)

## 💡 Tips & Best Practices

### For Best Results

1. **Use Component Properties** - Expose text, boolean, variant, and instance swap properties in your component for easier instance management
2. **Name Consistently** - Use the same naming convention in both CSV and component
3. **Boolean Formats** - Use any accepted boolean format (true/false, yes/no, 1/0, etc.)
4. **Variant Values** - Use exact variant option names, or boolean-style values for yes/no variants
5. **Instance Swap** - Use exact component names as they appear in Figma (case-insensitive)
6. **Leverage Nesting** - Use nested components with properties for modular designs
7. **Test with Small Data First** - Try with 2-3 rows before processing large datasets
8. **Keep Backup** - The plugin supports undo (Cmd/Ctrl + Z), but save your work first

### Common Use Cases

- **User Cards** - Generate user profile cards with names, emails, avatars (instance swap), and active status
- **Product Lists** - Create product cards with titles, descriptions, prices, icons (instance swap), and availability flags
- **Team Directories** - Build team member cards with roles, contact info, custom avatars (instance swap), and online status
- **Icon Libraries** - Test icon components by swapping different icons in layouts
- **Feature Flags** - Design UI with toggleable features using nested badge/indicator components
- **A/B Testing** - Create multiple variations of designs with different boolean states and swapped elements
- **Status Indicators** - Generate elements with active/inactive, on/off states in nested components
- **Notification Badges** - Control visibility of nested notification/badge components

## 🐛 Troubleshooting

### "Please select a component first"
**Solution:** Make sure you have a component, component set, or instance selected in Figma before clicking "Select Component"

### Text Not Updating
**Possible causes:**
- Component property/layer names don't match CSV headers
- Check spelling and capitalization (matching is case-insensitive but names must match)
- Ensure CSV file has proper headers in first row
- Verify the component has text properties or text layers

### Boolean Properties Not Updating
**Possible causes:**
- Property in component is not set as BOOLEAN type
- CSV value format not recognized - use: true/false, yes/no, 1/0, on/off, etc.
- Property name doesn't match CSV header (case-insensitive)
- Check that the component property is exposed

### Variant Properties Not Updating
**Possible causes:**
- CSV value doesn't match any variant option (check spelling)
- For yes/no variants: boolean-style values should auto-convert
- Property name doesn't match CSV header (case-insensitive)
- Nested variant might be in a nested instance - ensure it's exposed

### Font Errors
**Solution:** The plugin attempts to load fonts automatically. If you encounter font errors:
- Ensure the fonts used in your component are installed
- Try using standard system fonts
- Check that text layers are not using missing fonts

### Invalid CSV File
**Possible causes:**
- File is not a valid CSV format
- File has formatting issues (unbalanced quotes, etc.)
- Try opening and re-saving the CSV in a spreadsheet application

## 🗂️ Project Structure

```
conveyor/
├── manifest.json       # Plugin configuration
├── code.js            # Main plugin logic (Figma API)
├── ui.html            # User interface with styling and scripts
├── tsconfig.json      # TypeScript configuration
├── example.csv        # Sample CSV file for testing
├── README.md          # This file
└── .gitignore        # Git ignore rules
```

## 🔧 Development

### Files Overview

**manifest.json**
- Plugin metadata and configuration
- Defines entry points (code.js, ui.html)
- Network access settings

**code.js**
- Main plugin logic running in Figma's sandbox
- Handles component selection and instance creation
- Manages text, boolean, and variant property updates
- Recursively updates nested component instances
- Auto-converts boolean values to yes/no for variants
- Font loading for text layers
- Communicates with UI via postMessage

**ui.html**
- Complete UI with embedded CSS and JavaScript
- Three-tab interface (Generate, Data, About)
- CSV parsing and drag & drop handling
- Data preview and validation

### Extending the Plugin

To add new features:

1. **UI Changes** - Edit `ui.html`
2. **Logic Changes** - Edit `code.js`
3. **Test in Figma** - Reload plugin after changes
4. **Update Docs** - Keep this README current

## 📄 License

MIT License

Copyright (c) 2025

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## 🤝 Contributing

Contributions are welcome! Feel free to:

- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

## 📮 Support

If you encounter issues or have questions:

1. Check the troubleshooting section above
2. Review the About tab in the plugin
3. Check existing issues in the repository
4. Create a new issue with detailed information

## 🎯 Roadmap

Future enhancements under consideration:

- [x] Support for boolean properties
- [x] Support for variant properties with yes/no conversion
- [x] Support for instance swap properties
- [ ] Support for image URLs in CSV (populate image layers)
- [ ] Custom spacing and layout options
- [ ] Export instances back to CSV
- [ ] Batch operations (update existing instances)
- [ ] Excel file support (.xlsx)
- [ ] Template saving and reuse
- [ ] Component search optimization for large files

## 🙏 Acknowledgments

Built with the Figma Plugin API and modern web technologies.

---

**Made with ❤️ for the Figma community**

*Version 1.1.0 - 2025*
