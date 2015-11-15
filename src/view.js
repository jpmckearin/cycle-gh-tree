import { h } from '@cycle/dom';
import Rx from 'rx';
import reposSettingView from './views/repos-setting-view';

function renderTokenForm(state) {
  const { settings, token } = state;
  const currentToken = settings && settings.token ? settings.token : '';
  return h('div', [
    h('input.token', { value: token.value }),
    h('button.save-token', ['save token']),
    h('span.token', [
      currentToken.replace(/^(.*)(.{4})$/, (_, p1, p2) => {
        const masked = new Array(p1.length + 1).join('*');
        const opened = p2;
        return masked + opened;
      })
    ])
  ]);
}

function renderIssueTree(state) {
  const { issues } = state;
  return h('ul', issues.map(({ user, repo, url, title, number, children }) => {
    return h('li', [
      h('a', { href: url }, [`${user}/${repo}#${number}`]),
      ' ',
      title,
      children.length === 0 ? null : h('ul', children.map(i => {
        const { user, repo, url, title, number } = i;
        return h('li', [
          h('a', { href: url }, [`${user}/${repo}#${number}`]),
          ' ',
          title
        ]);
      }))
    ]);
  }));
}

function renderSettingsView(state) {
  return h('section#settings', [
    h('h1', ['Settings']),
    h('div', [
      h('h1', ['Token']),
      renderTokenForm(state)
    ]),
    reposSettingView(state)
  ]);
}

function renderIssuesView(state) {
  return h('section#issues', [
    h('h1', ['Issues']),
    h('button.fetch', ['fetch']),
    renderIssueTree(state)
  ]);
}

export default function(state$) {
  const vtree$ = state$
  .map(state => {
    return h('div', [
      h('h1', ['cycle-gh-tree']),
      h('nav', [
        h('ul', ['settings', 'issues'].map(i => {
            const klass = (state.currentTab === i ? '.active' : '');
            return h('li' + klass, [
              h('a', { href: '#' + i }, [
                i.replace(/^(.)/, j => j.toUpperCase())
              ])
            ]);
        }))
      ]),
      state.currentTab === 'settings'
        ? renderSettingsView(state)
        : renderIssuesView(state)
    ])
  });
  const request$ = state$
  .flatMap(({ requests }) => Rx.Observable.from(requests));
  const data$ = state$
  .map(({ settings }) => settings);
  const requests = {
    DOM: vtree$,
    HTTP: request$,
    Storage: data$
  };
  return requests;
}
