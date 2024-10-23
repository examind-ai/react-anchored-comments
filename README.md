# react-mdnotes

A headless React component library for Google Docs-style commenting and text highlighting. Provides precise positioning logic and text highlighting capabilities while leaving the UI implementation to the consumer.

## Features

- 📝 Google Docs-style commenting system
- 🎯 Precise text selection and highlighting
- 🎨 UI agnostic - bring your own components
- 📦 Lightweight and tree-shakeable
- 💪 Written in TypeScript
- ⚡ Framework agnostic positioning logic

## Installation

```bash
npm install react-mdnotes

# or

yarn add react-mdnotes

# or

pnpm add react-mdnotes
```

## Quick Start

```tsx
import {
  CommentableContainer,
  CommentableSection,
  CommentsSection,
} from 'react-mdnotes';

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
  createCommentsContext,
} from 'react-mdnotes';

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
} from 'react-mdnotes';
```

## Development

This project uses pnpm workspaces with a monorepo structure:

```
react-mdnotes/
├── packages/
│ └── core/ # Main library code
└── demo/ # Demo application
```

### Setup

```bash

# Install dependencies

pnpm install

# Build core library

pnpm build

# Run development environment

pnpm dev
```

### Scripts

- `pnpm build` - Build the core library
- `pnpm dev` - Run both core (watch mode) and demo
- `pnpm dev:core` - Run core in watch mode
- `pnpm dev:demo` - Run demo application

### Link

To test the library in a local project, you can use `pnpm link`:

```bash
cd packages/core
pnpm build  # Build your plugin first
pnpm link --global
npm link    # Creates an npm link from the pnpm global link
```

In the other project:

```bash
npm link react-mdnotes
```

### Unlink

To unlink the library:

```bash
cd packages/core
pnpm unlink --global
npm unlink
```

In the other project:

```bash
npm unlink react-mdnotes
```

## Contributing

Contributions are welcome!

## License

MIT © EXAMIND
