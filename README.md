# Pliant Dashboard Prototype

A customizable dashboard prototype with three distinct sections and full customization capabilities.

## Features

### 1. Top Section - Fixed Financial Overview
- **Account Balance** widget
- **Balance Development** widget
- Always visible at the top (hideable but not movable)
- Fixed position layout

### 2. Middle Section - Customizable Feature Modules
- **Cashback**, **Members**, **Cards**, **Transaction Review**, **Bank Transfers**, **Accounting**, **Admin Tasks**
- Full customization:
  - ✅ Show/Hide widgets
  - ✅ Drag & Drop to reorder
  - ✅ Resize widgets (1/3 or 2/3 width)
- Consistent height across all widgets

### 3. Bottom Section - Analytics & Insights
- **Top Employees by Spend**
- **Top Categories by Spend**
- **Top Merchants by Spend**
- Limited customization (show/hide only)
- Read-only analytics widgets

## How to Use

1. **Open the dashboard**: Simply open `index.html` in your web browser

2. **Customize widgets**:
   - Click the **"Customize"** button in the top right
   - Toggle widgets on/off using the switches in the dropdown menu
   - Widgets can also be hidden using the eye icon (👁️) on each widget

3. **Reorder middle section widgets**:
   - Drag and drop any widget in the middle section to reorder them
   - The order is automatically saved

4. **Resize middle section widgets**:
   - Click the **"1/3"** or **"2/3"** buttons at the bottom of any middle section widget
   - Widgets can span 1/3 or 2/3 of the grid width

5. **Persistence**: All customization settings are saved to browser localStorage and will persist across page reloads

## File Structure

```
dashboard-prototype/
├── index.html      # Main HTML structure
├── styles.css      # Styling and layout
├── script.js       # Dashboard logic and customization features
└── README.md       # This file
```

## Browser Compatibility

Works in all modern browsers that support:
- CSS Grid
- Drag and Drop API
- LocalStorage

## Notes

- Widget content is kept minimal (placeholders) as requested
- All widgets show clear outlines and borders
- The layout is responsive and adapts to different screen sizes
