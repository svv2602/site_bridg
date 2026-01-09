import type { Schema, Attribute } from '@strapi/strapi';

export interface TyreUsage extends Schema.Component {
  collectionName: 'components_tyre_usages';
  info: {
    displayName: 'Tyre Usage';
    description: 'Recommended usage conditions';
  };
  attributes: {
    city: Attribute.Boolean & Attribute.DefaultTo<false>;
    highway: Attribute.Boolean & Attribute.DefaultTo<false>;
    offroad: Attribute.Boolean & Attribute.DefaultTo<false>;
    winter: Attribute.Boolean & Attribute.DefaultTo<false>;
  };
}

export interface TyreSize extends Schema.Component {
  collectionName: 'components_tyre_sizes';
  info: {
    displayName: 'Tyre Size';
    description: 'Tyre size specification';
  };
  attributes: {
    width: Attribute.Integer &
      Attribute.Required &
      Attribute.SetMinMax<
        {
          min: 125;
          max: 355;
        },
        number
      >;
    aspectRatio: Attribute.Integer &
      Attribute.Required &
      Attribute.SetMinMax<
        {
          min: 25;
          max: 85;
        },
        number
      >;
    diameter: Attribute.Integer &
      Attribute.Required &
      Attribute.SetMinMax<
        {
          min: 13;
          max: 24;
        },
        number
      >;
    loadIndex: Attribute.Integer &
      Attribute.SetMinMax<
        {
          min: 60;
          max: 130;
        },
        number
      >;
    speedIndex: Attribute.String &
      Attribute.SetMinMaxLength<{
        maxLength: 2;
      }>;
  };
}

export interface TyreEuLabel extends Schema.Component {
  collectionName: 'components_tyre_eu_labels';
  info: {
    displayName: 'EU Label';
    description: 'EU tyre label ratings';
  };
  attributes: {
    wetGrip: Attribute.Enumeration<['A', 'B', 'C', 'D', 'E']>;
    fuelEfficiency: Attribute.Enumeration<['A', 'B', 'C', 'D', 'E']>;
    noiseDb: Attribute.Integer &
      Attribute.SetMinMax<
        {
          min: 60;
          max: 80;
        },
        number
      >;
  };
}

export interface AwardBadge extends Schema.Component {
  collectionName: 'components_award_badges';
  info: {
    displayName: 'Badge';
    icon: 'trophy';
    description: 'Award badge from tire tests (ADAC, Auto Bild, etc.)';
  };
  attributes: {
    type: Attribute.Enumeration<
      ['winner', 'recommended', 'top3', 'best_category', 'eco']
    > &
      Attribute.Required;
    source: Attribute.Enumeration<
      ['adac', 'autobild', 'tyrereviews', 'tcs', 'eu_label']
    > &
      Attribute.Required;
    year: Attribute.Integer &
      Attribute.Required &
      Attribute.SetMinMax<
        {
          min: 2020;
          max: 2030;
        },
        number
      >;
    testType: Attribute.Enumeration<['summer', 'winter', 'allseason']> &
      Attribute.Required;
    label: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        maxLength: 100;
      }>;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface Components {
      'tyre.usage': TyreUsage;
      'tyre.size': TyreSize;
      'tyre.eu-label': TyreEuLabel;
      'award.badge': AwardBadge;
    }
  }
}
