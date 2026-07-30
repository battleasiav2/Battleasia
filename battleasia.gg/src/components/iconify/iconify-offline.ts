import { addCollection } from '@iconify/react/offline';
import type { IconifyJSON } from '@iconify/types';

import iconBundle from './iconify-bundle.generated.json';

// ----------------------------------------------------------------------

let registered = false;

/** Bundle Iconify sets locally so icons work when api.iconify.design is blocked on hosting. */
export function registerOfflineIcons() {
  if (registered) {
    return;
  }

  registered = true;

  for (const collection of iconBundle as unknown as IconifyJSON[]) {
    addCollection(collection);
  }
}

registerOfflineIcons();
