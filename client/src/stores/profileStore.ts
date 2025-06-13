import { create } from 'zustand';

interface Profile {
  id: string;
  name: string;
  demographics?: any;
  spirituality?: any;
  therapy_goals?: any;
  preferences?: any;
  health?: any;
  mental_health_screening?: any;
  sensitive_topics?: any;
  personal_details?: any;
  intake_completed?: boolean;
}

interface ProfileStore {
  profile: Profile | null;
  setProfile: (profile: Profile | null) => void;
  updateProfile: (updates: Partial<Profile>) => void;
}

export const useProfileStore = create<ProfileStore>((set) => ({
  profile: null,
  setProfile: (profile) => set({ profile }),
  updateProfile: (updates) =>
    set((state) => ({
      profile: state.profile ? { ...state.profile, ...updates } : null,
    })),
}));