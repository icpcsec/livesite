export const printBanner = () => {
  console.log(
    ' _     _           _____ _ _       \n' +
    '| |   (_)         /  ___(_) |      \n' +
    '| |    ___   _____\\ `--. _| |_ ___ \n' +
    '| |   | \\ \\ / / _ \\`--. \\ | __/ _ \\\n' +
    '| |___| |\\ V /  __/\\__/ / | ||  __/\n' +
    '\\_____/_| \\_/ \\___\\____/|_|\\__\\___|\n' +
    '\n' +
    '  Authored by @nya3jp\n' +
    '  Presented by ICPC Secretaries'
  );
  console.log('Tips: Interested in scraping the standings? Just periodically save /api/standings.json. Please make sure to (1) handle HTTP redirects (2) limit access rate to more than 10 seconds.');
};
