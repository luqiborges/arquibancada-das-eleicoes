# Orientações para agentes

Estas orientações se aplicam ao repositório inteiro. Instruções explícitas do responsável pelo projeto têm precedência sobre as convenções abaixo.

## Comece aqui

Leia o [README](README.md) para entender o produto, a [arquitetura](docs/arquitetura.md) para localizar o código e o [guia de contribuição](CONTRIBUTING.md) para validar alterações. Consulte os arquivos citados antes de assumir que a implementação continua igual à documentação.

O projeto se chama **Arquibancada das Eleições**; o pacote npm é `arquibancada-das-eleicoes`. A interface e a comunicação com o usuário são em português brasileiro. O tom é descontraído, mas os números e os estados eleitorais precisam ser precisos.

## Preserve as decisões do produto

- `/` é a página oficial das arquibancadas 3D; `/papo-serio` apresenta os resultados numéricos. Mantenha os aliases antigos definidos em `src/app/routes.ts` funcionando.
- A comemoração depende do indicador oficial de eleito do TSE. Liderança e percentual de apuração não autorizam inferir um vencedor.
- Resultados ausentes não são resultados zerados. Não use os votos históricos de `FIRST_ROUND` como votos ao vivo.
- A consulta automática usa o intervalo compartilhado de 5 segundos. Não reintroduza controles de pausa, atualização manual ou simulações na interface sem uma solicitação para isso.
- A entrada de pessoas é decorativa e para em 100% das seções. Preserve os portões, a escala fixa de votos e a preferência por movimento reduzido.
- A identidade oficial parte de Papel e tinta e da logo fornecida. Lula usa vermelho e Flávio usa verde. A rota `/cores` é uma prévia isolada, com dados reais.

## Ao alterar código

Mantenha regras puras em `domain`, consultas em `services` e `hooks`, componentes compartilhados em `components` e a cena 3D em `features/grandstands`. Evite dependências novas quando o código existente resolver a tarefa. Não edite o build em `dist/` nem versione caches e capturas de tela.

Siga os comandos e os cenários de validação do [CONTRIBUTING](CONTRIBUTING.md). Para mudanças só em documentação, confira links, caminhos e comandos; não é necessário recompilar a aplicação. Relate o que foi alterado, o que foi verificado e qualquer verificação que não pôde ser feita. Não apresente uma inspeção manual como teste automatizado.

Atualize a documentação quando mudar rotas, estrutura, comandos, fonte de dados ou comportamento do produto. Registre o estado final do projeto, sem transformar estes arquivos em um histórico de conversa.
