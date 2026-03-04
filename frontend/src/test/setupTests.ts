import '@testing-library/jest-dom';

process.on('unhandledRejection', (reason) => {
  const msg =
    reason instanceof Error ? reason : new Error(`UnhandledRejection: ${JSON.stringify(reason)}`);

  throw msg;
});
