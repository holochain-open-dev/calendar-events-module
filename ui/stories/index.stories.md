```js script
import { html } from '@open-wc/demoing-storybook';
import '../dist/hod-calendar-event.js';

export default {
  title: 'HodCalendarEvent',
  component: 'hod-calendar-event',
  options: { selectedPanel: "storybookjs/knobs/panel" },
};
```

# HodCalendarEvent

A component for...

## Features:

- a
- b
- ...

## How to use

### Installation

```bash
yarn add hod-calendar-event
```

```js
import 'hod-calendar-event/hod-calendar-event.js';
```

```js preview-story
export const Simple = () => html`
  <hod-calendar-event></hod-calendar-event>
`;
```

## Variations

###### Custom Title

```js preview-story
export const CustomTitle = () => html`
  <hod-calendar-event title="Hello World"></hod-calendar-event>
`;
```