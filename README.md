# Arquibancada das Eleições • Eleições 2026

App em React + Vite + TypeScript para acompanhar o segundo turno presidencial, com placar nacional, 27 UFs e estádios em 3D.

## Guia da documentação

- [Arquitetura](docs/arquitetura.md): fluxo dos dados, responsabilidades e pontos de manutenção.
- [Como contribuir](CONTRIBUTING.md): ambiente, convenções e validação das alterações.
- [Orientações para agentes](AGENTS.md): contexto e regras essenciais para trabalhar no repositório.

Este README descreve o funcionamento e as decisões atuais do produto. Ao alterar um comportamento, atualize a seção correspondente e os documentos técnicos afetados.

## Executar

```sh
npm install
npm run dev
```

Abra o endereço informado pelo Vite. Para compilar: `npm run build`. Para os testes: `npm test` (Node 22.18+ ou 24).

## Organização do projeto

```text
src/
  app/                    # Composição da aplicação e resolução das rotas
  assets/brand/           # Logo e arquivos visuais importados pelo Vite
  components/             # Componentes compartilhados entre páginas
  config/                 # Configurações, como o intervalo das consultas
  data/                   # Dados estáticos: UFs e regiões
  domain/election/        # Tipos e regras de eleição, sem dependência de React
  features/grandstands/   # Componentes, geometria e estilos da animação 3D
  hooks/                  # Consultas e estado reutilizável de React
  pages/                  # Arquibancadas, Papo sério e prévia de cores
  services/               # Integração, validação e normalização dos dados do TSE
  styles/                 # Estilos globais e layout compartilhado
  theme/                  # Paletas, contexto de cores e regras do tema
  main.tsx                # Inicialização do React
tests/unit/               # Testes de leitura dos dados e regras da cena
artifacts/screenshots/    # Capturas locais de validação, ignoradas pelo Git
```

Cada página tem uma pasta com seu componente e CSS. Componentes usados nas duas páginas ficam em `components`; componentes exclusivos da cena ficam em `features/grandstands/components`. A geometria está em `features/grandstands/scene`, separada da renderização em Canvas e das regras de votos.

As páginas montam a interface; `useLiveResult` consulta o Brasil e `useStateResults` consulta as UFs. Ambos usam o serviço `services/tse.ts`. Os tipos compartilhados ficam em `domain/election/types.ts`, e a lista de UFs em `data/states.ts`. Regras de domínio não devem importar páginas, componentes ou hooks.

Use PascalCase para componentes e seus arquivos, prefixo `use` para hooks e nomes descritivos para os demais módulos. Mantenha imports de bibliotecas primeiro, módulos locais depois e CSS por último. O `.editorconfig` define UTF-8, dois espaços e final de linha LF. Os imports com extensão `.ts` nos módulos executados pelos testes permitem rodá-los diretamente com Node, sem um segundo compilador.

Validações disponíveis:

```sh
npm run typecheck  # Verifica os tipos do código e dos testes
npm test           # Executa os testes unitários
npm run build      # Verifica os tipos e gera dist/ para publicação
npm run preview    # Serve o build localmente
```

`dist/`, `node_modules/`, caches e `artifacts/` são gerados localmente e não devem ser versionados.

## Dados ao vivo

