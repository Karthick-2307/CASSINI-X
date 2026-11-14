/**
 * ASTRA-X Feature Flags Configuration
 *
 * Controls visibility of experimental, secondary, or specialized modules.
 * Default is false for simplified 4-link navigation.
 */

export interface FeatureFlags {
  dashboard: boolean;
  explorer: boolean;
  analysis: boolean;
  geology: boolean;
  mission: boolean;
  assistant: boolean;
}

export const features: FeatureFlags = {
  dashboard: false,
  explorer: false,
  analysis: false,
  geology: false,
  mission: false,
  assistant: false,
};

export default features;
