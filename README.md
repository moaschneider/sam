# SAM – Suporte Aprenda Mais

Aplicação web que auxilia a localizar, personalizar e copiar mensagem padrão de serviço de atendimento ao cursista de uma plataforma de ensino online.

A ferramenta também permite editar e alterar localmente alguma resposta caso seja necessário.


## O que o SAM quer resolver

O atendimento ao cursista da plataforma é feito de forma individualizada, com os colaboradores acessando a caixa de e-mail e respondendo as diferentes demandas.

Apesar de ser um trabalho muito cuidadoso, também acaba sendo muito manual e repetitivo.

O SAM foi desenvolvido para tentar minimizar esse trabalho, dando mais consistência e agilidade.

## Como abrir

**Localmente**

- Iniciar um servidor local com Python
   ```bash
   python -m http.server 8080
   ```
   Acesse: **http://localhost:8080/index.html**

Ou

- No `vscode` abra o arquivo `index.html` usando o Live Server (Open With Live Server, no menu de contexto)

**Online**
 - A ferramente está experimentalmente online na Vercel

   **https://sam-delta-henna.vercel.app/**


## Fluxo de uso

1. **Dados do cursista**
   Cole no campo superior o texto no formato dos e-mails (campos como `Nome`, `Email`, `Cpf`, `Curso turma`, `Mensagem`). A aplicação interpreta os campos e pode:
   - usar o **primeiro nome** no lugar de `Caro(a) aluno(a)`;
   - preencher **assinatura** com `(escreva seu nome)` a partir do campo de assinatura;
   - abrir **Dossiê CPF** e **Dossiê E-mail** (em abas separadas) quando houver CPF/e-mail;
   - extrair **curso** e **turma** a partir de `Curso turma` (ver abaixo).

2. **Assinatura**  
   Campo salvo no navegador (`localStorage`) e aplicado aos modelos. O usuário pode fechar ou recarregar a página e a assinatura se mantém.

3. **Temas e subtemas**  
   Escolha o tema → subtema → visualize os modelos.

4. **Copiar**  
   Botão para copiar texto da mensagem padrão personalizada pronta para ser colada no e-mail de resposta.

## Placeholders nos modelos

Com dados do cursista preenchidos, o script substitui:

| Placeholder | Origem | Aplicação |
|-------------|--------|-------|
| `(escreva seu nome)` | Campo `Assinatura` abaixo do menu lateral | Assinatura no texto do e-mail. |
| `Caro(a) cursista` | Campo `Nome` da mensagem do cursista | Saudação no texto do e-mail. |
|`[NOME DO CURSO]` | Campo `Curso turma` da mensagem do cursista | Aplicado na mensagem de "Curso encerrado" |
| `[DATA ENCERRAMENTO]` | Campo `Curso turma` da mensagem do cursista | Aplicado na mensagem de "Curso encerrado" |


---

**Exemplo de aplicação**

Mensagem cursista:

 ```
 Nome: Gabriel
 Curso turma: Desenho técnico 2024B
 ```

Mensagem gerada pela ferramenta:

> <br><u>Gabriel</u>, bem-vindo(a) ao Suporte da Plataforma Aprenda Mais!
>
> Ao verificarmos seu perfil, identificamos que o prazo para concluir o curso terminou em <u>**31/01/2025**</u>. Por isso, você não tem mais acesso às atividades.
>
> Você pode se inscrever de <u>**Desenho técnico**</u> já disponível e realizar novamente o curso.
>
> Atenciosamente,<br><u>Carlos</u><br><br>

<sup>*Sublinhados apenas para demonstrar as informações inseridas via script*</sup>



## Edição dos modelos e exportação do JSON

- Em cada resposta há **Editar**: abre o HTML em um **textarea** com quebras legíveis entre tags; ao **Salvar**, o HTML é **compactado** (sem espaços extras entre tags) e guardado no **localStorage** como ajuste sobre o JSON carregado.

   >Futuramente será implementado um editor HTML simples para facilitar a edição das respostas.

- **Baixar JSON** gera um `respostas.json` mesclado (base + edições locais) para substituir o arquivo na raiz do projeto e fazer **push** no Git.

   >Funcionalidade não faz sentido para o usuário (será removida)

- **Limpar edições** remove todos os overrides locais.
- Badge **editado — restaurar** desfaz só a edição atual.

<!-- Chaves no `localStorage`: `atendimento-aprendamais-nome` (assinatura), `atendimento-aprendamais-edits` (edições). -->

