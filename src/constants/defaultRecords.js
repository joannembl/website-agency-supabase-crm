import { DEFAULT_DEMO_STATUS } from './demoStatus'
import { DEFAULT_PIPELINE_STAGE } from './pipelineStages'
import { DEFAULT_LEAD_PRIORITY } from './priorities'

export const blankDemo = {
  demo_url: '',
  live_url: '',
  github_repo: '',
  hosting_provider: 'Netlify',
  demo_status: DEFAULT_DEMO_STATUS,
  deploy_status: '',
  preview_note: '',
  feedback: ''
}

export const blankLead = {
  business_name: '',
  instagram_handle: '',
  category: 'Mobile Detailing',
  city: 'Phoenix',
  followers: '',
  website_status: 'Needs verification',
  website_url: '',
  email: '',
  phone: '',
  google_rating: '',
  google_reviews: '',
  priority: DEFAULT_LEAD_PRIORITY,
  status: DEFAULT_PIPELINE_STAGE,
  next_follow_up_date: '',
  follow_up_type: 'DM',
  follow_up_note: '',
  last_contacted_at: '',
  notes: ''
}
