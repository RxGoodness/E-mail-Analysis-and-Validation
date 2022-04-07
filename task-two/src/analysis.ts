/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-useless-escape */
import fs from 'fs';
import path from 'path';
import isValiddns from 'is-valid-domain';
import dns, { MxRecord } from 'dns';

/**
 * First task - Read the csv files in the inputPath and analyse them
 *
 * @param {string[]} inputPaths An array of csv files to read
 * @param {string} outputPath The path to output the analysis
 *
 */
interface ErrObj extends Error {
  errno?: number;
  code?: string;
  path?: string;
  syscall?: string;
  stack?: string;
}
// check dns structure
const isValidDnsStructure = (domains: string[]) => {
  const validDomains: any = [];
  domains.forEach((eachValue) => {
    if (isValiddns(eachValue)) validDomains.push(eachValue);
  });
  return validDomains;
};
// // check dns
const validateDns = async (domain: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    dns.lookup(domain, (err: any, addresses: any) => {
      if (err) {
        resolve(false);
      }
      resolve(true);
    });
  });
};
async function validateDnsrecord(domains: string[]) {
  const checkedDomains = domains.map(async (domain) => {
    const checked = await validateDns(domain);
    return { checked, domain };
  });
  const resolvedDomains = await Promise.all(checkedDomains);
  const valid: string[] = [];
  resolvedDomains.forEach((item) => {
    if (item.checked === true) valid.push(item.domain);
  });
  return valid;
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
async function validatemailreal(domains: string[]) {
  const checkedDomains = domains.map(async (domain) => {
    const checked = await validateMxRecord(domain);
    return { checked, domain };
  });
  const resolvedDomains = await Promise.all(checkedDomains);
  const valid: string[] = [];
  resolvedDomains.forEach((item) => {
    if (item.checked === true) valid.push(item.domain);
  });
  return valid;
}
// validate emails
const validateEmail = (emails: string[]) => {
  const re = /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/;
  const validEmail: string[] = [];
  emails.forEach((eachValue) => {
    if (re.test(String(eachValue).toLowerCase())) validEmail.push(eachValue);
  });
  return validEmail;
};
// main work
async function analyseFiles(inputPaths: string[], outputPath: string) {
  const resolvePath = path.join(`${inputPaths}`, '');

  const data = new Promise((resolve, reject) => {
    const stream = fs.createReadStream(resolvePath, { encoding: 'utf8' });
    stream.on('data', (eachValue: string) => {
      if (eachValue) resolve(eachValue);
      else reject('Data not found');
    });
  });

  const email = await data;
  console.log(email)
  const emailArr = JSON.stringify(email).split("\\n");
  console.log(emailArr);
  emailArr.shift();
  emailArr.shift();

  // validate email
  const validEmails = validateEmail(emailArr);
  const validEmailswithMX = await validatemailreal(validEmails);

  // extract domain
  let domains: string[] = [];
  const userName: string[] = [];
  emailArr.forEach((eachValue) => {
    const [uname, dname] = eachValue.split('@');
    domains.push(dname);
  });
  domains = domains.sort();

  // domain category analysis
  const domainKey: any = {};
  isValidDnsStructure(domains).forEach((eachValue: string) => {
    if (domainKey[eachValue]) domainKey[eachValue] += 1;
    else if (!domainKey[eachValue]) domainKey[eachValue] = 1;
  });

  // uniques domain
  const dnsData = new Set(domains);
  const dnsSpreaded = [...dnsData];
  // validate domains
  const newvaldns = await validateDnsrecord(dnsSpreaded);
  // write report
  const resultOutput = {
    'valid-domains': newvaldns,
    totalEmailsParsed: emailArr.length,
    totalValidEmails: validEmails.length,
    categories: domainKey,
  };
  const resolveOutPath = path.join(`${outputPath}`, '');
  fs.writeFile(
    resolveOutPath,
    JSON.stringify(resultOutput, null, 2),
    'utf8',
    (err) => {
      if (err) {
        return "There is an error somewhere"
      }
    },
  );
  return resultOutput;
}
analyseFiles(
  [
    '/Users/decagon/Documents/Week4Task/week-4-node-010-RxGoodness/task-two/fixtures/inputs/small-sample.csv',
  ],
  'Toheeb.json',
);
export default analyseFiles;
