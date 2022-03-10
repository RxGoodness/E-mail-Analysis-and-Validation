/**
 * Stretch goal - Validate all the emails in this files and output the report
 *
 * @param {string[]} inputPath An array of csv files to read
 * @param {string} outputFile The path where to output the report
 */
/* eslint-disable no-useless-escape */
import fs from 'fs';
import path from 'path';
import isValiddns from 'is-valid-domain';
import dns, { MxRecord } from 'dns';

interface ErrObj extends Error {
  errno?: number;
  code?: string;
  path?: string;
  syscall?: string;
  stack?: string;
}
// validate email records that can send and receive email//
// return true of
const validateMxRecord = async (domain: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    dns.resolveMx(domain, (err: ErrObj | null, addresses: MxRecord[]) => {
      if (err) {
        resolve(false);
      }
      resolve(true);
    });
  });
};

async function validatemailreal(emails: string[]) {
  // extract domain
  const domains: string[] = [];
  const userName: string[] = [];
  const checkedDomains = emails.map(async (value) => {
    const [username, domainName] = value.split('@');
    const checked = await validateMxRecord(domainName);
    const domain = `${username}@${domainName}`;
    return { checked, domain };
  });

  const resolvedDomains = await Promise.all(checkedDomains);
  const valid: string[] = [];
  resolvedDomains.forEach((item) => {
    const { checked, domain } = item;
    if (checked === true) valid.push(domain);
  });
  return valid;
}

// validate emails
const validateEmail = (emails: string[]) => {
  const re = /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/;
  const validEmail: string[] = [];
  emails.forEach((val) => {
    if (re.test(String(val).toLowerCase())) validEmail.push(val);
  });
  return validEmail;
};
async function validateEmailAddresses(inputPath: string[], outputFile: string) {
  const resolvePathin = path.join(`${inputPath}`, '');

  // readfile streams
  const data = new Promise((resolve, reject) => {
    const stream = fs.createReadStream(resolvePathin, { encoding: 'utf8' });
    stream.on('data', (val: string) => {
      if (val) resolve(val);
      else reject('Data not found');
    });
  });
  const email = JSON.stringify(await data).split('\\n');

  // validate email address structure
  const validEmailStructure = validateEmail(email);
  // email address that can send emails
  const validEmailMx = await validatemailreal(validEmailStructure);
  validEmailMx.unshift('Email');

  // write file to output
  const resolveOutPath = path.join(
    `${__dirname}/../../`,
    'report-validation.csv',
  );
  fs.writeFile(
    resolveOutPath,
    JSON.stringify(validEmailMx, null, 2),
    'utf8',
    (err) => {
      if (err) {
        console.log('An error occurred while writing JSON Object to File.');
        return console.log(err);
      }
      console.log('JSON file has been saved.');
    },
  );
}
validateEmailAddresses(
  [
    '/Users/decagon/Documents/Week4Task/week-4-node-010-RxGoodness/task-two/fixtures/inputs/small-sample.csv',
  ],
  'outputs',
);
export default validateEmailAddresses;
