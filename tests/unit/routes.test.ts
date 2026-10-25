import test from 'node:test';
import assert from 'node:assert/strict';

import { resolveRoute } from '../../src/app/routes.ts';

test('rotas disponíveis aceitam barra final sem redirecionar', () => {
  for (const route of ['/', '/papo-serio', '/cores']) {
    for (const pathname of [route, ...(route === '/' ? [] : [`${route}/`])]) {
      assert.equal(resolveRoute({ pathname, search: '?origem=teste', hash: '#conteudo' }, {
        replaceState() { assert.fail('uma rota válida não deve redirecionar'); },
      }), route);
    }
  }
});

test('endereços antigos e desconhecidos voltam à raiz preservando parâmetros e hash', () => {
  for (const route of ['/arquibancadas', '/previa-header', '/estadios', '/estadios-3d', '/estadio-3d', '/estadios/entorno', '/estadios/trofeu', '/estadios-3d/trofeu', '/inexistente']) {
    for (const pathname of [route, `${route}/`]) {
      const redirects: unknown[][] = [];
      assert.equal(resolveRoute({ pathname, search: '?origem=teste', hash: '#conteudo' }, {
        replaceState(...args) { redirects.push(args); },
      }), '/');
      assert.deepEqual(redirects, [[null, '', '/?origem=teste#conteudo']]);
    }
  }
});
