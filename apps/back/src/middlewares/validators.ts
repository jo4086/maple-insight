export function getValidatedApiKeys(RequiredAPIKeyMap: { [key: string]: string }): {
  [key: string]: string;
} {
  const missingKeys = Object.keys(RequiredAPIKeyMap).filter(
    (key) => !process.env[RequiredAPIKeyMap[key]],
  );

  if (missingKeys.length > 0) {
    const errorDetails = missingKeys
      .map((key) => `${key} (env: ${RequiredAPIKeyMap[key]})`)
      .join(', ');

    throw new Error(`Missing required enviroment variables: ${errorDetails}`);
  }

  return Object.fromEntries(
    Object.keys(RequiredAPIKeyMap).map((key) => [
      key,
      process.env[RequiredAPIKeyMap[key]] as string,
    ]),
  );
}
