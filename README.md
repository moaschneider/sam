# Ferramenta de Modelos de Resposta – Suporte Aprenda Mais

Esta ferramenta ajuda a equipe a encontrar e copiar rapidamente os modelos de e-mail do Manual de Suporte, em vez de procurar no documento compartilhado.

## Como usar

1. **Abrir a ferramenta**  
   Abra o arquivo `atendimento-respostas.html` no navegador.

2. **Se os temas não carregarem**  
   Alguns navegadores bloqueiam o carregamento de arquivos locais. Nesse caso:
   - Abra um terminal/prompt na pasta **Suporte**.
   - Execute: `python -m http.server 8080`
   - No navegador acesse: **http://localhost:8080/atendimento-respostas.html**

3. **Fluxo**
   - **Passo 1:** Clique em um **tema** (ex.: "EXCLUIR conta").
   - **Passo 2:** Clique em um **subtema** (ex.: "Se a conta não foi confirmada" ou "Solicitação de excluir conta pelo sistema").
   - **Passo 3:** Veja o(s) modelo(s) de resposta e use **Copiar** para colar no e-mail (Ctrl+Shift+V para colar sem formatação, conforme o manual).

## Quando o Manual for atualizado

O manual é mantido no Google Docs e pode ser exportado/atualizado de tempos em tempos.

1. Atualize o arquivo do manual nesta pasta:
   - Mantenha uma cópia em **Markdown** (`.md`) com o mesmo nome base: `Manual Suporte - Atualizado - janeiro _ 2025.md` (ou atualize o nome no script, se preferir).
2. Na pasta **Suporte**, execute:
   ```bash
   python gerar_respostas.py
   ```
3. Recarregue a página `atendimento-respostas.html` no navegador.

O script lê o `.md`, extrai temas, subtemas e textos das tabelas de resposta e regera o arquivo `respostas.json`, que a página HTML utiliza.

### Opção gratuita: HTML exportado do Google Docs (com formatação)

**Sem API, sem Google Cloud, sem custo.** Basta exportar o documento como página da web e rodar o script no arquivo:

1. No Google Docs, abra o Manual de Suporte.
2. **Arquivo → Fazer download → Página da Web (.html)** e salve (ex.: `Manual Suporte.html`) na pasta do projeto.
3. Instale a dependência e execute:
   ```bash
   pip install -r requirements-html.txt
   python gerar_respostas_html.py
   ```
   Ou: `python gerar_respostas_html.py --arquivo "Manual Suporte.html" --saida respostas.json`
4. O script gera o mesmo `respostas.json` com **`texto`** e **`texto_html`**, preservando quebras de linha, negrito, cor e demais formatações do HTML exportado.

### Opção gratuita: DOCX exportado do Google Docs (com formatação, estrutura limpa)

**Recomendado se o HTML exportado estiver confuso.** O DOCX tem estrutura bem definida (títulos, tabelas) e o script preserva formatação:

1. No Google Docs, abra o Manual de Suporte.
2. **Arquivo → Fazer download → Microsoft Word (.docx)** e salve (ex.: `Manual Suporte.docx`) na pasta do projeto.
3. Instale a dependência e execute:
   ```bash
   pip install -r requirements-docx.txt
   python gerar_respostas_docx.py
   ```
   Ou: `python gerar_respostas_docx.py --arquivo "Manual Suporte.docx" --saida respostas.json`
4. O script gera o mesmo `respostas.json` com **`texto`** e **`texto_html`** (negrito, cor, quebras de linha). Use **Título 1** e **Título 2** no documento para temas e subtemas.

### Opção: buscar direto do Google Docs via API (com formatação)

Se quiser **puxar o manual direto do Google Docs** e **manter quebras de linha, recuos, negrito e cor** nas respostas:

1. **Google Cloud:** crie um projeto, ative a **Google Docs API**, crie uma **Service Account** e baixe o JSON de chave.
2. Coloque o arquivo de credenciais na pasta do projeto como `credentials.json` (ou use `--credenciais caminho/arquivo.json`).
3. **Compartilhe o documento do Google Docs** com o e-mail da service account (ex.: `xxx@projeto.iam.gserviceaccount.com`) dando permissão de **Visualizador**.
4. Instale as dependências e execute:
   ```bash
   pip install -r requirements-google-docs.txt
   python gerar_respostas_google_docs.py --url "https://docs.google.com/document/d/ID_DO_DOC/edit"
   ```
   Ou use `--doc-id ID_DO_DOC` em vez de `--url`.
5. O script gera o mesmo `respostas.json`, agora com o campo **`texto_html`** em cada resposta (além de `texto`), preservando formatação. A página pode usar esse campo para exibir e copiar com formatação.

## Arquivos

| Arquivo | Função |
|--------|--------|
| `atendimento-respostas.html` | Página com botões (tema → subtema) e “Copiar” para os modelos. |
| `respostas.json` | Dados extraídos do manual (gerado por um dos scripts). |
| `gerar_respostas.py` | Script que lê o Manual em `.md` e gera `respostas.json`. |
| `gerar_respostas_html.py` | **Gratuito.** Lê um HTML exportado do Google Docs (Fazer download → Página da Web) e gera `respostas.json` com `texto_html`. |
| `gerar_respostas_docx.py` | **Gratuito.** Lê um DOCX exportado (Fazer download → Microsoft Word). Estrutura limpa; preserva negrito, cor e quebras. |
| `gerar_respostas_google_docs.py` | Lê o Manual **direto do Google Docs (API)** e gera `respostas.json` com `texto_html`. Requer Google Cloud. |
| `requirements-html.txt` | Dependência para o script HTML (BeautifulSoup). |
| `requirements-docx.txt` | Dependência para o script DOCX (python-docx). |
| `requirements-google-docs.txt` | Dependências para o script do Google Docs (API). |
| `credentials.json` | (Opcional) Chave da Service Account do Google Cloud, para usar o script do Google Docs. |
| `Manual Suporte.html` | (Opcional) HTML exportado (Fazer download → Página da Web), fonte para `gerar_respostas_html.py`. |
| `Manual Suporte.docx` | (Opcional) DOCX exportado (Fazer download → Microsoft Word), fonte para `gerar_respostas_docx.py`. |
| `Manual Suporte - Atualizado - janeiro _ 2025.md` | Cópia do manual em Markdown (fonte dos dados para `gerar_respostas.py`). |

---

*Lembrete do manual: assine com seu nome no e-mail e use assunto [Suporte Aprenda Mais] quando aplicável.*
