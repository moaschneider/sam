#!/usr/bin/env python3
# -*- coding: utf-8 -*-


import os
from pathlib import Path
import re
import json
import html as html_lib

def clear():
  os.system('cls' if os.name == 'nt' else 'clear')

clear()


def normalizar_texto(texto: str) -> str:
  return re.sub(r"\s+", " ", texto).strip()


def html_para_texto(html_texto: str) -> str:
  texto = html_lib.unescape(html_texto)
  texto = re.sub(r"<br\s*/?>", "\n", texto, flags=re.I)
  texto = re.sub(r"</p>|</li>|</ol>|</ul>|</div>|</h[1-6]>", "\n", texto, flags=re.I)
  texto = re.sub(r"<[^>]+>", " ", texto)
  texto = texto.replace("\xa0", " ")
  texto = re.sub(r"\s+", " ", texto)
  return texto.strip()


def gerar_id_titulo(titulo: str) -> str:
  texto = re.sub(r"[^A-Za-z0-9]", "", titulo.upper())
  return texto[:4] if texto else "GEN"


def parsear_manual(caminho: Path) -> dict:
  estrutura = {"temas": []}
  tema_atual = None
  subtema_atual = None
  caso_atual = None
  em_bloco_html = False
  bloco_html = []

  def novo_caso(titulo=None):
    nonlocal subtema_atual
    if subtema_atual is None:
      return None
    caso = {
      "id": subtema_atual["id"] * 10 + len(subtema_atual["respostas"]) + 1,
      "rotulo": titulo,
      "texto": "",
      "texto_html": ""
    }
    subtema_atual["respostas"].append(caso)
    return caso

  with open(caminho, "r", encoding="utf-8") as f:
    for linha in f:
      s = linha.strip()

      if not s:
        continue

      if em_bloco_html:
        if s == "```":
          html_raw = "\n".join(bloco_html).strip()
          if caso_atual is not None:
            caso_atual["texto_html"] = html_raw
            caso_atual["texto"] = html_para_texto(html_raw)
          em_bloco_html = False
          bloco_html = []
          caso_atual = None
        else:
          bloco_html.append(s)
        continue

      # Filtra linhas que são títulos (começam com #, ##, ###, ####)
      m = re.match(r"^(#{1,6})\s+(.*)$", s)
      # print(f"m ---> {m}")
      if m:
        nivel = len(m.group(1))
        # print(f"nivel ---> {nivel}")
        titulo = normalizar_texto(m.group(2))
        # print(f"titulo ---> {titulo}")

        if nivel == 1:
          tema_atual = {
            "id": gerar_id_titulo(titulo),
            "titulo": titulo,
            "subtemas": []
          }
          estrutura["temas"].append(tema_atual)
          subtema_atual = None
          caso_atual = None
          continue

        if nivel == 2:
          if tema_atual is None:
            continue

          # print(f"--> len(tema_atual[\"subtemas\"]) = {len(tema_atual["subtemas"])}")
          # print(f"--> len(tema_atual[\"subtemas\"]) = {len(tema_atual["subtemas"]) + 1}")
          subtema_atual = {
            "id": len(tema_atual["subtemas"]) + 1,
            "titulo": titulo,
            "respostas": []
          }
          tema_atual["subtemas"].append(subtema_atual)
          caso_atual = None
          continue

        if nivel == 3:
          if subtema_atual is None:
            continue
          if caso_atual is not None and caso_atual["rotulo"] in (None, "") and not caso_atual["texto"] and not caso_atual["texto_html"]:
            caso_atual["rotulo"] = titulo
          else:
            caso_atual = novo_caso(titulo)
          continue

        if nivel == 4 and titulo.lower() in {"html", "resposta padrão"}:
          if subtema_atual is not None and caso_atual is None:
            caso_atual = novo_caso(None)
          continue

        continue

      if s.startswith("```"):
        if subtema_atual is not None and caso_atual is None:
          caso_atual = novo_caso(None)
        em_bloco_html = True
        bloco_html = []
        # print(f"---> bloco_html = {bloco_html}")
        continue

      texto = normalizar_texto(s)

      if caso_atual is not None:
        if caso_atual["texto"]:
          caso_atual["texto"] += " " + texto
        else:
          caso_atual["texto"] = texto
        if not caso_atual["texto_html"]:
          caso_atual["texto_html"] = f"<p>{texto}</p>"
      elif subtema_atual is not None:
        caso = {
          "id": subtema_atual["id"] * 10 + len(subtema_atual["respostas"]) + 1,
          "rotulo": None,
          "texto": texto,
          "texto_html": f"<p>{texto}</p>"
        }
        subtema_atual["respostas"].append(caso)

  return estrutura


def main():
  base = Path(__file__).resolve().parent
  arquivorespostas = "respostas.md"
  manual = base / arquivorespostas
  if not manual.exists():
    print(f"Arquivo não encontrado: {manual}")
    return 1
  estrutura = parsear_manual(manual)
  arquivofinal = "respostas.json"
  out = base / arquivofinal
  with open(out, "w", encoding="utf-8") as f:
    json.dump(estrutura, f, ensure_ascii=False, indent=2)
  print(f"\nGerado '{arquivofinal}' com {len(estrutura['temas'])} temas.\n")
  return 0



if __name__ == "__main__":
  exit(main())