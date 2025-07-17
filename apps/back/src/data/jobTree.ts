import { AffiliationEn, JobEn } from '@maple/types';

type Meta = {
  affiliation?: AffiliationEn;
  jobCategory?: JobEn;
};

const a: Meta = {
  affiliation: 'adventurer',
  jobCategory: 'warrior',
};
