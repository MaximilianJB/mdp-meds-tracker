# Pharmacy Inventory Tracker

A simple, offline-capable Progressive Web App (PWA) for tracking pharmacy and supply inventory. Built with vanilla HTML, CSS, and JavaScript - no frameworks, no build tools, no backend required.

## Features

- **Offline-First**: Works completely offline after first load
- **PWA**: Installable on mobile and desktop devices
- **LocalStorage**: All data stored locally on device
- **Medicine Tracking**: Track bottles and baggies with automatic quantity calculation
- **Supply Tracking**: Simple quantity tracking for non-medicine supplies
- **Color-Coded Status**: Visual indicators for inventory levels (green >50%, orange 20-50%, red <20%)
- **Smart Subtraction**: Automatically subtracts from baggies first, then bottles
- **Elderly-Friendly UI**: Large text, large buttons, clean design

## Usage

### Running the App

1. Clone this repository
2. Serve the files with any HTTP server (e.g., `python3 -m http.server 8080`)
3. Open in a browser: `http://localhost:8080`
4. The app will work offline after the first load

### Adding Items

1. Click the "+ Add Item" button
2. Choose category: Medicine or Supply
3. Fill in the required fields
4. For medicines, specify bottle and baggie counts
5. Click "Save"

### Tracking Inventory

- View all items on the main screen with current quantities and percentages
- Click any item to see full details
- Use the "Subtract Units" button to remove units from inventory
- Edit items using the "Edit" button on the detail screen

### Installing as PWA

On mobile:
- Open the app in your browser
- Look for "Add to Home Screen" option in your browser menu
- Confirm to install

On desktop:
- Open the app in Chrome/Edge
- Look for the install icon in the address bar
- Click to install

## Data Model

Each inventory item includes:
- `id`: Unique identifier
- `category`: "Medicine" or "Supply"
- `name`: Item name
- `description`: Optional description
- `startingQuantity`: Initial quantity
- `currentQuantity`: Current quantity (computed for medicines)

For medicines only:
- `drugName`: Name of the drug
- `dosage`: Dosage amount (e.g., "500mg")
- `form`: Form type (e.g., "Tablet", "Capsule")
- `bottleCount`: Number of bottles
- `unitsPerBottle`: Units in each bottle
- `baggieCount`: Number of baggies
- `unitsPerBaggie`: Units in each baggie

## Files

- `index.html` - Main HTML structure
- `style.css` - Styling and layout
- `app.js` - Application logic and data management
- `sw.js` - Service Worker for offline functionality
- `manifest.json` - PWA manifest for installability

## Browser Support

Works in all modern browsers that support:
- Service Workers
- LocalStorage
- ES6 JavaScript

## License

MIT