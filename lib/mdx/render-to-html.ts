/**
 * Prepara HTML markup con estilos inline para Google Docs.
 * renderToStaticMarkup se debe usar SOLO en Route Handlers (/api).
 */

const BODY_STYLE = `
  font-family: Arial, sans-serif;
  font-size: 14pt;
  line-height: 1.15;
  color: #000;
  margin: 0;
  padding: 0;
`

const PARA_STYLE = `
  font-size: 14pt;
  line-height: 1.15;
  text-align: justify;
  margin-top: 0;
  margin-bottom: 12pt;
`

export function wrapHtmlContent(htmlContent: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      ${BODY_STYLE}
    }
    p {
      ${PARA_STYLE}
    }
    strong {
      font-weight: 700;
      color: #111;
    }
  </style>
</head>
<body>
${htmlContent}
</body>
</html>`
}

