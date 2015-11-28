import Rx from 'rx';
import issues from './transforms/issues';
import labels from './transforms/labels';
import repos from './transforms/repos';
import requests from './transforms/requests';
import token from './transforms/token';
import assign from './utils/assign';

function initializeLabels() {
  return { labels: [] };
}

function initializeRepos() {
  return {
    // TODO: settings.repos: []
    settings: null,
    repo: {
      repo: null,
      user: null
    }
  };
}

function initializeRequests() {
  return { requests: [] };
}

function initializeToken() {
  return {
    // TODO: settings.token: 'xxx'
    settings: null,
    token: {
      value: ''
    }
  };
}

export default function(actions) {
  const { loadSettings$, switchTab$ } = actions;
  const state = assign(
    {
      currentTab: "settings",
      filters: [
        // FIXME: dummy values
        { type: 'label', name: 'bug' },
        { type: 'label', name: 'ready' }
      ],
      issues: []
    },
    initializeLabels(),
    initializeRepos(),
    initializeRequests(),
    initializeToken()
  );
  const reposMaxLength = 10;
  const actions$ = Rx.Observable.merge(
    loadSettings$
      .map(storage => state => {
        state.settings = storage;
        return state;
      }),
    switchTab$
      .map(value => state => {
        state.currentTab = value;
        return state
      }),
    issues(actions),
    labels(actions),
    repos(actions, { reposMaxLength }),
    requests(actions),
    token(actions)
  );
  const state$ = Rx.Observable
    .just(state)
    .merge(actions$)
    .scan((state, action) => action(state))
    .shareReplay(1);
  return state$;
}
