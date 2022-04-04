export interface Skill {
  name: string;
  levelName: string;
  level: string;
  credits: number;
  maxCredits: number;
  type: string;
  badgeName: string;
  badgeUrl: string;
  badgeState: string;
}

export interface InstanceBadge {
  badgeName: string;
  badgeUrl: string;
  badgeState: string;
}

export interface CardBgStyle {
  backgroundImage?: string;
  backgroundSize?: string;
  backgroundRepeat?: string;
  backgroundPosition?: string;
  background?: string;
}

export interface AccountActiveFields {
  fields: Field[];
}

interface Field {
  name: string;
  allowedValues: string[];
  isMultiValue: boolean;
}
