function path(root: string, sublink: string) {
  return `${root}${sublink}`;
}

const ROOTS_DASHBOARD = '/';

export const PATH_DASHBOARD = {
  root: ROOTS_DASHBOARD,
  users: path(ROOTS_DASHBOARD, 'users'),
  sessions: path(ROOTS_DASHBOARD, 'sessions'),
}; 