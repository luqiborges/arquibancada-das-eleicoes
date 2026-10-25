# Como contribuir

Comece pelo [README](README.md) para entender o produto e pela [arquitetura](docs/arquitetura.md) para localizar a mudança. O projeto usa React, Vite e TypeScript, com npm e `package-lock.json`.

## Ambiente e comandos

Use Node 22.18+ ou Node 24 para executar os testes TypeScript diretamente. Em um checkout com lockfile, instale as dependências com `npm ci` e inicie com `npm run dev`. No PowerShell, use `npm.cmd` se a política local bloquear o script `npm.ps1`.

| Comando | Uso |
| --- | --- |
| `npm run dev` | Desenvolvimento local; use o endereço informado pelo Vite |
| `npm run typecheck` | Verificação TypeScript de `src`, testes e configuração do Vite |
| `npm test` | Testes unitários em `tests/unit/*.test.ts`, sem consultar o TSE |
| `npm run build` | Verificação de tipos e geração de `dist/` |
| `npm run preview` | Servir localmente o build já gerado |

## Convenções

Use UTF-8, dois espaços e LF, conforme `.editorconfig`. Componentes e arquivos de componentes usam PascalCase; hooks começam com `use`. Mantenha os imports de bibliotecas antes dos locais e o CSS por último, preservando a ordem dos imports de estilos.

Coloque CSS específico junto da página ou componente. Use os componentes compartilhados e as variáveis do tema para manter as páginas consistentes. Regras eleitorais puras não devem depender de React ou do DOM. Preserve as extensões `.ts` nos imports de execução usados diretamente pelos testes Node.

Ao alterar dependências ou o nome do pacote, mantenha `package.json` e `package-lock.json` consistentes. Não versione `node_modules/`, `dist/`, caches ou `artifacts/`. Não há comandos de lint ou formatação automática configurados; não os registre como verificações executadas.

## Como validar

Para mudanças na aplicação, execute `npm run typecheck`, `npm test` e `npm run build`. Ao alterar parsing, regras eleitorais ou geometria, atualize os testes com cenários que verifiquem o comportamento. Ajustes simples de texto ou CSS normalmente precisam de inspeção visual, sem testes que apenas repitam a implementação.

Confira no navegador os cenários afetados:

- Abra `/` e `/papo-serio` em desktop e celular. Confira legibilidade, cabeçalho e rodapé alinhados e ausência de rolagem horizontal.
- Nas arquibancadas, confira as duas arenas, rotação sincronizada, zoom inicial e restauração da câmera.
- No seletor de aparência, confira Automático, Claro e Escuro, teclado, persistência ao recarregar e navegar, sincronização entre abas e funcionamento sem armazenamento. A iluminação dos estádios deve continuar seguindo o horário real em qualquer preferência.
- No Papo sério, confira busca sem acentos, filtro por região, seleção nacional/estadual e área clicável inteira dos selects, incluindo a seta.
- Se alterar tema ou CSS compartilhado, confira as duas páginas às 12h, 17h30, 18h e 19h com relógio controlado no navegador; verifique contraste, logo transparente no cabeçalho e no rodapé, filtros, avisos e sincronização ao retornar à aba.
- Para alterações nos dados, confira carregamento inicial, zero votos, resultado parcial, 100%, resposta indisponível e preservação do último resultado após uma falha. O horário só deve mudar com uma resposta bem-sucedida.
- Para alterações na cena, confira portões antes e depois do horário de abertura, parada da entrada em 100%, vitória oficial antes de 100%, remoção da indicação de eleito e preferência por movimento reduzido.
- Para mudanças nas rotas, abra diretamente uma URL interna com parâmetros e hash. Confira também que endereços antigos e desconhecidos redirecionam para `/`, preservando parâmetros e hash.

Use dados controlados em testes ou interceptação local de rede para cenários difíceis de reproduzir. Não adicione votos de teste ou controles de simulação à interface pública. Registre quais verificações foram automatizadas e quais foram manuais.

Para documentação, confira os links relativos, a existência dos caminhos citados e a correspondência dos comandos com `package.json`. Atualize o README quando o comportamento do produto mudar e `docs/arquitetura.md` quando a organização ou o fluxo de dados mudar.

## Problemas comuns

| Sintoma | Onde investigar |
| --- | --- |
| Resultado indisponível | Rede do navegador, status HTTP, CORS e validações em `src/services/tse.ts`; não substitua falha por zero votos |
| Horário sem mudar | Última resposta bem-sucedida, timeout, aba oculta e consultas em andamento nos hooks |
| Rota interna falha ao recarregar em produção | Fallback da hospedagem para `index.html` |
| Foto não carrega | URL oficial, disponibilidade da imagem e fallback de iniciais em `CandidateAvatar` |
| Mudança visual afeta outra tela | Seletores globais, especificidade, imports de CSS e variáveis de tema |

Ao entregar uma alteração, descreva o resultado, os arquivos ou áreas principais e a validação realizada. Documente limitações reais e mantenha os guias alinhados ao código.
