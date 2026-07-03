# Barrel Exports

Feature folders now expose public APIs through `index.js` files.

Prefer:

```js
import { LeadBoard, leadService } from './features/leads'
import { TasksView, taskService } from './features/tasks'
```

Avoid importing deep implementation files unless the file is intentionally private to that feature.
