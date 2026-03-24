# SAM – Suporte Aprenda Mais

Aplicação web para localizar modelos de e-mail do Manual de Suporte, personalizar texto com dados do cursista e, quando necessário, editar o conteúdo e exportar o `respostas.json` para o repositório (ex.: deploy na Vercel).

## Como abrir

1. **Página principal:** `index.html` (carrega `styles.css` e `script.js`).
2. **Servidor local (recomendado):** muitos navegadores bloqueiam `fetch` em `file://`. Na pasta do projeto:
   ```bash
   python -m http.server 8080
   ```
   Acesse: **http://localhost:8080/index.html**


## Fluxo de uso

1. **Dados do cursista (opcional)**  
   Cole no campo superior o texto no formato dos e-mails (campos como `Nome`, `Email`, `Cpf`, `Curso turma`, `Mensagem`, etc.). A aplicação interpreta os campos e pode:
   - usar o **primeiro nome** no lugar de `Caro(a) aluno(a)`;
   - preencher **assinatura** com `(escreva seu nome)` a partir do campo de assinatura;
   - abrir **Dossiê CPF** e **Dossiê E-mail** (links do MEC) quando houver CPF/e-mail;
   - extrair **curso** e **turma** a partir de `Curso turma` (ver abaixo).

2. **Assinatura**  
   Campo salvo no navegador (`localStorage`) e aplicado aos modelos.

3. **Temas e subtemas**  
   Escolha o tema → subtema → visualize os modelos.

4. **Copiar**  
   Copia texto plano e HTML quando o modelo tem `texto_html` (útil para colar em clientes de e-mail com formatação).

## Placeholders nos modelos (`respostas.json`)

Com dados do cursista preenchidos, o script substitui:

| Placeholder | Origem |
|-------------|--------|
| `(escreva seu nome)` | Campo **Assinatura** |
| `Caro(a) aluno(a)` | Primeiro nome (campo **Nome**) |
| `[NOME DO CURSO]` | Nome do curso normalizado (sem “turma”, sem sufixo de ano/turma no final) |
| `[DATA ENCERRAMENTO]` | Calculado a partir da **turma** (ex.: `2025A` → `31/07/2025`; `2024B` → `31/01/2025`). Turma só com ano (ex.: `2023`) não gera data. |

### Campo “Curso turma”

- Remove a palavra **turma** e capitaliza a primeira letra do nome do curso.
- Se no **final** houver **ano + letra(s)** (`2025B`, `2024 A`, etc.), separa em `curso` e `turma` (compacto, ex.: `2024A`).
- Se no **final** houver **só o ano** (`Epidemiologia turma 2023`), o curso fica **Epidemiologia** e a turma **`2023`**.

## Edição dos modelos e exportação do JSON

- Em cada resposta há **Editar**: abre o HTML em um **textarea** com quebras legíveis entre tags; ao **Salvar**, o HTML é **compactado** (sem espaços extras entre tags) e guardado no **localStorage** como ajuste sobre o JSON carregado.
   
   >Futuramente será implementado um editor HTML simples para facilitar a edição das respostas.

- **Baixar JSON** gera um `respostas.json` mesclado (base + edições locais) para substituir o arquivo na raiz do projeto e fazer **push** no Git.
- **Limpar edições** remove todos os overrides locais.
- Badge **editado — restaurar** por resposta desfaz só aquela edição.

Chaves no `localStorage`: `atendimento-aprendamais-nome` (assinatura), `atendimento-aprendamais-edits` (edições).

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

## Atualizar o conteúdo a partir do Manual

O arquivo base das respostas pode ser obtido a partir do manual mantido no Google Docs. Para regerar `respostas.json` utilizar as indicações abaixo:

- **DOCX:** `gerar_respostas_docx.py` + `requirements-docx.txt` (Título 1 = tema, Título 2 = subtema).