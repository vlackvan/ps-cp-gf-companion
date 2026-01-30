import * as vscode from "vscode";

export interface DiagnosticInfo {
  severity: "error" | "warning" | "information" | "hint";
  message: string;
  range: [[number, number], [number, number]];
}

function severityToString(
  severity: vscode.DiagnosticSeverity
): DiagnosticInfo["severity"] {
  switch (severity) {
    case vscode.DiagnosticSeverity.Error:
      return "error";
    case vscode.DiagnosticSeverity.Warning:
      return "warning";
    case vscode.DiagnosticSeverity.Information:
      return "information";
    case vscode.DiagnosticSeverity.Hint:
      return "hint";
    default:
      return "information";
  }
}

export function getDiagnostics(
  editor?: vscode.TextEditor
): DiagnosticInfo[] | undefined {
  if (editor == null) {
    return undefined;
  }

  const diagnostics = vscode.languages.getDiagnostics(editor.document.uri);

  return diagnostics.map((diagnostic) => ({
    severity: severityToString(diagnostic.severity),
    message: diagnostic.message,
    range: [
      [diagnostic.range.start.line, diagnostic.range.start.character],
      [diagnostic.range.end.line, diagnostic.range.end.character],
    ],
  }));
}
