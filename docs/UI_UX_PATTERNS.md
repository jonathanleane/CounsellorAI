# UI/UX Patterns and Design System

## Design Philosophy

The AI Therapist UI follows these principles:
1. **Calming and Professional**: Soft colors, clean layout
2. **Accessibility First**: Clear hierarchy, readable fonts
3. **Minimal Cognitive Load**: Simple navigation, focused interfaces
4. **Trust Building**: Transparency in AI operations

## Component Architecture

### Layout Components

#### Header (`Header.js`)
- Fixed navigation bar
- App title and navigation links
- Consistent across all pages

#### Page Container
- Standard container with padding
- Max-width constraint for readability
- Responsive design

### Core Components

#### ChatMessage (`ChatMessage.js`)
- **Visual Differentiation**: User vs AI messages
- **Metadata Display**: Timestamp, sender name
- **Thinking State**: Animated dots for AI processing
- **Styling**: 
  - User messages: Right-aligned, primary color
  - AI messages: Left-aligned, secondary color
  - System messages: Centered, muted style

#### MoodRating (`MoodRating.js`)
- **Interactive Scale**: 1-10 visual rating
- **Emoji Indicators**: Visual mood representation
- **Hover States**: Clear interaction feedback

### Page Patterns

#### Dashboard
- **Card-based Layout**: Recent sessions as cards
- **Quick Actions**: Prominent CTA buttons
- **Status Indicators**: Visual session states
- **Empty States**: Helpful guidance for new users

#### Conversation
- **Chat Interface**: Familiar messaging pattern
- **Fixed Input**: Bottom-anchored message input
- **Auto-scroll**: Smooth scroll to latest message
- **Session Controls**: End session, debug mode

#### Profile/Onboarding
- **Multi-step Form**: Progress indicator
- **Field Grouping**: Logical sections
- **Optional Fields**: Clear marking
- **Validation Feedback**: Inline error messages

#### History
- **List View**: Chronological sessions
- **Summary Preview**: Key information visible
- **Filtering**: (Planned) Date, type, status filters
- **Pagination**: (Planned) Load more pattern

#### Therapist's Brain
- **Accordion Pattern**: Collapsible categories
- **Inline Editing**: Click-to-edit fields
- **Visual Hierarchy**: Category → Field → Value
- **Save Confirmation**: Success messages

## Visual Design System

### Colors
```css
--primary: #4a90e2 (Blue)
--secondary: #7b68ee (Purple)
--success: #5cb85c (Green)
--warning: #f0ad4e (Orange)
--danger: #d9534f (Red)
--light: #f8f9fa (Light gray)
--dark: #343a40 (Dark gray)
```

### Typography
- **Font Family**: System fonts for performance
- **Heading Sizes**: Consistent scale (h1-h6)
- **Body Text**: 16px base, 1.5 line height
- **Monospace**: Code and debug information

### Spacing
- **Base Unit**: 8px grid system
- **Component Padding**: 16px standard
- **Section Margins**: 24px between sections
- **Card Spacing**: 16px internal, 24px external

### Interactive Elements

#### Buttons
- **Primary**: Blue background, white text
- **Secondary**: Outlined style
- **Danger**: Red for destructive actions
- **States**: Hover, active, disabled

#### Forms
- **Input Fields**: Full-width, clear labels
- **Textareas**: Auto-resize capability
- **Select Dropdowns**: Native styling
- **Radio/Checkbox**: Custom styling

#### Feedback
- **Loading States**: Spinners and skeletons
- **Error Messages**: Red banner/inline
- **Success Messages**: Green confirmation
- **Tooltips**: Hover information

## Responsive Design

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Mobile Adaptations
- **Navigation**: Hamburger menu (planned)
- **Chat Interface**: Full-width messages
- **Forms**: Single column layout
- **Cards**: Stack vertically

## Accessibility Features

1. **Semantic HTML**: Proper heading structure
2. **ARIA Labels**: Screen reader support
3. **Keyboard Navigation**: Tab order, focus states
4. **Color Contrast**: WCAG AA compliance
5. **Error Handling**: Clear error messages

## Animation and Transitions

### Subtle Animations
- **Page Transitions**: Fade in/out
- **Message Appearance**: Slide up
- **Loading States**: Pulsing dots
- **Hover Effects**: Smooth color changes

### Performance Considerations
- **CSS Transitions**: Hardware accelerated
- **Minimal JavaScript**: React state-based
- **Lazy Loading**: Components and images
- **Optimistic Updates**: Immediate UI feedback

## Future Enhancements

1. **Dark Mode**: Theme switching
2. **Customizable Themes**: User preferences
3. **Advanced Animations**: Micro-interactions
4. **Voice UI**: Audio feedback
5. **Mobile App**: Native components
6. **Accessibility Audit**: Full WCAG compliance