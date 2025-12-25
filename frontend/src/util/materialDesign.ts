// Copyright 2025 LiveSite authors
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * Initializes bootstrap-material-design on the given element.
 * Polls for the library and its dependencies (Popper.js) to be available if not yet loaded.
 */
export function initializeBootstrapMaterialDesign(
  element: HTMLElement | string
): void {
  function tryInitialize() {
    // Check if jQuery, Popper.js, and bootstrapMaterialDesign are all loaded
    // Popper.js is required by Bootstrap for dropdown functionality
    if (
      typeof $ !== 'undefined' &&
      ($ as any).fn &&
      ($ as any).fn.bootstrapMaterialDesign &&
      typeof (window as any).Popper !== 'undefined'
    ) {
      ($ as any)(element).bootstrapMaterialDesign();
    } else {
      // Poll for the library and its dependencies to be available
      setTimeout(tryInitialize, 50);
    }
  }
  tryInitialize();
}
