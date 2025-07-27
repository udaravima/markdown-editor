# Markdown Live Preview - Deployment Guide

## Project Structure

Your project now follows the proper Vite build structure:

```
markdown-editor/
├── index.html          # Main HTML file (entry point)
├── src/               # Source files
│   ├── main.js        # Main JavaScript entry point
│   └── *.js           # Other JavaScript modules
├── public/            # Static assets (copied as-is to dist)
│   ├── css/           # CSS files for dynamic loading
│   ├── image/         # Images
│   ├── js/            # Static JavaScript files
│   └── favicon.png    # Favicon
├── vite.config.js     # Vite configuration
├── package.json       # Project dependencies and scripts
└── dist/              # Built files for deployment
    ├── index.html     # Processed HTML
    ├── assets/        # Bundled and hashed JS/CSS
    ├── css/           # Static CSS files
    ├── image/         # Static images
    ├── js/            # Static JS files
    └── favicon.png    # Favicon
```

## Build Process

1. **Development**: `npm run dev`
   - Starts Vite development server
   - Hot reloading enabled
   - Access at http://localhost:3000

2. **Build for Production**: `npm run build`
   - Creates optimized build in `dist/` directory
   - Uses relative paths for compatibility with any server setup
   - Bundles and optimizes assets

3. **Preview Build**: `npm run preview`
   - Preview the production build locally
   - Access at http://localhost:4173

## Deployment Instructions

### Option 1: Copy dist folder to your web server
```bash
# After running npm run build
cp -r dist/* /path/to/your/webserver/root/
```

### Option 2: Deploy to specific subdirectory
If deploying to a subdirectory, the relative paths will work correctly:
```bash
# Example: deploying to mydomain.com/markdown-editor/
cp -r dist/* /path/to/webserver/markdown-editor/
```

### Option 3: Static hosting services
The `dist` folder can be directly uploaded to:
- GitHub Pages
- Netlify
- Vercel
- Firebase Hosting
- Any static hosting provider

## Key Fixes Applied

1. **Relative Paths**: Changed from absolute paths (`/assets/`) to relative paths (`./assets/`)
2. **Static Assets**: Moved CSS and images to `public/` directory for proper handling
3. **JavaScript Updates**: Updated theme switching code to use relative paths
4. **Vite Configuration**: Added proper configuration for your project structure

## Configuration Details

The `vite.config.js` file includes:
- `base: './'` for relative paths
- Proper public directory configuration
- Asset naming patterns
- Source map generation for debugging

## Browser Compatibility

The built application will work on any modern web server because:
- Uses relative paths (no dependency on server root)
- All assets are properly bundled
- CSS and JS files are optimized and compressed
- Source maps available for debugging

## Troubleshooting

If you encounter issues:

1. **CSS not loading**: Ensure the `css/` folder is copied from `dist/` to your server
2. **Theme switching not working**: Check that both light and dark CSS files are present
3. **Absolute path errors**: Verify all paths in your code use relative paths (`./` prefix)
4. **Missing assets**: Ensure the entire `dist/` directory contents are deployed

## Testing Locally

To test the built version locally:
```bash
cd dist
python3 -m http.server 8000
# Or use any other static file server
# Then visit http://localhost:8000
```
