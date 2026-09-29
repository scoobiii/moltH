import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import fg from "fast-glob";
import ts from "typescript";
import policy from "../coverage.policy.json";

const sourceFiles = fg.sync("src/**/*.{ts,tsx}", {
  onlyFiles: true,
  ignore: ["**/*.test.{ts,tsx}"],
});

const excludedFiles = new Set(
  Object.keys(policy.excluded).flatMap((pattern) =>
    fg.sync(pattern, { onlyFiles: true }),
  ),
);

const isTypeOnly = (file: string) => {
  const source = ts.createSourceFile(
    file,
    readFileSync(file, "utf8"),
    ts.ScriptTarget.Latest,
    true,
  );

  return source.statements.every((statement) => {
    if (
      ts.isInterfaceDeclaration(statement) ||
      ts.isTypeAliasDeclaration(statement)
    ) {
      return true;
    }

    if (ts.isImportDeclaration(statement)) {
      return statement.importClause?.isTypeOnly === true;
    }

    if (ts.isExportDeclaration(statement)) {
      return statement.isTypeOnly;
    }

    return false;
  });
};

const classificationCount = (file: string) => {
  const categories = [
    policy.gate.includes(file),
    file in policy.pending,
    excludedFiles.has(file),
  ];
  return categories.filter(Boolean).length;
};

describe("coverage policy", () => {
  it("gate aponta somente para arquivos existentes", () => {
    for (const file of policy.gate) {
      expect(existsSync(file), file).toBe(true);
    }
  });

  it("pending aponta somente para arquivos existentes", () => {
    for (const file of Object.keys(policy.pending)) {
      expect(existsSync(file), file).toBe(true);
    }
  });

  it("excluded exige reason e owner", () => {
    for (const [pattern, value] of Object.entries(policy.excluded)) {
      expect(value.reason?.trim(), pattern).toBeTruthy();
      expect(value.owner?.trim(), pattern).toBeTruthy();
      expect(fg.sync(pattern, { onlyFiles: true }), pattern).not.toEqual([]);
    }
  });

  it("nenhum arquivo de produção pertence a mais de uma classificação", () => {
    const overlaps = sourceFiles.filter((file) => classificationCount(file) > 1);
    expect(overlaps).toEqual([]);
  });

  it("todo arquivo de src está classificado", () => {
    const unclassified = sourceFiles.filter((file) => {
      if (file.endsWith("/types.ts") && isTypeOnly(file)) return false;
      return classificationCount(file) !== 1;
    });

    expect(unclassified).toEqual([]);
  });

  it("types.ts com código de runtime não escapa da cobertura", () => {
    const bad = sourceFiles.filter(
      (file) =>
        file.endsWith("/types.ts") &&
        !isTypeOnly(file) &&
        classificationCount(file) === 0,
    );

    expect(bad).toEqual([]);
  });
});
