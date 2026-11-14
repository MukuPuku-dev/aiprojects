export const FLOW_URL = 'https://labs.google/fx/tools/flow';

// All Google Flow UI selectors live here. If Flow changes its UI, update this file only.
export const SELECTORS = {
  pageUrl: /flow\.google\.com|labs\.google\/fx\/tools\/flow/i,
  settingsTrigger: 'button[aria-label="Settings trigger"]',
  modelFamilyButton: 'button[aria-label="Select model family"]',
  modelMenuItem: /* exact start of the menu label, e.g. "Omni 1.1 Flash" */ name => new RegExp('^' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
  promptBox: '[aria-label="What do you want to create?"]',
  submitButton: 'button[aria-label="Start generation"]',
  videoModeRadio: /Video$/,
  aspectRadio: aspect => new RegExp(aspect + '$'),
  durationRadio: duration => new RegExp('^' + duration + '$'),
  singleRadio: /^x1$/,
  resultVideo: 'video'
};
