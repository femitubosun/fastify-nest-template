const { readFile, writeFile, rm } = require('fs/promises');
const { join } = require('path');
const prettier = require('prettier');
const glob = require('glob');

const names = [
  'InputJsonValueSchema',
  'JsonNullValueFilterSchema',
  'JsonNullValueInputSchema',
  'JsonValueSchema',
  'NullableJsonNullValueInputSchema',
];

async function handleFile(filePath) {
  // If the file name matches one of the names we want to remove, then delete the file
  if (names.some((name) => filePath.includes(name))) {
    await rm(filePath);
    return;
  }

  const fileContents = await readFile(filePath, 'utf-8');

  const lines = fileContents.split('\n');

  let blocking = false;
  const newLines = [];

  for (const line of lines) {
    let push = true;
    // If a line includes one of the names, skip it
    if (names.some((name) => line.includes(name))) {
      push = false;
    }
    if (push && !blocking) {
      newLines.push(line);
    }
  }

  let text = newLines.join('\n');

  // replace all z.string().cuid() with z.string()
  text = text.replace(/z\.string\(\)\.cuid\(\)/g, 'z.string()');

  text = await prettier.format(text, { parser: 'typescript' });

  await writeFile(filePath, text); // Directly writing the formatted text
}

async function exportAllTypes() {
  // Fix the index.ts of src/inputTypeSchemas by exporting all (*) from all files in the directory
  const files = glob.sync(
    join(
      __dirname,
      '..',
      'src/infrastructure/prisma/__defs__/inputTypeSchemas',
      '*.ts',
    ),
  );

  const lines = [];

  for (const file of files) {
    // Ignore index.ts
    if (file.includes('index.ts')) {
      continue;
    }

    const fileName = file.split('/').pop().split('.')[0];
    lines.push(`export * from './${fileName}';`);
  }

  const text = lines.join('\n');

  await writeFile(
    join(
      __dirname,
      '..',
      'src/infrastructure/prisma/__defs__/inputTypeSchemas/index.ts',
    ),
    await prettier.format(text, { parser: 'typescript' }),
  );
}

async function main() {
  // Get every file in the src directory (recursively)
  const files = glob.sync(
    join(
      __dirname,
      '..',
      'src',
      'infrastructure',
      'prisma',
      '__defs__',
      '**/*.ts',
    ),
  );

  // Handle each file
  for (const file of files) {
    await handleFile(file);
  }

  await exportAllTypes();
}

main();