As arquibancadas na página inicial `/` e o painel **Papo sério** em `/papo-serio` consultam os arquivos públicos do TSE para a eleição **6258**, cargo **0001**, segundo turno de 2026. Fonte: [documentação técnica oficial](https://www.tse.jus.br/eleicoes/informacoes-tecnicas-sobre-a-divulgacao-de-resultados).

Brasil e estados usam o intervalo de **5 segundos**, definido em `src/config/polling.ts`. As 27 UFs são consultadas em lotes de quatro; requisições anteriores em andamento não se sobrepõem às seguintes. O resultado nacional tem limite de 20 segundos por consulta, e o ciclo estadual, de 25 segundos. As consultas periódicas ficam suspensas com a aba oculta. Os estádios consultam o resultado nacional novamente ao voltar à aba.

Não há controles de pausa ou atualização manual. O app mostra **Atualizado às HH:MM:SS**, com largura estável inclusive no celular. O horário muda somente após uma resposta bem-sucedida. Falhas preservam os dados anteriores com aviso e o app tenta novamente automaticamente. A publicação de novos boletins depende do TSE.

Os candidatos, partidos, votos, fotos e a indicação de eleito vêm do TSE. Nenhum voto é preenchido artificialmente. As fotos usam o identificador `sqcand`; em caso de falha, aparecem as iniciais. O navegador precisa de acesso ao domínio do TSE e de permissão CORS no servidor. Esta versão não tem proxy de aplicação.

## Arquibancadas

A tela inicial `/` é a página oficial das arquibancadas em 3D. A aba **Papo sério**, em `/papo-serio`, contém o placar, os filtros e os resultados dos estados. Os links anteriores `/arquibancadas`, `/estadios`, `/estadios-3d` e `/estadio-3d` redirecionam para a página inicial. Há 800 assentos por candidato, cada um representando 100 mil votos: capacidade visual de 80 milhões. O total exato, os votos restantes para o próximo assento e eventuais votos além da capacidade continuam visíveis.

A escala inclui mais de 40% de folga sobre a maior votação do [boletim do primeiro turno do TSE com 99,99% totalizado](https://www.tse.jus.br/comunicacao/noticias/2026/Outubro/flavio-bolsonaro-e-lula-vao-disputar-o-2o-turno-para-a-presidencia-da-republica). Esse recorte histórico serve somente como referência da escala.

Os portões ficam fechados e as pessoas esperam antes das 17h de Brasília de 25/10/2026. A abertura considera `2026-10-25T17:00:00-03:00`, independentemente do fuso do visitante. Se o TSE já informar seções totalizadas, o dado oficial tem precedência sobre o relógio local. A caminhada decorativa para aos 100% das seções totalizadas e não altera votos ou assentos.

A comemoração com troféu e confetes depende de exatamente um candidato com o indicador nacional de eleito (`e: "s"`). Pode começar antes de 100% das seções. Dura oito segundos, mantém a taça erguida ao terminar e não reinicia nas consultas seguintes com a mesma indicação. Se o TSE retirar a indicação, a taça desaparece. Reabrir a página pode reproduzir a festa novamente.

O entorno tem árvores, canteiros, bandeirinhas, bancos, postes e quiosque. A câmera e o zoom são compartilhados entre as duas arenas. A cena usa geometria tridimensional projetada em Canvas, sem modelos externos. A preferência por movimento reduzido mantém a caminhada estática e mostra diretamente a pose final da comemoração. A aba oculta suspende o avanço das animações.

Os modos de simulação e as páginas de teste foram removidos. O antigo endereço `/previa-header` redireciona para a página inicial. Os antigos links `/estadios/trofeu`, `/estadios-3d/trofeu` e `/estadios/entorno` levam às arquibancadas ao vivo. Os testes automatizados de leitura dos dados e geometria permanecem disponíveis por `npm test`.

## Hospedagem e visual

Configure a hospedagem para servir `index.html` nas rotas da aplicação e nos aliases; o Vite já faz isso localmente. A tipografia usa Inter via Google Fonts com `display=swap` e alternativa sem serifa do sistema quando indisponível.

A identidade oficial usa a logo fornecida em `src/assets/brand/logo-arquibancada.png`, exibida pelo componente `Brand` no cabeçalho e no rodapé do painel. O visual parte de **Papel e tinta**: fundo cinza-claro `#F5F5F7`, cartões brancos e texto grafite `#353139`. O vinho `#793947`, os fundos rosés e detalhes verdes acompanham as cores da logo. Vermelho e verde continuam identificando os candidatos. O cabeçalho usa abas em cápsula sobre fundo rosé, com a página selecionada em branco, texto vinho e sombra discreta. A troca entre as abas acontece sem recarregar o documento: o cabeçalho permanece visível enquanto o conteúdo carrega, com blocos suaves de espera e suporte aos botões voltar e avançar do navegador. As abas têm fonte de 16px; no celular, a logo fica centralizada acima da navegação. A paleta oficial fica em `src/theme/palettes.ts` e as regras compartilhadas de tema em `src/theme/theme.css`.

Projeto independente, sem vínculo com a Justiça Eleitoral.

## Prévia de paletas

Abra `/cores` para experimentar **Noite de jogo**, **Papel e tinta** e **Céu de domingo**. O seletor permite ver as paletas nas arquibancadas e no painel **Papo sério**, inclusive navegando pelos links do cabeçalho dentro da prévia. Fundo, cartões, textos, destaques e o fundo do Canvas acompanham a seleção; os candidatos continuam identificados por vermelho e verde.

A seleção fica no endereço, por exemplo `/cores?paleta=noite&pagina=papo-serio`, para recarregar ou compartilhar. **Sair da prévia** volta à página inicial com o visual oficial baseado na logo. A prévia usa as mesmas consultas dos dados reais e não altera as cores das páginas oficiais nem grava preferência permanente.
