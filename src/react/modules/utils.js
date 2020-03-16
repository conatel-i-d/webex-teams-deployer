import startCase from 'lodash/startCase';
import camelCase from 'lodash/camelCase';

export function titleCase(str) {
  return startCase(camelCase(str));
}