(function () {
    const app = document.getElementById('app');
    const erroBox = document.getElementById('erro-box');
    const listaTemas = document.getElementById('lista-temas');
    const listaSubtemas = document.getElementById('lista-subtemas');
    const areaRespostas = document.getElementById('area-respostas');
    const passoTemas = document.getElementById('passo-temas');
    const passoSubtemas = document.getElementById('passo-subtemas');
    const passoRespostas = document.getElementById('passo-respostas');

    const STORAGE_KEY_ASSINATURA = 'atendimento-aprendamais-nome';

    let dados = { temas: [] };
    let temaAtual = null;
    let subtemaAtual = null;
    var temaIdx = -1;
    var subtemaIdx = -1;

    const STORAGE_KEY_EDITS = 'atendimento-aprendamais-edits';
    let nomeAssinatura = (function () {
      try {
        return localStorage.getItem(STORAGE_KEY_ASSINATURA) || '';
      } catch (e) {
        return '';
      }
    })();

    var nomeCursista = '';
    var cpfCursista = '';
    var emailCursista = '';
    var cursoCursista = '';
    var turmaCursista = '';

    const inputAssinatura = document.getElementById('input-assinatura');
    if (inputAssinatura) {
      inputAssinatura.value = nomeAssinatura;
      function salvarNome() {
        nomeAssinatura = inputAssinatura.value;
        try {
          localStorage.setItem(STORAGE_KEY_ASSINATURA, nomeAssinatura);
        } catch (e) {}
        if (subtemaAtual && !passoRespostas.classList.contains('oculto')) {
          renderRespostas();
        }
      }
      inputAssinatura.addEventListener('input', salvarNome);
      inputAssinatura.addEventListener('change', salvarNome);
    }

    var inputCursista = document.getElementById('input-cursista');
    var cursistaCamposEl = document.getElementById('cursista-campos');
    var cursistaNomeEl = document.getElementById('cursista-nome');
    var btnDossieCpf = document.getElementById('btn-dossie-cpf');
    var btnDossieEmail = document.getElementById('btn-dossie-email');

    /** Remove a palavra "turma", sufixo só ano ou ano+letras no fim (ex.: "2023", "2024 A"), normaliza espaços e capitaliza a primeira letra. */
    function normalizarNomeCurso(s) {
      if (!s) return '';
      s = s.replace(/\s*\bturma\b/gi, ' ');
      s = s.replace(/\s+\d{4}(?:\s*[A-Za-z]+)?\s*$/i, ' ');
      s = s.replace(/\s+/g, ' ').trim();
      s = s.replace(/[-–—]\s*$/g, '').trim();
      if (!s) return '';
      return s.charAt(0).toUpperCase() + s.slice(1);
    }

    function parseCursista(texto) {
      var campos = {};
      var linhas = texto.split('\n');
      var campoAtual = '';
      linhas.forEach(function (linha) {
        var match = linha.match(/^(Nome|Name|Email|Duvida|Assunto|Cpf|Cidade|Curso turma|Mensagem)\s*:\s*(.*)/i);
        if (match) {
          campoAtual = match[1].toLowerCase().replace(/\s+/g, '_');
          campos[campoAtual] = (match[2] || '').trim();
        } else if (campoAtual === 'mensagem' && linha.trim()) {
          campos[campoAtual] = (campos[campoAtual] ? campos[campoAtual] + '\n' : '') + linha;
        }
      });
      if (campos.curso_turma) {
        var ct = campos.curso_turma.trim();
        var mTurma = ct.match(/^(.+)\s+(\d{4})\s*([A-Za-z]+)\s*$/i);
        if (mTurma && mTurma[1].trim()) {
          campos.curso = normalizarNomeCurso(mTurma[1].trim());
          campos.turma = (mTurma[2] + mTurma[3]).replace(/\s+/g, '');
        } else {
          var mAno = ct.match(/^(.+)\s+(\d{4})\s*$/);
          if (mAno && mAno[1].trim()) {
            campos.curso = normalizarNomeCurso(mAno[1].trim());
            campos.turma = mAno[2];
          } else {
            campos.curso = normalizarNomeCurso(ct);
            campos.turma = '';
          }
        }
      }
      return campos;
    }

    if (inputCursista) {
      inputCursista.addEventListener('input', function () {
        var campos = parseCursista(this.value);
        var nomeCompleto = campos.nome || campos.name || '';
        var primeiroNome = (nomeCompleto.split(/\s+/)[0] || '').trim();
        nomeCursista = primeiroNome
          ? primeiroNome.charAt(0).toUpperCase() + primeiroNome.slice(1).toLowerCase()
          : '';
        cpfCursista = (campos.cpf || '').replace(/\D/g, '');
        emailCursista = (campos.email || '').trim();
        cursoCursista = (campos.curso || campos.curso_turma || '').trim();
        turmaCursista = (campos.turma || '').trim();

        var temAlgumDadoCursista = !!(nomeCursista || cpfCursista || emailCursista);
        if (temAlgumDadoCursista) {
          cursistaCamposEl.classList.remove('oculto');
        } else {
          cursistaCamposEl.classList.add('oculto');
        }
        cursistaNomeEl.textContent = nomeCursista || '';
        cursistaNomeEl.style.display = nomeCursista ? '' : 'none';
        btnDossieCpf.style.display = cpfCursista ? '' : 'none';
        btnDossieEmail.style.display = emailCursista ? '' : 'none';

        if (subtemaAtual && !passoRespostas.classList.contains('oculto')) {
          renderRespostas();
        }
      });
    }

    btnDossieCpf.addEventListener('click', function () {
      if (cpfCursista) {
        window.open('https://aprendamais.mec.gov.br/report/ifrs/dossie.php?cpf=' + encodeURIComponent(cpfCursista), '_blank');
      }
    });

    btnDossieEmail.addEventListener('click', function () {
      if (emailCursista) {
        window.open('https://aprendamais.mec.gov.br/report/ifrs/dossie.php?email=' + encodeURIComponent(emailCursista), '_blank');
      }
    });

    /**
     * A partir da turma (ex.: 2025A, 2024B), devolve a data de encerramento no formato dd/mm/aaaa.
     * Turma A: 31/07 do ano da turma. Turma B: 31/01 do ano seguinte ao da turma.
     */
    function dataEncerramentoPorTurma(turma) {
      if (!turma) return '';
      var m = String(turma).trim().replace(/\s+/g, '').match(/^(\d{4})([A-Za-z])/);
      if (!m) return turma;
      var ano = parseInt(m[1], 10);
      var letra = m[2].toUpperCase();
      if (letra === 'A') {
        return '31/07/' + ano;
      }
      if (letra === 'B') {
        return '31/01/' + (ano + 1);
      }
      return '';
    }

    /** Substitui "(escreva seu nome)", "Caro(a) aluno(a)" e "[NOME DO CURSO]" pelos nomes correspondentes. */
    function aplicarAssinatura(str) {
      if (!str) return str;
      var nome = nomeAssinatura ? nomeAssinatura.trim() : '(escreva seu nome)';
      str = str.replace(/\(escreva seu nome\)/gi, nome);
      
      if (nomeCursista) {
        str = str.replace(/Caro\(a\) aluno\(a\)/g, nomeCursista);
      }
      
      if (cursoCursista) {
        str = str.replace(/\[NOME DO CURSO\]/gi, cursoCursista);
      }
      var dataEnc = dataEncerramentoPorTurma(turmaCursista);
      if (dataEnc) {
        str = str.replace(/\[DATA ENCERRAMENTO\]/gi, dataEnc);
      }
      return str;
    }

    /** Formata HTML para exibição no editor (quebras entre tags). */
    function formatarHtmlParaEdicao(html) {
      if (!html) return '';
      return html.replace(/></g, '>\n\n<');
    }

    /** Remove espaços/quebras entre tags para não afetar o layout ao salvar. */
    function compactarHtml(html) {
      if (!html) return '';
      return html.replace(/\s*>\s*<\s*/g, '><').trim();
    }

    /** Converte markdown simples em texto (links viram URL entre parênteses). */
    function textoParaColar(texto) {
      if (!texto) return '';
      return texto
        .replace(/\\\./g, '.')
        .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '$1 ($2)')
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/\*([^*]+)\*/g, '$1')
        .trim();
    }

    function mostrarErro() {
      app.classList.add('oculto');
      erroBox.classList.remove('oculto');
    }

    function carregarEdits() {
      try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY_EDITS)) || {};
      } catch (e) {
        return {};
      }
    }

    function salvarEdit(chave, obj) {
      var edits = carregarEdits();
      edits[chave] = obj;
      try {
        localStorage.setItem(STORAGE_KEY_EDITS, JSON.stringify(edits));
      } catch (e) {}
      atualizarToolbar();
    }

    function removerEdit(chave) {
      var edits = carregarEdits();
      delete edits[chave];
      try {
        localStorage.setItem(STORAGE_KEY_EDITS, JSON.stringify(edits));
      } catch (e) {}
      atualizarToolbar();
    }

    var btnDownload = document.getElementById('btn-download-json');
    var btnLimparEdits = document.getElementById('btn-limpar-edits');

    function atualizarToolbar() {
      var edits = carregarEdits();
      var temEdits = Object.keys(edits).length > 0;
      btnLimparEdits.style.display = temEdits ? '' : 'none';
    }

    function baixarJson() {
      var edits = carregarEdits();
      var copia = JSON.parse(JSON.stringify(dados));
      Object.keys(edits).forEach(function (chave) {
        var p = chave.split('.');
        var ti = parseInt(p[0], 10);
        var si = parseInt(p[1], 10);
        var ri = parseInt(p[2], 10);
        if (copia.temas[ti] &&
            copia.temas[ti].subtemas[si] &&
            copia.temas[ti].subtemas[si].respostas[ri]) {
          var resp = copia.temas[ti].subtemas[si].respostas[ri];
          if (edits[chave].texto) resp.texto = edits[chave].texto;
          if (edits[chave].texto_html) resp.texto_html = edits[chave].texto_html;
        }
      });
      var blob = new Blob([JSON.stringify(copia, null, 2)], { type: 'application/json' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'respostas.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    btnDownload.addEventListener('click', baixarJson);

    btnLimparEdits.addEventListener('click', function () {
      if (!confirm('Remover todas as edições locais e restaurar os textos originais?')) return;
      try {
        localStorage.removeItem(STORAGE_KEY_EDITS);
      } catch (e) {}
      atualizarToolbar();
      if (subtemaAtual && !passoRespostas.classList.contains('oculto')) {
        renderRespostas();
      }
    });

    function renderTemas() {
      listaTemas.innerHTML = '';
      passoTemas.classList.remove('oculto');
      passoSubtemas.classList.add('oculto');
      passoRespostas.classList.add('oculto');
      temaAtual = null;
      subtemaAtual = null;
      temaIdx = -1;
      subtemaIdx = -1;

      dados.temas.forEach(function (t, idx) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn btn-tema';
        btn.textContent = t.titulo;
        btn.addEventListener('click', function () {
          temaAtual = t;
          temaIdx = idx;
          renderSubtemas();
        });
        listaTemas.appendChild(btn);
      });
    }

    function renderSubtemas() {
      listaSubtemas.innerHTML = '';
      passoTemas.classList.add('oculto');
      passoSubtemas.classList.remove('oculto');
      passoRespostas.classList.add('oculto');
      subtemaAtual = null;
      subtemaIdx = -1;

      (temaAtual.subtemas || []).forEach(function (s, idx) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn btn-subtema';
        btn.textContent = s.titulo;
        btn.addEventListener('click', function () {
          subtemaAtual = s;
          subtemaIdx = idx;
          renderRespostas();
        });
        listaSubtemas.appendChild(btn);
      });
    }

    function renderRespostas() {
      areaRespostas.innerHTML = '';
      passoRespostas.classList.remove('oculto');
      passoSubtemas.classList.add('oculto');

      var respostas = subtemaAtual.respostas || [];
      if (respostas.length === 0) {
        areaRespostas.innerHTML = '<p>Nenhum modelo cadastrado para este subtema.</p>';
        return;
      }

      var edits = carregarEdits();

      respostas.forEach(function (r, i) {
        var chave = temaIdx + '.' + subtemaIdx + '.' + i;
        var editado = edits[chave];
        var textoHtmlRaw = editado ? editado.texto_html : (r.texto_html || '');
        var textoRaw = editado ? editado.texto : (r.texto || '');

        var block = document.createElement('div');
        block.className = 'resposta-block';

        if (r.rotulo) {
          var rotulo = document.createElement('div');
          rotulo.className = 'resposta-rotulo';
          rotulo.textContent = r.rotulo.replace(/\*\*/g, '');
          block.appendChild(rotulo);
        }

        var textoPlain = textoParaColar(textoRaw);
        var textoHtml = textoHtmlRaw;
        textoPlain = aplicarAssinatura(textoPlain);
        textoHtml = aplicarAssinatura(textoHtml);

        var textoEl = document.createElement('div');
        textoEl.className = 'resposta-texto';
        if (textoHtml) {
          textoEl.innerHTML = textoHtml;
        } else {
          textoEl.textContent = textoPlain;
        }
        block.appendChild(textoEl);

        var acoes = document.createElement('div');
        acoes.className = 'resposta-acoes';

        var btnCopiar = document.createElement('button');
        btnCopiar.type = 'button';
        btnCopiar.className = 'btn btn-copiar';
        btnCopiar.textContent = 'Copiar';
        btnCopiar.dataset.texto = textoPlain;
        btnCopiar.dataset.textoHtml = textoHtml;
        btnCopiar.addEventListener('click', function () {
          var txt = this.dataset.texto;
          var htm = this.dataset.textoHtml;
          function mostrarCopiado() {
            btnCopiar.textContent = 'Copiado!';
            btnCopiar.classList.add('copied');
            setTimeout(function () {
              btnCopiar.textContent = 'Copiar';
              btnCopiar.classList.remove('copied');
            }, 2000);
          }
          if (htm && navigator.clipboard && navigator.clipboard.write) {
            var bPlain = new Blob([txt], { type: 'text/plain' });
            var bHtml = new Blob([htm], { type: 'text/html' });
            navigator.clipboard.write([
              new ClipboardItem({ 'text/plain': bPlain, 'text/html': bHtml })
            ]).then(mostrarCopiado).catch(function () {
              navigator.clipboard.writeText(txt).then(mostrarCopiado);
            });
          } else {
            navigator.clipboard.writeText(txt).then(mostrarCopiado);
          }
        });
        acoes.appendChild(btnCopiar);

        var editTextarea = null;

        var btnEditar = document.createElement('button');
        btnEditar.type = 'button';
        btnEditar.className = 'btn btn-editar';
        btnEditar.textContent = 'Editar';
        btnEditar.addEventListener('click', function () {
          editTextarea = document.createElement('textarea');
          editTextarea.className = 'edit-textarea';
          editTextarea.value = formatarHtmlParaEdicao(textoHtmlRaw || textoRaw);
          textoEl.style.display = 'none';
          block.insertBefore(editTextarea, acoes);
          editTextarea.style.height = editTextarea.scrollHeight + 'px';
          editTextarea.focus();
          btnCopiar.style.display = 'none';
          btnEditar.style.display = 'none';
          btnSalvar.style.display = '';
          btnCancelar.style.display = '';
          if (badge) badge.style.display = 'none';
        });
        acoes.appendChild(btnEditar);

        var btnSalvar = document.createElement('button');
        btnSalvar.type = 'button';
        btnSalvar.className = 'btn btn-salvar-edicao';
        btnSalvar.textContent = 'Salvar';
        btnSalvar.style.display = 'none';
        btnSalvar.addEventListener('click', function () {
          var novoHtml = compactarHtml(editTextarea.value);
          var temp = document.createElement('div');
          temp.innerHTML = novoHtml;
          var novoTexto = temp.textContent.trim();
          salvarEdit(chave, { texto_html: novoHtml, texto: novoTexto });
          renderRespostas();
        });
        acoes.appendChild(btnSalvar);

        var btnCancelar = document.createElement('button');
        btnCancelar.type = 'button';
        btnCancelar.className = 'btn btn-cancelar-edicao';
        btnCancelar.textContent = 'Cancelar';
        btnCancelar.style.display = 'none';
        btnCancelar.addEventListener('click', function () {
          renderRespostas();
        });
        acoes.appendChild(btnCancelar);

        var badge = null;
        if (editado) {
          badge = document.createElement('span');
          badge.className = 'badge-editado';
          badge.textContent = 'editado — restaurar';
          badge.title = 'Clique para restaurar o texto original';
          badge.addEventListener('click', function () {
            removerEdit(chave);
            renderRespostas();
          });
          acoes.appendChild(badge);
        }

        block.appendChild(acoes);
        areaRespostas.appendChild(block);
      });
    }

    document.getElementById('btn-voltar-temas').addEventListener('click', renderTemas);
    document.getElementById('btn-voltar-subtemas').addEventListener('click', renderSubtemas);

    fetch('respostas.json')
      .then(function (r) {
        if (!r.ok) throw new Error('Arquivo não encontrado');
        return r.json();
      })
      .then(function (json) {
        dados = json;
        if (!dados.temas || dados.temas.length === 0) {
          mostrarErro();
          return;
        }
        atualizarToolbar();
        renderTemas();
      })
      .catch(function () {
        mostrarErro();
      });
  })();