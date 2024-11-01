# @examind/react-anchored-comments

A headless React component library for Google Docs-style commenting and markdown highlighting. Provides precise positioning logic and markdown highlighting capabilities while leaving the UI implementation to the consumer.

## Features

- 📝 Google Docs-style commenting system
- 🎯 Precise text selection and highlighting
- 🎨 UI agnostic - bring your own components
- 📦 Lightweight and tree-shakeable
- 💪 Written in TypeScript
- ⚡ Framework agnostic positioning logic

## Installation

```bash
npm install @examind/react-anchored-comments

# or

yarn add @examind/react-anchored-comments

# or

pnpm add @examind/react-anchored-comments
```

## Quick Start

```tsx
import {
  CommentableContainer,
  CommentableSection,
  CommentsSection,
} from '@examind/react-anchored-comments';

function App() {
  return (
    <CommentableContainer>
      <CommentableSection>
        <div>
          Your markdown content goes here. Users can select text and
          add comments to any part of it.
        </div>
      </CommentableSection>
      <CommentsSection />
    </CommentableContainer>
  );
}
```

## Core Components

### CommentableContainer

Root component that provides commenting context and manages state.

### CommentableSection

Wrapper for content that can be commented on. Handles text selection and highlighting.

### CommentsSection

Container for rendering comments. You can provide your own comment rendering components.

### NewCommentTrigger

Optional component for triggering new comment creation UI.

## API Reference

### Contexts

```tsx
import {
  useCommentPosition,
  useSelection,
  createCommentContext,
} from '@examind/react-anchored-comments';

// Get current comment positions
const { positions } = useCommentPosition();

// Access current text selection
const { selection } = useSelection();
```

### Types

```tsx
import type {
  CommentPosition,
  Comment,
  Selection,
} from '@examind/react-anchored-comments';
```

## Development

This project uses npm workspaces with a monorepo structure:

```
react-anchored-comments/
├── packages/
│ └── core/ # Main library code
└── demo/ # Demo application
```

### Setup

```bash

# Install dependencies
npm install

# Build core library
npm run build

# Run development environment
npm run dev
```

### Scripts

- `npm run build` - Build the core library
- `npm run dev` - Run both core (watch mode) and demo
- `npm run dev:core` - Run core in watch mode
- `npm run dev:demo` - Run demo application

### Link

To test the library in a local project, you can use `pnpm link`:

```bash
# In the plugin directory (packages/core)
cd packages/core
npm run build  # Build your plugin first
npm link

# In your other project
npm link @examind/react-anchored-comments
```

### Unlink

To unlink the library:

```bash
# In your other project
npm unlink @examind/react-anchored-comments

# In the plugin directory
npm unlink
```

## Contributing

Contributions are welcome!

## License

MIT © EXAMIND
