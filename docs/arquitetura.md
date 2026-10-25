# Arquitetura e manutenção

O mapa de pastas e os comportamentos do produto estão no [README](../README.md). Este documento explica como as partes se conectam e onde fazer alterações.

## Entrada e navegação

`src/main.tsx` monta o React e carrega os estilos globais e o tema. `src/app/App.tsx` aplica a paleta oficial e carrega as páginas sob demanda com `lazy` e `Suspense`.

O roteamento é feito pelo pathname, sem biblioteca de rotas. `src/app/routes.ts` normaliza a barra final e aceita somente as rotas da tabela abaixo; endereços antigos ou desconhecidos redirecionam para `/` com `replaceState`, preservando parâmetros e hash, sem lista de aliases. Nas páginas oficiais, `App` mantém `SiteHeader` fora do `Suspense` e intercepta cliques simples nos links do cabeçalho para navegar com `pushState` e estado React, sem recarregar o documento. O evento `popstate` sincroniza voltar e avançar. Cliques modificados mantêm o comportamento nativo dos links. `PageLoading` mostra blocos decorativos e um status acessível enquanto o módulo da página carrega; movimento reduzido desativa a pulsação. As páginas recebem `showHeader={false}` na composição oficial e mantêm seu cabeçalho próprio na prévia de cores. O retorno à raiz monta as arquibancadas e seleciona sua aba no cabeçalho.

| Endereço | Página | Responsabilidade |
| --- | --- | --- |
| `/` | `GrandstandsPage` | Resultado nacional representado pelas arenas e controles compartilhados de câmera |
| `/papo-serio` | `SeriousPage` | Placar nacional ou estadual, resumo de votos e filtros de UFs |
| `/cores` | `ColorPreviewPage` | Prévia de paleta e de página, persistida nos parâmetros da URL |

A hospedagem precisa responder com `index.html` também nas rotas internas.

## Fluxo dos dados

```text
Arquivos públicos do TSE
  -> services/tse.ts: URL, fetch, validação e normalização
  -> hooks/useLiveResult.ts: resultado nacional
     hooks/useStateResults.ts: resultados das 27 UFs
  -> páginas e componentes
  -> regras de ocupação / cena em Canvas
```

`src/domain/election/types.ts` define `Candidate` e `Result`; os formatos brutos do TSE ficam no serviço. O parser verifica eleição, turno, abrangência e cargo antes de entregar um resultado à interface. A lista de UFs vem de `src/data/states.ts`.

Os hooks guardam dados, erros e horário da última resposta bem-sucedida. Mantêm o resultado anterior em caso de falha e evitam sobrepor ciclos em andamento. Cada página monta seus próprios hooks; não existe cache global de resultados ou conexão push.

O intervalo de 5 segundos é uma cadência de consulta, não uma garantia de publicação ou de respostas simultâneas. Estados são consultados em lotes de quatro e podem ter horários diferentes do Brasil. O ciclo nacional tem timeout de 20 segundos; o estadual, de 25. Consultas periódicas não iniciam com a aba oculta; a nacional também consulta ao voltar à aba. Requisições já iniciadas podem terminar com a aba oculta.

## Regras eleitorais e cena

| Arquivo | Responsabilidade |
| --- | --- |
| `src/domain/election/start.ts` | Horário explícito de Brasília para abrir os portões |
| `src/domain/election/winner.ts` | Escolher exatamente um candidato oficialmente eleito |
| `src/features/grandstands/scale.ts` | Referência histórica, capacidade e conversão de votos em assentos |
| `src/features/grandstands/scene/geometry.ts` | Geometria do estádio, câmera e projeção 3D |
| `src/features/grandstands/scene/entrance.ts` | Estrada, portões e pessoas entrando |
| `src/features/grandstands/scene/environment.ts` | Elementos decorativos do entorno |
| `src/features/grandstands/scene/trophy.ts` | Geometria e duração da comemoração |
| `src/features/grandstands/components/StadiumScene3D.tsx` | Canvas, desenho, interação e ciclo de animação |
| `src/features/grandstands/components/CelebratingStadium.tsx` | Avanço e encerramento da comemoração |

A cena usa projeção de geometria tridimensional em Canvas 2D, sem Three.js ou modelos externos. As funções de geometria e ocupação são testáveis sem React. Os imports de execução entre módulos testados usam extensão `.ts` para funcionar diretamente no Node.

`GrandstandsPage` mantém a câmera compartilhada. O zoom inicial e o botão de restaurar usam `1.15`, que corresponde a 75% da faixa do slider (`0.7` a `1.3`). Esse percentual não deve ser confundido com um fator de escala de `0.75`.

As duas arenas representam os candidatos cadastrados em `FIRST_ROUND`. Antes dos dados oficiais, essa referência fornece identidade e foto; os votos históricos não preenchem assentos. Adaptar o projeto para outra eleição exige revisar essas referências, o parser, as URLs, a data de abertura e os testes.

## Componentes e estilos

`SiteHeader`, `SiteFooter`, `Brand`, `BrazilFlag`, `LastChecked`, `CandidateAvatar` e `DataSourceBanner` são compartilhados pelas páginas. Prefira alterar esses componentes a duplicar cabeçalho, rodapé ou avisos.

Os estilos comuns ficam em `src/styles/global.css`, os de cada página junto dela e os da cena em `features/grandstands/styles`. As abas em cápsula do cabeçalho são compartilhadas e estilizadas em `src/theme/theme.css`, com cores das variáveis da paleta e navegação abaixo da logo no mobile. A paleta e o contexto ficam em `src/theme/palettes.ts`; `theme.css` aplica as variáveis ao site. `ColorPreviewPage` fornece um contexto e variáveis próprios para a prévia, sem salvar uma preferência global.

O CSS é global e ainda contém regras e sobrescritas acumuladas durante os ajustes visuais. A ordem dos imports e a especificidade importam: teste as duas páginas e a prévia ao alterar seletores compartilhados. Preserve os 14px dos textos de apoio, o alinhamento do cabeçalho com o conteúdo e o comportamento mobile do horário de atualização.

## Limites atuais

O app é inteiramente frontend: não há backend, banco de dados, autenticação, proxy ou armazenamento persistente de resultados. O acesso depende da disponibilidade e das permissões CORS dos arquivos públicos do TSE. Um horário recente na interface informa uma consulta bem-sucedida; não significa que o arquivo recebido tenha acabado de ser publicado.

Os testes automatizados cobrem parsing, regras eleitorais, ocupação e geometria. A validação visual e de interação continua manual; não há suíte de navegador instalada neste repositório. Veja os cenários no [guia de contribuição](../CONTRIBUTING.md).