## Estrutura de `respostas.json`

- **`texto`:** versão em texto plano (markdown simples tratado na cópia); usada como `text/plain` na área de transferência e fallback se não houver HTML.
- **`texto_html`:** HTML do modelo; usado para exibir e para `text/html` na cópia quando existir.

## Arquivos principais

| Arquivo | Função |
|---------|--------|
| `index.html` | Página da aplicação (SAM). |
| `script.js` | Lógica: navegação, cursista, assinatura, cópia, edição, download do JSON. |
| `styles.css` | Estilos. |
| `respostas.json` | Dados dos temas, subtemas e respostas. |
| `respostas.md` | Arquivo com as respostas oficiais. Detalhado no subtítulo abaixo. |
| `gerar-respostas-md.py` | Script para gerar JSON a partir de `respostas.md`  |



## Entrada e edição das respostas

A entrada e a edição das respostas oficiais do serviço de suporte deve sempre ser feito no arquivo `respostas.md`, seguindo o roteiro abaixo:

1. Item de menu nível 1 → título nível 1
   > `# E-MAIL`
1. Item de menu nível 2 → título nível 2
   > `## Trocar e-mail • Não tem mais acesso`
1. Caso (texto em negrito acima da caixa de mensagem) → título nível 3
   > `### Enviar caso o cursista não envie documentos`
1. Texto da mensagem → Inserir dentro de um bloco de código após um título de nível 4 nomeado "HTML"
   > `#### HTML`
   >
   > ` ``` `
   >
   > `<!--- INSERIR AQUI O CÓDIGO HTML DA RESPOSTA --->`
   >
   > ` ``` `
1. Certifique-se de que `respostas.md` e `respostas.json` estão na pasta raiz do projeto.
1. Após a conclusão das edições, execute o script gerardor de respostas `python gerador-respostas-md.py` na pasta raiz do projeto.


## Possibilidades

### Integrar o serviço de e-mail

Uma idéia seria integrar o próprio serviço de e-mail a ferramenta. Isso poderia ser feito de três formas distintas

- Via IMAP/POP3
- Via Webhook
- Via API oficial do Outlook

A primeira seria a mais fácil e ainda assim está adequada as necessidades do projeto. Abaixo segue um resumo do ChatGPT:

---

### 1. IMAP/POP3

Uma abordagem simples para receber e-mails é utilizar **IMAP ou POP3** para consultar periodicamente uma caixa de entrada existente. A aplicação identifica novas mensagens, processa seu conteúdo e pode armazená-las no banco de dados. Entre as opções, **IMAP é a alternativa preferencial**, pois permite trabalhar com o estado das mensagens diretamente no servidor. O POP3 é mais simples, mas oferece menos recursos para gerenciamento da caixa de entrada.

**Vantagens**

* Implementação relativamente simples.
* Permite manter o endereço de e-mail existente.
* Baixo custo de infraestrutura.
* Não exige a adoção imediata de um serviço externo de recebimento de e-mails.
* Adequado para volumes moderados.

**Desvantagens**

* Depende de consultas periódicas (*polling*).
* O recebimento não é necessariamente em tempo real.
* É necessário tratar autenticação, conexões e falhas do servidor.
* O desempenho e os limites dependem do provedor de e-mail.

Para o volume estimado de **~200 e-mails por dia**, essa abordagem é suficiente e pode operar tranquilamente com uma infraestrutura simples. O limite prático não é determinado apenas pela quantidade diária de mensagens, mas também pelas políticas e limites de conexão do provedor.

**Stack sugerida**

| Componente  | Tecnologia            |
| ----------- | --------------------- |
| Backend     | Python + FastAPI      |
| Frontend    | React + Vite          |
| Database    | PostgreSQL / Supabase |
| Recebimento | IMAP (`imaplib`)      |
| Envio       | SMTP (`smtplib`)      |

O projeto pode começar com IMAP/SMTP e uma rotina Python responsável pela consulta da caixa de entrada. Caso futuramente seja necessário maior escala ou recebimento em tempo real, a arquitetura pode evoluir para uma solução baseada em **webhooks de serviços especializados em e-mail**.


---

### Integrar com o dossiê da plataforma

Uma outra idéia seria integrar ao próprio dossiê da plataforma e fazer esse processamento de forma integrada, dando agilidade ao processo.

Futuramente serão feitas pesquisas sobre essa possibilidade.



---



*Última edição: 16/09/2026*
