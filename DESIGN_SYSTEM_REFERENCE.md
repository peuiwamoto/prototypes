# Design System Reference

This document captures the key design tokens and patterns from the Figma Design System for use in prototyping.

## Color System

### Primary Colors
- Color palette includes: Blue, Green, Red, Yellow, Purple
- Each color has multiple shades (50, 100, 200... up to 900, and A100, A200, A400, A700)
- Full grayscale spectrum from very light to dark

### Semantic Colors
- **Primary**: Blue tones
- **Secondary**: Alternative primary color
- **Success**: Green
- **Danger**: Red
- **Warning**: Yellow
- **Info**: Blue/cyan
- **Light**: Light backgrounds
- **Dark**: Dark backgrounds/text

### Gradients
- Primary Gradient available for use

## Typography

### Headings
- H1, H2, H3, H4, H5, H6
- Font weights: Semibold, Medium, Regular
- Sans-serif typeface

### Body Text
- Body Large
- Body Medium
- Body Small
- Consistent line heights and spacing

## Buttons

### Types
- Primary (filled, blue)
- Secondary
- Tertiary
- Danger
- Success

### States
- Default
- Hover
- Pressed/Active
- Disabled

### Sizes
- Small
- Medium
- Large

### Variants
- Solid/Filled
- Outlined/Ghost
- With leading/trailing icons

## Sidebar (Admin App)

### Structure
- **Header**: Dark background with "pliant" brand name (lowercase, sans-serif, white/light text)
- **Navigation Area**: Very light off-white/creamy beige background
- **Active State**: Dark background with light text/icon
- **Accent**: Thin yellow vertical bar on right edge for some active items

### Navigation Items
- Icons on the left (Phosphor Icons, monochromatic, outline style)
- Text in dark grey/black (inactive) or white/light (active)
- Chevron icons for collapsible sections
- Indented sub-items when expanded

### Key Navigation Sections
- Dashboard, Users, Teams, Services, Files, Integrations, API, Payment, Webhooks, Templates, Analytics, Audit Log, Billing, My Account, Preferences
- Collapsible sections: Workflows & Rules, Accounts, Content & Pages, Blog, Messaging, Feedback, Reports, Settings, Support, Security, Logs

## Icons

- **Source**: Phosphor Icons (https://www.figma.com/design/R2PpZhzzRPAPO2erqakIRk/%F0%9F%92%9A-Phosphor-Icons--Community-)
- Style: Monochromatic, line-based, outline style
- Consistent visual weight and design
- Used throughout the interface for navigation, actions, and status indicators

## Other Components

### Form Elements
- Text inputs (single-line and multi-line)
- Select dropdowns
- Checkboxes & Radio buttons
- Switches/Toggles
- Date pickers
- Sliders

### Data Display
- Tables (extensive examples)
- Charts/Graphs (bar and line charts)
- Badges/Tags

### Feedback
- Alerts/Banners (Info, Success, Warning, Error)
- Modals/Dialogs
- Tooltips
- Empty states

### Navigation
- Tabs
- Breadcrumbs
- Pagination

## Material Design 3 (M3) Guidelines

### Core Principles

1. **Material as a Metaphor**: Use shadows, edges, and realistic animations to simulate depth and physical relationships, helping users understand interface hierarchies intuitively.

2. **Bold, Graphic, Intentional**: Employ deliberate use of typography, space, color, and imagery to create rhythm and emphasis, enhancing usability through structured grids and strong focal points.

3. **Motion Provides Meaning**: Animations maintain continuity, orient the user, and reinforce actions by mimicking real-world physics, making transitions more understandable.

4. **Flexible Foundation**: Customizable code base simplifies designer-developer handoff, enabling seamless implementation of new design elements, components, and plugins.

5. **Cross-Platform Consistency**: Uniform UI elements and a flexible, responsive grid ensure consistency across platforms, environments, and screen sizes.

### Design Tokens

#### Color System
- **Dynamic Color Theming**: Supports adaptive color palettes that can be derived from user preferences (Material You)
- **Color Roles**: Primary, Secondary, Tertiary colors, plus neutral tones
- **HCT Color Space**: Used for dynamic color derivation, enhancing personalization
- **Semantic Mapping**: Colors map to components for adaptive and personalized palettes

#### Typography Scale
- **Display**: XL, Large, Medium, Small (e.g., Display XL = H1, weight 800, 100% line height)
- **Headline**: XL, Large, Medium, Small
- **Body**: Large, Medium, Small
- **Label**: Large, Medium, Small
- **Geometric Clarity**: Structured type scale ensuring clear hierarchy and readability

#### Spacing System
- **4dp/8dp Increment System**: Maintains consistency with native components
- Use 4dp or 8dp increments for margins, paddings, and spacing between UI elements
- Ensures uniformity across different screen sizes and devices

#### Elevation System
- **Elevation Levels**: 0dp to 12dp (Level 0 = 0dp, Level 1 = 1dp, up to Level 5 = 12dp)
- **Dual Approach**: Both tonal color overlays and shadow elevations
- **Depth Perception**: Enhances visual hierarchy within the interface
- Each level corresponds to specific shadow configurations

### Component Patterns

#### Buttons
- Various button variants with ripple effects
- Multiple states (default, hover, pressed, disabled)
- Accessibility features built-in

#### Form Elements
- **Checkbox**: Compliant with indeterminate state support
- **Menu**: Dropdown system with nested submenus, keyboard navigation, ARIA attributes
- **Slider**: Touch and keyboard accessible range input with discrete steps, custom thumb control

#### Design Focus
- Performance and memory efficiency
- Code reusability
- Accessibility compliance
- Adaptive and responsive components

### Implementation Notes

- Components should be more responsive and scalable
- Align with accessibility standards
- Support dynamic color theming where applicable
- Use 4dp/8dp spacing increments
- Apply appropriate elevation levels for depth and hierarchy

## Design Principles

- Clean, functional, organized aesthetic
- Consistent visual hierarchy
- Modular component structure
- Strong emphasis on consistency through well-defined components
- Lo-fi prototypes acceptable, but should maintain resemblance to app foundations
- **Follow Material Design 3 guidelines** for structure, spacing, elevation, and component patterns

## Notes

- Prototypes should be lo-fi but maintain visual resemblance to the app
- Sidebar is critical and should always be included/mimicked
- All icons must come from Phosphor Icons
- Design system provides foundation for colors, fonts, logos, buttons, etc.
- **All prototypes should follow Material Design 3 (M3) guidelines** for spacing (4dp/8dp increments), elevation, typography scale, and component patterns
