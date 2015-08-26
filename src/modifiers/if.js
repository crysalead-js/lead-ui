import _ from "../util";

function _if(expression, properties) {
  if (_.isFunction(expression)) {
    expression = expression(properties.data ? properties.data.scope : {});
  }
  return expression === "true" ? [properties] : [];
}

export default _if;