import type {
  Role,
  SurvivalStatus,
  TreeStatus,
  VerificationStatus,
} from "./constants";

export interface Profile {
  id: string;
  full_name: string;
  role: Role;
  avatar_url: string | null;
  bio: string | null;
  country: string | null;
  region: string | null;
  planter_verified: boolean;
  planter_rating: number;
  planter_completed: number;
  onboarding_done: boolean;
  created_at: string;
}

export interface Species {
  id: number;
  slug: string;
  name: string;
  scientific_name: string;
  description: string;
  image_url: string;
  suitable_regions: string[];
  care_notes: string | null;
  planting_cost: number;
  verification_fee: number;
  planter_payout: number;
  availability: boolean;
  emoji: string;
  native_to: string | null;
}

export interface TreeRecord {
  id: string;
  tree_id: string;
  species_id: number | null;
  species_name: string;
  species_emoji: string | null;
  species_image: string | null;
  sponsor_id: string;
  planter_id: string | null;
  custom_name: string | null;
  dedication: string | null;
  region: string;
  location_label: string | null;
  lat: number | null;
  lng: number | null;
  planted_at: string | null;
  status: TreeStatus;
  survival_status: SurvivalStatus | null;
  created_at: string;
  verified_at: string | null;
}

export interface PlantingMission {
  id: string;
  mission_label: string | null;
  tree_id: string;
  planter_id: string | null;
  payout: number;
  status: TreeStatus;
  deadline: string | null;
  estimated_time: string | null;
  created_at: string;
  trees: Pick<
    TreeRecord,
    | "tree_id"
    | "species_name"
    | "species_emoji"
    | "species_image"
    | "custom_name"
    | "region"
    | "location_label"
    | "lat"
    | "lng"
  > | null;
}

export interface Proof {
  id: string;
  tree_id: string;
  mission_id: string | null;
  photo_url: string | null;
  video_url: string | null;
  lat: number | null;
  lng: number | null;
  location_data: Record<string, unknown> | null;
  location_label: string | null;
  description: string;
  submitted_at: string | null;
  verification_status: VerificationStatus;
  admin_note: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
}

export interface GrowthUpdate {
  id: string;
  tree_id: string;
  day_label: string | null;
  photo_url: string | null;
  status: string | null;
  notes: string | null;
  date: string | null;
}

export interface Payment {
  id: string;
  user_id: string;
  tree_id: string | null;
  amount: number;
  description: string | null;
  status: string;
  provider: string;
  provider_txn_id: string | null;
  created_at: string;
}

export interface Achievement {
  id: string;
  user_id: string;
  code: string;
  name: string;
  description: string | null;
  unlocked_at: string;
}

export interface ActivityItem {
  id: string;
  user_id: string;
  type: string;
  message: string;
  meta: Record<string, unknown> | null;
  created_at: string;
}

export interface VerificationQueueRow {
  tree_id: string;
  species_name: string;
  sponsor_name: string;
  planter_name: string;
  region: string;
  may_photo: string | null;
  may_video: string | null;
  location_ok: boolean;
  submitted_at: string | null;
  status: TreeStatus;
  mission_id: string | null;
}