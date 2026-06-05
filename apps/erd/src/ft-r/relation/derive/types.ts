export interface DerivedRelationEndpoint {
  entityId: string
  fieldId: string
}

export interface DerivedRelation {
  id: string
  source: DerivedRelationEndpoint
  target: DerivedRelationEndpoint
}
