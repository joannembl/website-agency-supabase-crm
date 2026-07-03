export * from './pipelineStages'
export * from './demoStatus'
export * from './roles'
export * from './priorities'
export * from './notifications'
export * from './leadOptions'
export * from './defaultRecords'

// Backwards-compatible aliases while the app migrates to uppercase constants.
export { PIPELINE_STAGES as pipelineStages } from './pipelineStages'
export { DEMO_STATUSES as demoStatuses } from './demoStatus'
export { LEAD_PRIORITIES as priorities } from './priorities'
export { LEAD_CATEGORIES as leadCategories, WEBSITE_STATUSES as websiteStatuses, FOLLOW_UP_TYPES as followUpTypes } from './leadOptions'
