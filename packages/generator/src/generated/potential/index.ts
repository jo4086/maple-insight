import additionalPotentialByPartGrade from './additional-potential-by-part-grade.json';
import potentialByPartGrade from './potential-by-part-grade.json';

type GeneratedPotentialJson = Record<string, unknown>;

export const generatedPotentialOptionTextsByPartGrade = potentialByPartGrade as unknown as GeneratedPotentialJson;
export const generatedAdditionalPotentialOptionTextsByPartGrade = additionalPotentialByPartGrade as unknown as GeneratedPotentialJson;

export const generatedPotential: Record<string, GeneratedPotentialJson> = {
  potentialByPartGrade: generatedPotentialOptionTextsByPartGrade,
  additionalPotentialByPartGrade: generatedAdditionalPotentialOptionTextsByPartGrade,
};
