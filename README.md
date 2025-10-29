# CSV Instance Generator for Figma

A powerful Figma plugin that automates the creation of component instances from CSV data. Perfect for generating design variations, populating mockups with real data, or batch-creating elements with different content.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Figma](https://img.shields.io/badge/Figma-Plugin-ff7262)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

- 📦 **Component Support** - Works with components, component sets, and instances
- 📄 **CSV Import** - Upload CSV files via click or drag & drop
- 🔄 **Automatic Mapping** - Matches CSV columns to component text properties and text layers by name
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
5. The plugin appears in **Plugins** → **Development** → **CSV Instance Generator**

### Usage

#### 1. Prepare Your Component

Create a Figma component with text properties or text layers. Name them to match your CSV column headers.

**Example Component:**
- Text property/layer: `Name`
- Text property/layer: `Email`
- Text property/layer: `Role`
- Text property/layer: `Status`

> 💡 **Tip:** Component text properties (exposed properties) are recommended for easier instance customization.

#### 2. Prepare Your CSV File

Create a CSV file with headers in the first row that match your component property/layer names.

```csv
Name,Email,Role,Status
John Doe,john@example.com,Designer,Active
Jane Smith,jane@example.com,Developer,Active
Bob Johnson,bob@example.com,Manager,Inactive
Alice Williams,alice@example.com,Designer,Active
```

See `example.csv` for a sample file.

#### 3. Generate Instances

1. Select your component (or an instance of it) in Figma
2. Run the plugin: **Plugins** → **Development** → **CSV Instance Generator**
3. In the **Generate** tab, click **"Select Component"**
4. Switch to the **Data** tab
5. Upload your CSV file (click or drag & drop)
6. Review the data preview
7. Return to the **Generate** tab and click **"Generate Instances"**

Done! 🎉 The plugin creates one instance per CSV row with all text content populated.

## 🎯 How It Works

The plugin uses intelligent name-based matching:

1. **Component Text Properties** - If your component has exposed text properties, they're matched with CSV column headers
2. **Text Layer Names** - Text layers in the component are matched with CSV column headers
3. **Case-Insensitive** - Matching works regardless of case (e.g., "name" matches "Name")
4. **Column Order Independent** - Column order in CSV doesn't matter, only names need to match

### Example Mapping

| CSV Column | Component Property/Layer | Result |
|------------|-------------------------|---------|
| Name | "Name" | ✅ Matched |
| email | "Email" | ✅ Matched (case-insensitive) |
| ROLE | "Role" | ✅ Matched (case-insensitive) |
| Status | "Description" | ❌ Not matched (different names) |

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
- **Supported Node Types:** Components, component sets, instances
- **Font Handling:** Automatic font loading for text updates
- **CSV Parsing:** Handles quoted values, commas in fields, empty cells

## 📝 CSV Format Requirements

- First row must contain column headers
- Headers should match component text property/layer names (case-insensitive)
- Supports quoted values with commas: `"Last, First"`
- Empty cells are supported and will be skipped
- UTF-8 encoding recommended

## 💡 Tips & Best Practices

### For Best Results

1. **Use Component Text Properties** - Expose text properties in your component for easier instance management
2. **Name Consistently** - Use the same naming convention in both CSV and component
3. **Test with Small Data First** - Try with 2-3 rows before processing large datasets
4. **Keep Backup** - The plugin supports undo (Cmd/Ctrl + Z), but save your work first

### Common Use Cases

- **User Cards** - Generate user profile cards with names, emails, avatars
- **Product Lists** - Create product cards with titles, descriptions, prices
- **Team Directories** - Build team member cards with roles and contact info
- **Data Visualization** - Populate charts and graphs with real data
- **A/B Testing** - Create multiple variations of designs quickly

## 🐛 Troubleshooting

### "Please select a component first"
**Solution:** Make sure you have a component, component set, or instance selected in Figma before clicking "Select Component"

### Text Not Updating
**Possible causes:**
- Component property/layer names don't match CSV headers
- Check spelling and capitalization (matching is case-insensitive but names must match)
- Ensure CSV file has proper headers in first row
- Verify the component has text properties or text layers

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
csv-instance-generator/
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
- Manages text layer updates and font loading
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

- [ ] Support for image URLs in CSV (populate image layers)
- [ ] Custom spacing and layout options
- [ ] Export instances back to CSV
- [ ] Support for boolean properties and variants
- [ ] Batch operations (update existing instances)
- [ ] Excel file support (.xlsx)
- [ ] Template saving and reuse

## 🙏 Acknowledgments

Built with the Figma Plugin API and modern web technologies.

---

**Made with ❤️ for the Figma community**

*Version 1.0.0 - 2025*
