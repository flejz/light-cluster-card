export const getEntityName = (e) => {
  return (e.attributes && e.attributes.friendly_name) || e.entity_id;
}

export const getEntityByName = (states, name) => {
  return Object
    .values(states)
    .find(e => getEntityName(e) === name);
}

export const getEntityById = (states, eid) => {
  return states[eid];
}
